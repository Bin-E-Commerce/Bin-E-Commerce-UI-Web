'use client';

import { SELLER_REGISTER_STEPS } from '../../constants/seller-register-steps.constant';
import { useSellerRegisterFlow } from '../../hooks/useSellerRegisterFlow';
import { SellerRegisterCard } from '../layout/SellerRegisterCard';
import { SellerRegisterHero } from '../layout/SellerRegisterHero';
import { SellerRegisterStepper } from './SellerRegisterStepper';
import { SellerRegisterStepContent } from '../steps/SellerRegisterStepContent';
import { SubmissionSuccess } from '../steps/SubmissionSuccess';

// Điều phối luồng đăng ký seller: state nằm trong hook, UI chi tiết nằm trong từng step component.
export function SellerRegisterForm() {
    const {
        currentStep,
        formValues,
        saving,
        submitted,
        totalSteps,
        isLastStep,
        progressValue,
        maxReachableStep,
        currentStepErrors,
        isCurrentStepValid,
        goToStep,
        updateFormSection,
        handleSaveDraft,
        handlePrimaryAction,
        handleAcceptedTermsChange,
    } = useSellerRegisterFlow();
    const activeStep =
        SELLER_REGISTER_STEPS[currentStep] ?? SELLER_REGISTER_STEPS[0];

    if (!activeStep) return null;

    return (
        <div className="space-y-7">
            <SellerRegisterHero
                currentStep={currentStep}
                isLastStep={isLastStep}
                totalSteps={totalSteps}
                onStepChange={goToStep}
            />

            <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                <SellerRegisterStepper
                    steps={SELLER_REGISTER_STEPS}
                    currentStep={currentStep}
                    progressValue={progressValue}
                    maxReachableStep={maxReachableStep}
                    onStepChange={goToStep}
                />

                <SellerRegisterCard
                    step={activeStep}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    isLastStep={isLastStep}
                    saving={saving}
                    submitted={submitted}
                    primaryDisabled={!isCurrentStepValid}
                    onBack={() => goToStep(currentStep - 1)}
                    onSaveDraft={handleSaveDraft}
                    onPrimaryAction={handlePrimaryAction}
                >
                    {submitted ? (
                        <SubmissionSuccess />
                    ) : (
                        <SellerRegisterStepContent
                            currentStep={currentStep}
                            formValues={formValues}
                            fieldErrors={currentStepErrors}
                            updateFormSection={updateFormSection}
                            onAcceptedTermsChange={handleAcceptedTermsChange}
                        />
                    )}
                </SellerRegisterCard>
            </div>
        </div>
    );
}
