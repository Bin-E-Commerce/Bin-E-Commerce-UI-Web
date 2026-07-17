'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { SELLER_REGISTER_STEPS } from '../../constants/seller-register-steps.constant';
import { useSellerRegisterFlow } from '../../hooks/useSellerRegisterFlow';
import { SellerRegisterCard } from '../layout/SellerRegisterCard';
import { SellerRegisterHero } from '../layout/SellerRegisterHero';
import { SellerRegisterStepContent } from '../steps/SellerRegisterStepContent';
import { SubmissionSuccess } from '../steps/SubmissionSuccess';
import { SellerApplicationRejectionNotice } from '../status/SellerApplicationRejectionNotice';
import { SellerRegisterStepper } from './SellerRegisterStepper';

// Điều phối luồng đăng ký seller: state nằm trong hook, UI chi tiết nằm trong từng step component.
export function SellerRegisterForm() {
    const {
        currentStep,
        formValues,
        saving,
        submitted,
        editingSubmittedApplication,
        loadingApplication,
        applicationStatus,
        applicationReviewNote,
        applicationCorrectionTargets,
        changedCorrectionTargets,
        verificationDocumentProgress,
        correctionRequirementsSatisfied,
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
        handleEditSubmittedApplication,
        handleAcceptedTermsChange,
    } = useSellerRegisterFlow();
    const activeStep =
        SELLER_REGISTER_STEPS[currentStep] ?? SELLER_REGISTER_STEPS[0];

    if (!activeStep) return null;

    return (
        <div className="space-y-5">
            <SellerRegisterHero
                currentStep={currentStep}
                isLastStep={isLastStep}
                totalSteps={totalSteps}
                applicationStatus={applicationStatus}
            />

            {loadingApplication ? (
                <SellerRegisterLoadingState />
            ) : (
                <div className="space-y-5">
                    {applicationReviewNote ? (
                        <SellerApplicationRejectionNotice
                            reviewNote={applicationReviewNote}
                            correctionTargets={applicationCorrectionTargets}
                            changedCorrectionTargets={changedCorrectionTargets}
                        />
                    ) : null}

                    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <SellerRegisterStepper
                            steps={SELLER_REGISTER_STEPS}
                            currentStep={currentStep}
                            progressValue={progressValue}
                            maxReachableStep={maxReachableStep}
                            onStepChange={goToStep}
                            correctionTargets={applicationCorrectionTargets}
                            changedCorrectionTargets={changedCorrectionTargets}
                        />

                        <SellerRegisterCard
                            step={activeStep}
                            currentStep={currentStep}
                            totalSteps={totalSteps}
                            isLastStep={isLastStep}
                            saving={saving}
                            submitted={submitted}
                            showSaveDraft={
                                !editingSubmittedApplication &&
                                applicationStatus !== 'rejected'
                            }
                            primaryDisabled={
                                !isCurrentStepValid ||
                                (isLastStep && !correctionRequirementsSatisfied)
                            }
                            onBack={() => goToStep(currentStep - 1)}
                            onSaveDraft={handleSaveDraft}
                            onPrimaryAction={handlePrimaryAction}
                        >
                            {submitted ? (
                                <SubmissionSuccess
                                    status={applicationStatus}
                                    onEdit={handleEditSubmittedApplication}
                                />
                            ) : (
                                <SellerRegisterStepContent
                                    currentStep={currentStep}
                                    formValues={formValues}
                                    fieldErrors={currentStepErrors}
                                    updateFormSection={updateFormSection}
                                    onAcceptedTermsChange={handleAcceptedTermsChange}
                                    correctionTargets={applicationCorrectionTargets}
                                    changedCorrectionTargets={changedCorrectionTargets}
                                    verificationDocumentProgress={
                                        verificationDocumentProgress
                                    }
                                    reviewNote={applicationReviewNote}
                                />
                            )}
                        </SellerRegisterCard>
                    </div>
                </div>
            )}
        </div>
    );
}

// Skeleton giữ bố cục ổn định trong lúc FE hỏi backend xem user đã có hồ sơ seller hay chưa.
function SellerRegisterLoadingState() {
    return (
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-2 w-full" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            </aside>

            <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-3 h-8 w-56" />
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-14 rounded-lg" />
                    <Skeleton className="h-14 rounded-lg" />
                    <Skeleton className="h-14 rounded-lg" />
                    <Skeleton className="h-14 rounded-lg" />
                </div>
                <Skeleton className="mt-5 h-28 rounded-lg" />
            </section>
        </div>
    );
}
