'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch, type FieldPath } from 'react-hook-form';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import type { CatalogCategory } from '@/services/catalog';
import { catalogService } from '@/services/catalog';
import type { CreateSellerProductStatus, ProductBrand } from '@/services/product';
import { sellerProductService } from '@/services/product';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { PRODUCT_CREATE_STEPS } from '../constants/product-create-steps.constant';
import { initialSellerProductCreateValues, sellerProductCreateSchema } from '../schemas/seller-product-create.schema';
import type {
    ProductCreateAttributeValue,
    SellerProductCreateFormValues,
    SellerProductCreateReferences,
} from '../types/seller-product-create-form.type';
import type {
    ProductCreateStepId,
    ProductCreateStepValidations,
} from '../types/product-create-step.type';
import { buildProductVariants } from '../utils/product-variant.util';
import {
    getProductCreateStepValidations,
    validateDynamicAttributes,
} from '../utils/product-create-validation';
import {
    toCreateSellerProductPayload,
    toUpdateSellerProductPayload,
} from '../utils/seller-product-payload.mapper';
import { toSellerProductEditFormValues } from '../utils/seller-product-edit.mapper';
import { useSellerProductDetail } from '../../product-detail/hooks/useSellerProductDetail';
import {
    clearProductEditorDraft,
    readProductEditorDraft,
    saveProductEditorDraft,
} from '../utils/product-editor-draft';

export type ProductSubmitAction = CreateSellerProductStatus | 'UPDATE';

// Tạo object mới cho từng thuộc tính để các mảng selectedOptionIds không dùng chung một reference.
// Nếu tái sử dụng một object cố định, thao tác chọn option ở một field có thể làm thay đổi field khác.
function createEmptyAttributeValue(): ProductCreateAttributeValue {
    return {
        selectedOptionIds: [],
        valueText: '',
        valueNumber: '',
        valueBoolean: null,
    };
}

// Chỉ các field của bước hiện tại được trigger khi người dùng bấm “Tiếp tục”.
// Các bước còn lại vẫn giữ nguyên trong React Hook Form nhờ shouldUnregister=false.
const STEP_FIELDS: Record<ProductCreateStepId, FieldPath<SellerProductCreateFormValues>[]> = {
    basic: ['images', 'name', 'categoryId'],
    details: ['brandId', 'description', 'attributes'],
    sales: ['options', 'variants'],
    shipping: [
        'package.weightGrams',
        'package.lengthCm',
        'package.widthCm',
        'package.heightCm',
    ],
    other: ['condition', 'countryOfOrigin', 'sellerSku', 'gtin'],
};

