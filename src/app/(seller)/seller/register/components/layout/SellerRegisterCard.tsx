import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { SellerRegisterStep } from '../../types/seller-register-step.type';

interface SellerRegisterCardProps {
    step: SellerRegisterStep;
    currentStep: number;
    totalSteps: number;
    isLastStep: boolean;
    saving: boolean;
    submitted: boolean;
    primaryDisabled: boolean;
    children: ReactNode;
    onBack: () => void;
    onSaveDraft: () => void;
    onPrimaryAction: () => void;
}

// Card form chính giữ phần header/action cố định, còn nội dung step được truyền từ component con.
export function SellerRegisterCard({
    step,
    currentStep,
    totalSteps,
    isLastStep,
    saving,
    submitted,
    primaryDisabled,
    children,
    onBack,
    onSaveDraft,
    onPrimaryAction,
}: SellerRegisterCardProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Bước {currentStep + 1} / {totalSteps}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                    {step.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                    {step.description}
                </p>
            </div>

            <div className="p-5 sm:p-6">{children}</div>

            {!submitted ? (
                <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-full px-4"
                        disabled={currentStep === 0}
                        onClick={onBack}
                    >
                        <ArrowLeft className="size-4" />
                        Quay lại
                    </Button>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-full px-4"
                            disabled={saving}
                            onClick={onSaveDraft}
                        >
                            Lưu nháp
                        </Button>
                        <Button
                            type="button"
                            className="h-10 rounded-full px-5 shadow-md"
                            disabled={saving || primaryDisabled}
                            onClick={onPrimaryAction}
                        >
                            {isLastStep
                                ? saving
                                    ? 'Đang gửi...'
                                    : 'Gửi hồ sơ duyệt'
                                : 'Tiếp tục'}
                            {isLastStep ? (
                                <CheckCircle2 className="size-4" />
                            ) : (
                                <ArrowRight className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
