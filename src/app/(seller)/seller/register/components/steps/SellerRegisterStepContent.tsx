import type {
    SellerRegisterFieldErrors,
    SellerRegisterFormValues,
    SellerRegisterObjectSection,
} from '../../types/seller-register-form.type';
import { PaymentStep } from './PaymentStep';
import { PickupAddressStep } from './PickupAddressStep';
import { ReviewStep } from './ReviewStep';
import { SellerInfoStep } from './SellerInfoStep';
import { ShopInfoStep } from './ShopInfoStep';

interface SellerRegisterStepContentProps {
    currentStep: number;
    formValues: SellerRegisterFormValues;
    fieldErrors: SellerRegisterFieldErrors;
    updateFormSection: <T extends SellerRegisterObjectSection>(
        section: T,
        patch: Partial<SellerRegisterFormValues[T]>,
    ) => void;
    onAcceptedTermsChange: (acceptedTerms: boolean) => void;
}

// Điều phối nội dung từng bước để SellerRegisterForm không phải chứa toàn bộ UI chi tiết.
export function SellerRegisterStepContent({
    currentStep,
    formValues,
    fieldErrors,
    updateFormSection,
    onAcceptedTermsChange,
}: SellerRegisterStepContentProps) {
    if (currentStep === 0) {
        return (
            <ShopInfoStep
                values={formValues.shop}
                errors={fieldErrors}
                onChange={(patch) => updateFormSection('shop', patch)}
            />
        );
    }

    if (currentStep === 1) {
        return (
            <SellerInfoStep
                values={formValues.seller}
                errors={fieldErrors}
                onChange={(patch) => updateFormSection('seller', patch)}
            />
        );
    }

    if (currentStep === 2) {
        return (
            <PickupAddressStep
                values={formValues.pickupAddress}
                errors={fieldErrors}
                onChange={(patch) => updateFormSection('pickupAddress', patch)}
            />
        );
    }

    if (currentStep === 3) {
        return (
            <PaymentStep
                values={formValues.payout}
                errors={fieldErrors}
                onChange={(patch) => updateFormSection('payout', patch)}
            />
        );
    }

    return (
        <ReviewStep
            acceptedTerms={formValues.acceptedTerms}
            errors={fieldErrors}
            onAcceptedTermsChange={onAcceptedTermsChange}
        />
    );
}
