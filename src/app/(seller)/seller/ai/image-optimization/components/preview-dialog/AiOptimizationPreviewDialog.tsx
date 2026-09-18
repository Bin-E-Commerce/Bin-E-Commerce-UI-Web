// Dialog xem trước ảnh AI và điều phối các mảnh UI preview.
// Component chỉ tính trạng thái hiển thị và phát callback; polling/mutation vẫn thuộc dashboard và hook.

'use client';

import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { PreviewDialogActions } from './layout/PreviewDialogActions';
import { PreviewDialogHeader } from './layout/PreviewDialogHeader';
import { PreviewResultPane } from './panes/PreviewResultPane';
import { PreviewSourcePane } from './panes/PreviewSourcePane';
import type {
    ImageOptimizationJob,
    ImageOptimizationProduct,
} from '@/services/ai/types/image-optimization.types';

interface AiOptimizationPreviewDialogProps {
    product: ImageOptimizationProduct | null;
    job: ImageOptimizationJob | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReject: () => void;
    rejecting: boolean;
    onApply: () => void;
    applying: boolean;
    completed: boolean;
}

// Render dialog theo snapshot job, khóa đóng/reject trong finalization và giữ nguyên contract callback với dashboard.
export function AiOptimizationPreviewDialog({
    product,
    job,
    open,
    onOpenChange,
    onReject,
    rejecting,
    onApply,
    applying,
    completed,
}: AiOptimizationPreviewDialogProps) {
    const generatedImage =
        job?.generatedAssets?.find((asset) => asset.imageUrl)?.imageUrl ?? null;
    const sourceImage =
        product?.sourceImageUrl ?? product?.thumbnailUrl ?? null;
    const isFinalizing = job?.status === 'FINALIZING' || applying;
    const isProcessing =
        job?.status === 'PENDING' ||
        job?.status === 'PROCESSING' ||
        job?.status === 'FINALIZING';
    const isFailed = job?.status === 'FAILED';
    const canApply =
        job?.status === 'REVIEW_REQUIRED' || job?.status === 'SUCCEEDED';

    // Chặn ESC, nút đóng và yêu cầu đóng từ Radix khi ảnh đang được ghi vào sản phẩm.
    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen && isFinalizing) return;
        onOpenChange(nextOpen);
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className="max-h-[calc(100dvh-2rem)] max-w-6xl overflow-y-auto overflow-x-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl">
                <PreviewDialogHeader
                    jobId={job?.jobId}
                    productName={product?.name ?? 'Sản phẩm đang chọn'}
                    status={job?.status}
                    isFinalizing={isFinalizing}
                    isProcessing={isProcessing}
                    generationProfile={job?.generationProfile}
                    processingStage={job?.processingStage}
                />

                <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <PreviewSourcePane
                            sourceImage={sourceImage}
                            productName={product?.name ?? 'sản phẩm'}
                        />
                        <PreviewResultPane
                            generatedImage={generatedImage}
                            isFailed={isFailed}
                            isProcessing={isProcessing}
                            isFinalizing={isFinalizing}
                            processingStage={job?.processingStage}
                            failureCode={job?.failureCode}
                        />
                    </div>
                </div>

                <PreviewDialogActions
                    isFinalizing={isFinalizing}
                    completed={completed || job?.status === 'APPLIED'}
                    canApply={canApply}
                    hasGeneratedImage={Boolean(generatedImage)}
                    hasJob={Boolean(job)}
                    rejecting={rejecting}
                    applying={applying}
                    onReject={onReject}
                    onApply={onApply}
                />
            </AlertDialogContent>
        </AlertDialog>
    );
}