// Điều phối dữ liệu tham chiếu, trạng thái wizard và thao tác tạo product graph.
// Hook này không tự quyết định rule riêng lẻ; checklist, điều hướng và submit đều dùng validator dùng chung.
export function useSellerProductEditor(productId?: string) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(productId);
    const detailQuery = useSellerProductDetail(productId);
    const form = useForm<SellerProductCreateFormValues>({
        resolver: zodResolver(sellerProductCreateSchema),
        defaultValues: initialSellerProductCreateValues,
        // Wizard cần phản ánh ngay trạng thái hợp lệ của checklist và nút submit.
        // Nếu chỉ validate khi blur, người dùng có thể vừa sửa xong nhưng UI vẫn giữ trạng thái cũ.
        mode: 'onChange',
        reValidateMode: 'onChange',
        shouldUnregister: false,
    });
    const [references, setReferences] = useState<SellerProductCreateReferences>({
        category: null,
        brand: null,
        attributes: [],
    });
    const [loadingAttributes, setLoadingAttributes] = useState(false);
    const [submittingStatus, setSubmittingStatus] = useState<ProductSubmitAction | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(isEditMode);
    const hydratedProductId = useRef<string | null>(null);
    const [activeStep, setActiveStep] = useState<ProductCreateStepId>('basic');
    const draftHydrated = useRef(false);
    const watchedValues = useWatch({ control: form.control }) as SellerProductCreateFormValues;
    const options = useWatch({ control: form.control, name: 'options' });
    const variants = useWatch({ control: form.control, name: 'variants' });

    // Hydrate một lần từ detail và schema category để wizard edit giữ đúng giá trị động seller đã lưu.
    useEffect(() => {
        if (!productId || !detailQuery.data || hydratedProductId.current === productId) return;
        hydratedProductId.current = productId;
        setLoadingProduct(true);
        void (async () => {
            try {
                const [category, attributes] = await Promise.all([
                    catalogService.getCategory(detailQuery.data.categoryId),
                    catalogService.listCategoryAttributes(detailQuery.data.categoryId, {
                        includeOptions: true,
                        includeConditional: true,
                    }),
                ]);
                const editValues = toSellerProductEditFormValues(detailQuery.data);
                // Bổ sung field rỗng cho attribute mới của category để schema động vẫn render đủ và bắt buộc nhập đúng.
                editValues.attributes = Object.fromEntries(
                    attributes.map((attribute) => [
                        attribute.id,
                        editValues.attributes[attribute.id] ?? createEmptyAttributeValue(),
                    ]),
                );
                form.reset(editValues);
                setReferences({
                    category: { id: category.id, name: category.name, path: category.path },
                    brand: detailQuery.data.brand ?? null,
                    attributes,
                });
            } catch (error) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoadingProduct(false);
            }
        })();
    }, [detailQuery.data, form, productId]);

    // Khôi phục bản nháp create một lần sau khi mount để việc đi sang trang giao nhận không làm mất dữ liệu wizard.
    // Chỉ áp dụng cho sản phẩm mới; edit mode luôn ưu tiên dữ liệu thật từ Product Service và tránh race với hydrate detail.
    useEffect(() => {
        if (isEditMode || draftHydrated.current) return;

        const draft = readProductEditorDraft();
        if (!draft) {
            draftHydrated.current = true;
            return;
        }

        let isMounted = true;
        queueMicrotask(() => {
            if (!isMounted) return;
            draftHydrated.current = true;
            form.reset(draft.values);
            setReferences(draft.references);
            setActiveStep(draft.activeStep);
        });

        return () => {
            isMounted = false;
        };
    }, [form, isEditMode]);

    const validations = useMemo<ProductCreateStepValidations>(
        () => getProductCreateStepValidations(watchedValues, references.attributes),
        [watchedValues, references.attributes],
    );
    const allStepsValid = PRODUCT_CREATE_STEPS.every((step) => validations[step.id].valid);

    // Chuyển bước và đưa viewport về đầu workspace để section mới luôn bắt đầu ở vị trí dễ hiểu.
    // Không dùng window.scrollTo({ top: 0 }) vì header/layout có thể có chiều cao khác nhau;
    // scrollIntoView theo đúng workspace giúp giữ nguyên ngữ cảnh của trang Seller Center.
    const changeStep = (step: ProductCreateStepId) => {
        setActiveStep(step);
        window.requestAnimationFrame(() => {
            document.getElementById('product-create-workspace')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    };

    // Đồng bộ danh sách SKU sinh tự động với nhóm phân loại nhưng không ghi đè giá trị seller đã nhập.
    useEffect(() => {
        const nextVariants = buildProductVariants(options, variants);
        const currentSignature = variants.map((variant) => `${variant.key}:${variant.label}`).join(',');
        const nextSignature = nextVariants.map((variant) => `${variant.key}:${variant.label}`).join(',');

        // Chỉ thay ma trận SKU khi nhóm hoặc giá trị phân loại thực sự đổi để tránh vòng lặp render.
        if (currentSignature !== nextSignature) {
            form.setValue('variants', nextVariants, {
                shouldDirty: true,
                shouldValidate: false,
            });
        }
    }, [form, options, variants]);

    // Chọn category lá, tải thuộc tính động và khởi tạo value rỗng cho từng thuộc tính.
    const selectCategory = async (category: CatalogCategory) => {
        form.setValue('categoryId', category.id, { shouldDirty: true, shouldValidate: true });
        // Xóa thuộc tính của ngành hàng cũ ngay khi seller đổi ngành hàng.
        // Nếu giữ lại object cũ, các option ID không còn thuộc category mới sẽ bị gửi xuống Product Service.
        form.setValue('attributes', {}, { shouldDirty: true, shouldValidate: false });
        form.clearErrors('categoryId');
        setReferences((current) => ({
            ...current,
            category: { id: category.id, name: category.name, path: category.path },
            attributes: [],
        }));
        setLoadingAttributes(true);

        try {
            const attributes = await catalogService.listCategoryAttributes(category.id, {
                includeOptions: true,
                includeConditional: true,
            });
            form.setValue(
                'attributes',
                Object.fromEntries(
                    attributes.map((attribute) => [attribute.id, createEmptyAttributeValue()]),
                ),
                { shouldDirty: true },
            );
            setReferences((current) => ({ ...current, attributes }));
        } catch (error) {
            form.setError('categoryId', {
                type: 'server',
                message: 'Không tải được thuộc tính của ngành hàng này.',
            });
            toast.error(getErrorMessage(error));
        } finally {
            setLoadingAttributes(false);
        }
    };

    // Đồng bộ brand được chọn vào ID gửi API và object hiển thị trong combobox.
    const selectBrand = (brand: ProductBrand | null) => {
        form.setValue('brandId', brand?.id ?? '', { shouldDirty: true, shouldValidate: true });
        setReferences((current) => ({ ...current, brand }));
    };

    // Ghi lỗi thuộc tính động vào đúng field để seller thấy ngay option nào sai hoặc còn thiếu.
    const applyDynamicAttributeErrors = (): boolean => {
        const validation = validateDynamicAttributes(form.getValues(), references.attributes);

        // Xoá lỗi custom cũ trước khi ghi lại kết quả mới, tránh giữ thông báo sau khi seller đã sửa.
        for (const attribute of references.attributes) {
            form.clearErrors(`attributes.${attribute.id}` as FieldPath<SellerProductCreateFormValues>);
        }
        for (const fieldError of validation.fieldErrors) {
            form.setError(fieldError.fieldName, {
                type: 'custom',
                message: fieldError.message,
            });
        }

        return validation.valid;
    };

    // Chạy cả Zod và rule thuộc tính do Catalog trả về; đây là cổng duy nhất trước khi sang bước kế tiếp.
    const validateStep = async (step: ProductCreateStepId): Promise<boolean> => {
        const schemaValid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
        const dynamicValid = step === 'details' ? applyDynamicAttributeErrors() : true;
        // Đọc lại form sau trigger để không dùng snapshot cũ trong render trước đó.
        const currentValidations = getProductCreateStepValidations(
            form.getValues(),
            references.attributes,
        );
        return schemaValid && dynamicValid && currentValidations[step].valid;
    };

    // Khi nhảy tới bước sau, buộc hoàn thành tuần tự các bước đứng trước để không tạo product graph thiếu dữ liệu.
    const goToStep = async (targetStep: ProductCreateStepId) => {
        const targetIndex = PRODUCT_CREATE_STEPS.findIndex((step) => step.id === targetStep);
        const activeIndex = PRODUCT_CREATE_STEPS.findIndex((step) => step.id === activeStep);

        if (targetIndex <= activeIndex) {
            changeStep(targetStep);
            return;
        }

        // Kiểm tra từ bước đầu tiên thay vì chỉ kiểm tra sau bước hiện tại.
        // Seller có thể quay lại sửa bước trước, nên bước đó phải được xác thực lại trước khi nhảy qua bước khác.
        for (let index = 0; index < targetIndex; index += 1) {
            const step = PRODUCT_CREATE_STEPS[index];
            if (!(await validateStep(step.id))) {
                changeStep(step.id);
                toast.error(`Vui lòng hoàn thiện bước “${step.label}” trước.`);
                return;
            }
        }

        changeStep(targetStep);
    };

    // Kiểm tra bước hiện tại rồi chuyển sang bước kế tiếp, giữ nguyên dữ liệu đã nhập ở các bước trước.
    const goNext = async () => {
        const currentIndex = PRODUCT_CREATE_STEPS.findIndex((step) => step.id === activeStep);
        const currentStep = PRODUCT_CREATE_STEPS[currentIndex];
        if (!currentStep || !(await validateStep(currentStep.id))) {
            toast.error('Vui lòng hoàn thiện các trường bắt buộc của bước này.');
            return;
        }

        const nextStep = PRODUCT_CREATE_STEPS[currentIndex + 1];
        if (nextStep) changeStep(nextStep.id);
    };

    // Quay lại bước trước mà không reset form, giúp seller kiểm tra và sửa dữ liệu nhanh.
    const goBack = () => {
        const currentIndex = PRODUCT_CREATE_STEPS.findIndex((step) => step.id === activeStep);
        const previousStep = PRODUCT_CREATE_STEPS[currentIndex - 1];
        if (previousStep) changeStep(previousStep.id);
    };

    // Lưu snapshot form và reference category vào sessionStorage trước khi Seller rời wizard sang cấu hình giao nhận.
    // Snapshot chỉ dùng trong cùng tab, không gửi lên server và không thay thế bước submit sản phẩm chính thức.
    const saveDraftBeforeLeaving = () => {
        if (isEditMode) return;
        saveProductEditorDraft(form.getValues(), references, activeStep);
    };

    // Xóa bản nháp khi Seller chủ động hủy để lần tạo sản phẩm sau không khôi phục dữ liệu cũ ngoài ý muốn.
    const discardDraft = () => {
        if (!isEditMode) clearProductEditorDraft();
    };

    // Xác thực tuần tự toàn bộ wizard trước khi tạo product, nhờ đó lỗi luôn đưa seller về đúng section.
    const submitProduct = (status: ProductSubmitAction) => {
        void (async () => {
            for (const step of PRODUCT_CREATE_STEPS) {
                if (!(await validateStep(step.id))) {
                    changeStep(step.id);
                    toast.error(`Vui lòng hoàn thiện bước “${step.label}” trước khi đăng bán.`);
                    return;
                }
            }

            const schemaValid = await form.trigger();
            const dynamicValid = applyDynamicAttributeErrors();
            if (!schemaValid || !dynamicValid) {
                toast.error('Thông tin sản phẩm chưa hợp lệ. Vui lòng kiểm tra lại các trường báo lỗi.');
                return;
            }

            setSubmittingStatus(status);
            try {
                if (isEditMode && productId && detailQuery.data) {
                    await sellerProductService.updateProduct(
                        productId,
                        toUpdateSellerProductPayload(
                            form.getValues(),
                            references.attributes,
                            detailQuery.data.status,
                        ),
                    );
                    // Xóa cache detail/list trước redirect để seller thấy dữ liệu mới ngay cả khi query còn trong staleTime.
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: ['seller', 'product-detail', productId],
                        }),
                        queryClient.invalidateQueries({ queryKey: ['seller-products'] }),
                    ]);
                    toast.success('Sản phẩm đã được cập nhật.');
                    router.push(`/seller/products/${productId}`);
                    return;
                }

                const created = await sellerProductService.createProduct(
                    toCreateSellerProductPayload(
                        form.getValues(),
                        references.attributes,
                        status as CreateSellerProductStatus,
                    ),
                );
                toast.success(
                    status === 'ACTIVE'
                        ? 'Sản phẩm đã được đăng bán.'
                        : 'Sản phẩm đã được lưu và ẩn.',
                );
                clearProductEditorDraft();
                router.push(`/seller/products?created=${created.id}`);
            } catch (error) {
                toast.error(getErrorMessage(error));
            } finally {
                setSubmittingStatus(null);
            }
        })();
    };

    return {
        form,
        isEditMode,
        loadingProduct: loadingProduct || detailQuery.isLoading,
        references,
        loadingAttributes,
        submittingStatus,
        activeStep,
        validations,
        canContinue: validations[activeStep].valid,
        canSubmit: allStepsValid && form.formState.isValid,
        selectCategory,
        selectBrand,
        goToStep,
        goNext,
        goBack,
        submitProduct,
        saveDraftBeforeLeaving,
        discardDraft,
    };
}
