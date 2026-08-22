import type {
    SellerRegisterFieldErrors,
    SellerRegisterFormValues,
    SellerRegisterObjectSection,
} from '../../types/seller-register-form.type';
import type { SellerApplicationCorrectionTarget } from '@/services/seller';
import type { VerificationDocumentReplacementProgress } from '../../utils/seller-correction-progress';
import { SellerStepCorrectionGuidance } from '../status/SellerStepCorrectionGuidance';
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
    correctionTargets: SellerApplicationCorrectionTarget[];
    changedCorrectionTargets: SellerApplicationCorrectionTarget[];
    verificationDocumentProgress: VerificationDocumentReplacementProgress;
    reviewNote: string | null;
}

// Điều phối nội dung từng bước để SellerRegisterForm không phải chứa toàn bộ UI chi tiết.
export function SellerRegisterStepContent({
    currentStep,
    formValues,
    fieldErrors,
    updateFormSection,
    onAcceptedTermsChange,
    correctionTargets,
    changedCorrectionTargets,
    verificationDocumentProgress,
    reviewNote,
}: SellerRegisterStepContentProps) {
    const correctionGuidance = (
        <SellerStepCorrectionGuidance
            currentStep={currentStep}
            correctionTargets={correctionTargets}
            changedCorrectionTargets={changedCorrectionTargets}
            verificationDocumentProgress={verificationDocumentProgress}
            reviewNote={reviewNote}
        />
    );

    if (currentStep === 0) {
        return (
            <div className="space-y-5">
                {correctionGuidance}
                <ShopInfoStep
                    values={formValues.shop}
                    errors={fieldErrors}
                    onChange={(patch) => updateFormSection('shop', patch)}
                />
            </div>
        );
    }

    if (currentStep === 1) {
        return (
            <div className="space-y-5">
                {correctionGuidance}
                <SellerInfoStep
                    values={formValues.seller}
                    errors={fieldErrors}
                    onChange={(patch) => updateFormSection('seller', patch)}
                />
            </div>
        );
    }

    if (currentStep === 2) {
        return (
            <div className="space-y-5">
                {correctionGuidance}
                <PickupAddressStep
                    values={formValues.pickupAddress}
                    errors={fieldErrors}
                    onChange={(patch) => updateFormSection('pickupAddress', patch)}
                />
            </div>
        );
    }

    if (currentStep === 3) {
        return (
            <div className="space-y-5">
                {correctionGuidance}
                <PaymentStep
                    values={formValues.payout}
                    errors={fieldErrors}
                    onChange={(patch) => updateFormSection('payout', patch)}
                />
            </div>
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
