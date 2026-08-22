import type { FieldPath } from 'react-hook-form';

import type { CatalogCategoryAttribute } from '@/services/catalog';
import type {
    ProductCreateAttributeValue,
    SellerProductCreateFormValues,
} from '../types/seller-product-create-form.type';
import type {
    ProductCreateStepId,
    ProductCreateStepValidations,
} from '../types/product-create-step.type';

// Catalog có thể dùng UUID v5 cho dữ liệu import, vì vậy FE chỉ kiểm tra đúng định dạng UUID
// thay vì khóa cứng version 4 và vô tình coi option hợp lệ là dữ liệu lỗi.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
    return typeof value === 'string' && UUID_PATTERN.test(value);
}

export interface DynamicAttributeValidation {
    valid: boolean;
    errors: string[];
    fieldErrors: Array<{
        fieldName: FieldPath<SellerProductCreateFormValues>;
        message: string;
    }>;
}

// Trả về đúng field path của thuộc tính để React Hook Form hiển thị lỗi ngay dưới control tương ứng.
export function getDynamicAttributeFieldName(
    attribute: CatalogCategoryAttribute,
): FieldPath<SellerProductCreateFormValues> {
    const prefix = `attributes.${attribute.id}` as const;
    if (attribute.inputType === 'SINGLE_SELECT' || attribute.inputType === 'MULTI_SELECT') {
        return `${prefix}.selectedOptionIds`;
    }
    if (attribute.inputType === 'INTEGER' || attribute.inputType === 'DECIMAL') {
        return `${prefix}.valueNumber`;
    }
    if (attribute.inputType === 'BOOLEAN') return `${prefix}.valueBoolean`;
    return `${prefix}.valueText`;
}

// Kiểm tra một thuộc tính có giá trị đủ dùng cho payload Product Service hay chưa.
function hasDynamicAttributeValue(
    attribute: CatalogCategoryAttribute,
    value: ProductCreateAttributeValue,
): boolean {
    if (attribute.inputType === 'SINGLE_SELECT' || attribute.inputType === 'MULTI_SELECT') {
        return value.selectedOptionIds.length > 0;
    }
    if (attribute.inputType === 'INTEGER' || attribute.inputType === 'DECIMAL') {
        return value.valueNumber.trim().length > 0;
    }
    if (attribute.inputType === 'BOOLEAN') return value.valueBoolean !== null;
    return value.valueText.trim().length > 0;
}

// Kiểm tra cả UUID và membership để không gửi option giả hoặc option của thuộc tính khác xuống backend.
export function validateDynamicAttributes(
    values: SellerProductCreateFormValues,
    attributes: CatalogCategoryAttribute[],
): DynamicAttributeValidation {
    const attributeValues = values.attributes ?? {};
    // Giữ cả option ID lỗi trong tập kích hoạt để không vô tình bỏ qua lỗi do Catalog
    // trả về dữ liệu cũ hoặc UI ghi nhầm nhãn thay vì UUID.
    const selectedOptionIds = new Set(
        Object.values(attributeValues)
            .flatMap((value) => value?.selectedOptionIds ?? [])
            .filter((optionId) => isUuid(optionId)),
    );
    const errors: string[] = [];
    const fieldErrors: DynamicAttributeValidation['fieldErrors'] = [];

    for (const attribute of attributes) {
        // Catalog reference phải là UUID vì Product Service dùng nó làm khóa ngoại.
        // Nếu dữ liệu catalog cũ hoặc cache trả về ID sai, báo đúng thuộc tính thay vì
        // để request đi tiếp rồi chỉ nhận lỗi DTO chung từ backend.
        if (!isUuid(attribute.id)) {
            const message = `${attribute.displayName} chưa có mã hợp lệ. Hãy tải lại ngành hàng.`;
            errors.push(message);
            fieldErrors.push({ fieldName: getDynamicAttributeFieldName(attribute), message });
            continue;
        }

        // Attribute điều kiện chỉ hiện khi option cha hợp lệ đã được chọn.
        // Nếu triggerOptionId cũ không còn đúng định dạng, vẫn cho hiển thị để seller có thể sửa,
        // thay vì âm thầm bỏ qua thuộc tính rồi khiến bước chi tiết báo thiếu không rõ nguyên nhân.
        const visible =
            !attribute.triggerOptionId ||
            !isUuid(attribute.triggerOptionId) ||
            selectedOptionIds.has(attribute.triggerOptionId);
        if (!visible) continue;

        const value = attributeValues[attribute.id] ?? {
            selectedOptionIds: [],
            valueText: '',
            valueNumber: '',
            valueBoolean: null,
        };
        const fieldName = getDynamicAttributeFieldName(attribute);

        if (attribute.inputType === 'SINGLE_SELECT' || attribute.inputType === 'MULTI_SELECT') {
            // Chỉ những option có UUID mới được phép đi vào payload vì Product Service
            // dùng option_id làm khóa ngoại và DTO backend đã validate bằng IsUUID.
            const validOptionIds = new Set(
                attribute.options
                    .map((option) => option.id)
                    .filter((optionId) => isUuid(optionId)),
            );
            const invalidOption = value.selectedOptionIds.some(
                (optionId) => !isUuid(optionId) || !validOptionIds.has(optionId),
            );
            if (invalidOption) {
                const message = `${attribute.displayName} chứa giá trị không hợp lệ.`;
                errors.push(message);
                fieldErrors.push({ fieldName, message });
                continue;
            }
        }

        if (attribute.isRequired && !hasDynamicAttributeValue(attribute, value)) {
            const message = `${attribute.displayName} là bắt buộc.`;
            errors.push(message);
            fieldErrors.push({ fieldName, message });
        }
    }

    return { valid: errors.length === 0, errors, fieldErrors };
}

