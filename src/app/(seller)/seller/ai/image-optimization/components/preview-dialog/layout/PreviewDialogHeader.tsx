// Header và trạng thái job của dialog preview.
// Component chỉ nhận snapshot job/product, không sở hữu polling hay mutation.

import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';
import { ShieldCheck } from 'lucide-react';
import {
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { OptimizationFlowStepper } from '../flow/OptimizationFlowStepper';
import type { ImageOptimizationJob } from '@/services/ai/types/image-optimization.types';

interface PreviewDialogHeaderProps {
    jobId?: string;
    productName: string;
    status: ImageOptimizationJob['status'] | undefined;
    isFinalizing: boolean;
    isProcessing: boolean;
    generationProfile: ImageOptimizationJob['generationProfile'];
    processingStage: ImageOptimizationJob['processingStage'] | undefined;
}

// Hiển thị tiêu đề và trạng thái hiện tại để seller hiểu job đang ở đâu trước khi thao tác.
export function PreviewDialogHeader({
    jobId,
    productName,
    status,
    isFinalizing,
    isProcessing,
    generationProfile,
    processingStage,
}: PreviewDialogHeaderProps) {
    const flowMode =
        isFinalizing || generationProfile === 'FINAL' || status === 'APPLIED'
            ? 'FINAL'
            : 'PREVIEW';

    return (
        <>
            <AlertDialogHeader className="sticky top-0 z-20 border-b border-zinc-200 bg-white px-5 py-4 text-zinc-950 sm:px-7 sm:py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <span
                            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm"
                            aria-hidden="true"
                        >
                            <AiAssistantIcon size={27} />
                        </span>
                        <div className="min-w-0">
                            <AlertDialogTitle className="text-base font-semibold tracking-tight text-zinc-950 sm:text-lg">
                                Xem trước ảnh được tối ưu bằng AI
                            </AlertDialogTitle>
                            <AlertDialogDescription className="mt-0.5 text-xs leading-5 text-zinc-500 sm:text-sm">
                                Phóng đại và so sánh trước khi thay đổi ảnh đang
                                hiển thị của sản phẩm.
                            </AlertDialogDescription>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-start gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs leading-5 text-zinc-600 shadow-sm sm:max-w-sm">
                        <ShieldCheck
                            className="mt-0.5 size-4 shrink-0 text-zinc-900"
                            aria-hidden="true"
                        />
                        <p>
                            Ảnh gốc vẫn được giữ lại để seller có thể từ chối
                            hoặc khôi phục sau khi áp dụng.
                        </p>
                    </div>
                </div>
            </AlertDialogHeader>
            <div className="mx-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 shadow-sm sm:mx-7">
                <div className="min-w-0">
                    <p className="mt-0.5 truncate text-sm font-semibold text-zinc-950 sm:text-base">
                        {productName}
                    </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                    <span
                        className={cn(
                            'size-2 rounded-full',
                            isProcessing
                                ? 'animate-pulse motion-reduce:animate-none bg-amber-500'
                                : 'bg-zinc-900',
                        )}
                        aria-hidden="true"
                    />
                    {isFinalizing
                        ? 'Đang hoàn thiện ảnh chất lượng cao'
                        : status === 'PENDING'
                          ? 'Đang xếp hàng xử lý'
                          : status === 'PROCESSING'
                            ? 'Đang tạo bản xem nhanh'
                            : status === 'FINALIZING'
                              ? 'Đang hoàn thiện ảnh chất lượng cao'
                              : status === 'REVIEW_REQUIRED' ||
                                  status === 'SUCCEEDED'
                                ? 'Sẵn sàng duyệt'
                                : status === 'APPLIED'
                                  ? 'Đã áp dụng'
                                  : status === 'REJECTED'
                                    ? 'Đã từ chối'
                                    : status === 'FAILED'
                                      ? 'Xử lý không thành công'
                                      : 'Đang chuẩn bị'}
                </span>
                {status ? (
                    <div className="basis-full">
                        <OptimizationFlowStepper
                            key={`${flowMode}-${jobId ?? 'empty'}`}
                            mode={flowMode}
                            status={status}
                            generationProfile={generationProfile}
                            processingStage={processingStage}
                        />
                    </div>
                ) : null}
            </div>
        </>
    );
}
