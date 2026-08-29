import Link from 'next/link';
import { ArrowLeft, ArrowRight, EyeOff, LoaderCircle, Send } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import type { ProductSubmitAction } from '../../hooks/useSellerProductEditor';
import type { ProductCreateStepId } from '../../types/product-create-step.type';

interface ProductCreateActionsProps {
    activeStep: ProductCreateStepId;
    canContinue: boolean;
    canSubmit: boolean;
    submittingStatus: ProductSubmitAction | null;
    mode?: 'create' | 'edit';
    cancelHref?: string;
    onBack: () => void;
    onNext: () => void;
    onSubmit: (status: ProductSubmitAction) => void;
}

// Chỉ hiển thị hành động phù hợp với bước hiện tại, tránh cho seller gửi sản phẩm khi còn thiếu dữ liệu ở bước sau.
export function ProductCreateActions({
    activeStep,
    canContinue,
    canSubmit,
    submittingStatus,
    mode = 'create',
    cancelHref = '/seller/products',
    onBack,
    onNext,
    onSubmit,
}: ProductCreateActionsProps) {
    const submitting = submittingStatus !== null;
    const isFirstStep = activeStep === 'basic';
    const isLastStep = activeStep === 'other';

    return (
        <footer className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-xs leading-5 text-zinc-500">
                {isLastStep
                    ? canSubmit
                        ? mode === 'edit'
                            ? 'Thông tin đã sẵn sàng để lưu thay đổi.'
                            : 'Thông tin đã sẵn sàng để lưu hoặc đăng bán.'
                        : 'Hoàn thiện các bước bắt buộc trước khi đăng bán.'
                    : canContinue
                      ? 'Bước này đã hợp lệ, bạn có thể tiếp tục.'
                      : 'Hoàn thiện bước này để tiếp tục.'}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
                {isFirstStep ? (
                    <Link href={cancelHref} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                        Hủy
                    </Link>
                ) : mode === 'edit' ? (
                    <Button
                        type="button"
                        size="lg"
                        disabled={!canSubmit || submitting}
                        className="min-w-36"
                        onClick={() => onSubmit('UPDATE')}
                    >
                        {submittingStatus === 'UPDATE' ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Send className="size-4" />
                        )}
                        Lưu thay đổi
                    </Button>
                ) : (
                    <Button type="button" size="lg" variant="outline" disabled={submitting} onClick={onBack}>
                        <ArrowLeft className="size-4" />
                        Quay lại
                    </Button>
                )}

                {!isLastStep ? (
                    <Button type="button" size="lg" disabled={!canContinue || submitting} onClick={onNext}>
                        Tiếp tục
                        <ArrowRight className="size-4" />
                    </Button>
                ) : (
                    <>
                        <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            disabled={!canSubmit || submitting}
                            onClick={() => onSubmit('DRAFT')}
                        >
                            {submittingStatus === 'DRAFT' ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                                <EyeOff className="size-4" />
                            )}
                            Lưu và ẩn
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            disabled={!canSubmit || submitting}
                            className="min-w-32"
                            onClick={() => onSubmit('ACTIVE')}
                        >
                            {submittingStatus === 'ACTIVE' ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                                <Send className="size-4" />
                            )}
                            Đăng bán
                        </Button>
                    </>
                )}
            </div>
        </footer>
    );
}