// Tính trạng thái từng bước từ cùng một form state để checklist, nút tiếp tục và nút đăng bán không bị lệch nhau.
export function getProductCreateStepValidations(
    values: SellerProductCreateFormValues,
    attributes: CatalogCategoryAttribute[],
): ProductCreateStepValidations {
    const images = values.images ?? [];
    const titleLength = values.name.trim().length;
    const detailValidation = validateDynamicAttributes(values, attributes);
    const validVariants = values.variants.length > 0 && values.variants.every((variant) => {
        const price = Number(variant.price);
        const stock = Number(variant.stockQuantity);
        return Number.isFinite(price) && price >= 100 && Number.isInteger(stock) && stock >= 0;
    });
    const validPackage = Object.values(values.package).every((value) => {
        const number = Number(value);
        return value.trim().length > 0 && Number.isFinite(number) && number > 0;
    });

    return {
        basic: {
            valid: images.length >= 2 && titleLength >= 20 && isUuid(values.categoryId),
            errors: [
                ...(images.length < 2 ? ['Tải lên ít nhất 2 hình ảnh sản phẩm.'] : []),
                ...(titleLength < 20 ? ['Tên sản phẩm cần có ít nhất 20 ký tự.'] : []),
                ...(!isUuid(values.categoryId) ? ['Chọn ngành hàng cấp cuối.'] : []),
            ],
        },
        details: {
            // Thương hiệu là dữ liệu bổ sung; backend cho phép sản phẩm không có brand
            // nên không được chặn seller sang bước kế tiếp chỉ vì catalog chưa có brand phù hợp.
            valid: values.description.trim().length >= 20 && detailValidation.valid,
            errors: [
                ...(values.description.trim().length < 20 ? ['Mô tả sản phẩm cần có ít nhất 20 ký tự.'] : []),
                ...detailValidation.errors,
            ],
        },
        sales: {
            valid: validVariants,
            errors: validVariants ? [] : ['Mỗi phân loại cần có giá từ 100 đồng và tồn kho là số nguyên không âm.'],
        },
        shipping: {
            valid: validPackage,
            errors: validPackage ? [] : ['Nhập đầy đủ cân nặng và kích thước đóng gói lớn hơn 0.'],
        },
        other: {
            valid: Boolean(values.condition),
            errors: values.condition ? [] : ['Chọn tình trạng sản phẩm.'],
        },
    } satisfies ProductCreateStepValidations;
}

export function getFirstInvalidProductCreateStep(
    validations: ProductCreateStepValidations,
): ProductCreateStepId | null {
    const stepIds: ProductCreateStepId[] = ['basic', 'details', 'sales', 'shipping', 'other'];
    return stepIds.find((stepId) => !validations[stepId].valid) ?? null;
}
