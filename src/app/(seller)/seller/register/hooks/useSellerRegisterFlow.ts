'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import {
    useForm,
    useWatch,
    type FieldPath,
    type FieldValues,
} from 'react-hook-form';
import { toast } from 'sonner';

import { sellerService } from '@/services/seller';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { SELLER_REGISTER_STEPS } from '../constants/seller-register-steps.constant';
import {
    initialSellerRegisterValues,
    SELLER_REGISTER_STEP_FIELD_PATHS,
    sellerRegisterSchema,
    validateSellerRegisterStep,
} from '../schemas/seller-register.schema';
import type {
    SellerRegisterFieldErrors,
    SellerRegisterFormValues,
    SellerRegisterObjectSection,
} from '../types/seller-register-form.type';
import { toSellerApplicationPayload } from '../utils/seller-register-payload';

// Hook điều phối toàn bộ luồng đăng ký seller, dùng React Hook Form giữ state và Zod giữ rule validate.
export function useSellerRegisterFlow() {
    const form = useForm<SellerRegisterFormValues>({
        resolver: zodResolver(sellerRegisterSchema),
        defaultValues: initialSellerRegisterValues,
        mode: 'onChange',
        reValidateMode: 'onChange',
    });
    const [currentStep, setCurrentStep] = useState(0);
    const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(
        () => new Set(),
    );
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const totalSteps = SELLER_REGISTER_STEPS.length;
    const isLastStep = currentStep === totalSteps - 1;
    const watchedValues = useWatch({ control: form.control });
    const { touchedFields } = form.formState;
    const formValues = watchedValues as SellerRegisterFormValues;
    const progressValue = useMemo(
        () => ((currentStep + 1) / totalSteps) * 100,
        [currentStep, totalSteps],
    );
    const maxReachableStep = useMemo(
        () => getMaxReachableStep(formValues, totalSteps),
        [formValues, totalSteps],
    );
    const currentStepValidation = useMemo(
        () => validateSellerRegisterStep(formValues, currentStep),
        [currentStep, formValues],
    );
    const currentStepVisibleErrors = useMemo(
        () =>
            filterVisibleErrors(
                currentStepValidation.errors,
                touchedFields,
                attemptedSteps.has(currentStep),
            ),
        [attemptedSteps, currentStep, currentStepValidation.errors, touchedFields],
    );

    // Cập nhật một nhóm dữ liệu form bằng setValue để React Hook Form tự đánh dấu dirty/touched và chạy resolver.
    const updateFormSection = <T extends SellerRegisterObjectSection>(
        section: T,
        patch: Partial<SellerRegisterFormValues[T]>,
    ) => {
        Object.entries(patch).forEach(([key, value]) => {
            const fieldPath =
                `${section}.${key}` as FieldPath<SellerRegisterFormValues>;

            form.setValue(fieldPath, value as never, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        });
    };

    // Chuyển bước có kiểm soát: muốn sang bước xa hơn phải hoàn tất toàn bộ bước trước đó.
    const goToStep = (step: number) => {
        const values = form.getValues();
        const targetStep = clampStep(step, totalSteps);
        if (targetStep <= currentStep) {
            setCurrentStep(targetStep);
            return;
        }

        const firstInvalid = getFirstInvalidStepBefore(values, targetStep);
        if (firstInvalid) {
            setAttemptedSteps((current) => new Set(current).add(firstInvalid.step));
            void triggerStepFields(form, firstInvalid.step);
            toast.error(firstInvalid.message);
            setCurrentStep(firstInvalid.step);
            return;
        }

        setCurrentStep(targetStep);
    };

    // Lưu nháp qua seller-service để user quay lại vẫn còn dữ liệu đã nhập.
    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            await sellerService.saveDraft(
                toSellerApplicationPayload(form.getValues()),
            );
            toast.success('Đã lưu nháp hồ sơ người bán.');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    // Nút chính chỉ cho qua bước tiếp theo khi step hiện tại hợp lệ; bước cuối mới submit thật lên backend.
    const handlePrimaryAction = async () => {
        const values = form.getValues();
        const validation = validateSellerRegisterStep(values, currentStep);
        setAttemptedSteps((current) => new Set(current).add(currentStep));
        await triggerStepFields(form, currentStep);

        if (!validation.valid) {
            toast.error(validation.message);
            return;
        }

        if (!isLastStep) {
            goToStep(currentStep + 1);
            return;
        }

        setSaving(true);
        try {
            await sellerService.submit(toSellerApplicationPayload(values));
            setSubmitted(true);
            toast.success('Đã gửi hồ sơ. Vui lòng chờ duyệt.');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    // Cập nhật điều khoản xác nhận riêng vì field này nằm ngoài các nhóm dữ liệu object.
    const handleAcceptedTermsChange = (acceptedTerms: boolean) => {
        form.setValue('acceptedTerms', acceptedTerms, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    return {
        currentStep,
        formValues,
        saving,
        submitted,
        totalSteps,
        isLastStep,
        progressValue,
        maxReachableStep,
        currentStepErrors: currentStepVisibleErrors,
        isCurrentStepValid: currentStepValidation.valid,
        goToStep,
        updateFormSection,
        handleSaveDraft,
        handlePrimaryAction,
        handleAcceptedTermsChange,
    };
}

// Chặn index âm/vượt số bước để các handler click liên tục không đưa luồng đăng ký ra ngoài phạm vi hợp lệ.
function clampStep(step: number, totalSteps: number): number {
    return Math.min(Math.max(step, 0), totalSteps - 1);
}

// Tìm bước đầu tiên chưa hợp lệ trước target để không cho người dùng nhảy qua bước bắt buộc.
function getFirstInvalidStepBefore(
    values: SellerRegisterFormValues,
    targetStep: number,
): { step: number; message: string } | null {
    for (let step = 0; step < targetStep; step += 1) {
        const validation = validateSellerRegisterStep(values, step);
        if (!validation.valid) {
            return { step, message: validation.message };
        }
    }

    return null;
}

// Tính bước xa nhất có thể mở để stepper hiển thị trạng thái khóa tương ứng với dữ liệu hiện tại.
function getMaxReachableStep(
    values: SellerRegisterFormValues,
    totalSteps: number,
): number {
    let maxReachableStep = 0;

    // Chỉ cần validate các bước trước review; review được mở khi mọi dữ liệu nghiệp vụ đã hợp lệ.
    for (let step = 0; step < totalSteps - 1; step += 1) {
        const validation = validateSellerRegisterStep(values, step);
        if (!validation.valid) break;
        maxReachableStep = step + 1;
    }

    return Math.min(maxReachableStep, totalSteps - 1);
}

// Chỉ cho UI thấy lỗi của field đã chạm, trừ khi user vừa cố qua bước thì mở toàn bộ lỗi của bước đó.
function filterVisibleErrors(
    errors: SellerRegisterFieldErrors,
    touchedFields: unknown,
    showAll: boolean,
): SellerRegisterFieldErrors {
    if (showAll) return errors;

    return Object.entries(errors).reduce<SellerRegisterFieldErrors>(
        (visibleErrors, [path, message]) => {
            if (isFieldTouched(touchedFields, path)) {
                visibleErrors[path] = message;
            }

            return visibleErrors;
        },
        {},
    );
}

// Đọc touchedFields dạng nested object của React Hook Form bằng dot-path như "shop.name".
function isFieldTouched(touchedFields: unknown, path: string): boolean {
    return path.split('.').reduce<unknown>((current, key) => {
        if (!current || typeof current !== 'object') return undefined;
        return (current as Record<string, unknown>)[key];
    }, touchedFields) === true;
}

// Trigger đúng các field thuộc step hiện tại để React Hook Form đồng bộ touched/error với Zod resolver.
function triggerStepFields<TValues extends FieldValues>(
    form: ReturnType<typeof useForm<TValues>>,
    step: number,
) {
    const paths = SELLER_REGISTER_STEP_FIELD_PATHS[step] ?? [];
    return form.trigger(Array.from(paths) as FieldPath<TValues>[]);
}
