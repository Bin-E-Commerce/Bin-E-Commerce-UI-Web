// Dialog xem trước ảnh AI trước khi seller duyệt áp dụng.
// Dialog chỉ hiển thị dữ liệu và phát action; việc apply/reject do feature hook xử lý.

'use client';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AiImageLoader } from '@/components/ui/ai-image-loader';
import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';
import { Lens } from '@/components/ui/lens';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ImageIcon, ShieldCheck } from 'lucide-react';
import type { ImageOptimizationJob, ImageOptimizationProduct } from '../types/ai-image-optimization.types';

interface AiOptimizationPreviewDialogProps {
    product: ImageOptimizationProduct | null;
    job: ImageOptimizationJob | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReject: () => void;
    rejecting: boolean;
    onApply: () => void;
    applying: boolean;
}

// Trả về nhãn ngắn để seller biết dialog đang ở giai đoạn nào của job.
function getPreviewStatus(status: ImageOptimizationJob['status'] | undefined) {
    if (status === 'PENDING') return 'Đang xếp hàng xử lý';
    if (status === 'PROCESSING') return 'AI đang tạo ảnh';
    if (status === 'REVIEW_REQUIRED' || status === 'SUCCEEDED') return 'Sẵn sàng duyệt';
    if (status === 'APPLIED') return 'Đã áp dụng';
    if (status === 'REJECTED') return 'Đã từ chối';
    if (status === 'FAILED') return 'Xử lý không thành công';
    return 'Đang chuẩn bị';
}

// Chuyển processing stage kỹ thuật thành câu ngắn để seller biết hệ thống đang làm gì thay vì chỉ nhìn spinner chung chung.
function getProcessingStageLabel(stage: ImageOptimizationJob['processingStage'] | undefined) {
    if (stage === 'FETCHING_SOURCE') return 'Đang lấy ảnh gốc an toàn';
    if (stage === 'PREPARING_IMAGE') return 'Đang chuẩn bị ảnh để xử lý nhanh hơn';
    if (stage === 'GENERATING') return 'AI đang phân tích và tạo ảnh';
    if (stage === 'UPLOADING') return 'Đang lưu kết quả để bạn xem trước';
    if (stage === 'READY') return 'Kết quả đã sẵn sàng để duyệt';
    if (stage === 'FAILED') return 'Xử lý chưa hoàn thành';
    return 'Đang xếp hàng xử lý';
}

// Hiển thị một ảnh có Lens để seller kiểm tra chi tiết trước khi duyệt.
function PreviewImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    return (
        <Lens className="h-full w-full" zoomFactor={1.7} lensSize={190} lensColor="rgba(24, 24, 27, 0.92)" ariaLabel={`Phóng đại ${alt}`}>
            <img src={src} alt={alt} className={cn('h-full w-full object-contain', className)} />
        </Lens>
    );
}

// Hiển thị before/after và các action duyệt ảnh AI trong một dialog rộng, dễ quan sát.
export function AiOptimizationPreviewDialog({ product, job, open, onOpenChange, onReject, rejecting, onApply, applying }: AiOptimizationPreviewDialogProps) {
    const generatedImage = job?.generatedAssets?.find((asset) => asset.imageUrl)?.imageUrl ?? null;
    const isProcessing = job?.status === 'PENDING' || job?.status === 'PROCESSING';
    const canApply = job?.status === 'REVIEW_REQUIRED' || job?.status === 'SUCCEEDED';

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-h-[calc(100dvh-2rem)] max-w-6xl overflow-y-auto overflow-x-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl">
                <AlertDialogHeader className="sticky top-0 z-20 border-b border-zinc-200 bg-white px-5 py-4 text-zinc-950 sm:px-7 sm:py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm" aria-hidden="true">
                            <AiAssistantIcon size={20} className="invert" />
                        </span>
                        <div className="min-w-0">
                            <AlertDialogTitle className="text-base font-semibold tracking-tight text-zinc-950 sm:text-lg">Xem trước ảnh được tối ưu bằng AI</AlertDialogTitle>
                            <AlertDialogDescription className="mt-0.5 text-xs leading-5 text-zinc-500 sm:text-sm">
                                Phóng đại và so sánh trước khi thay đổi ảnh đang hiển thị của sản phẩm.
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 shadow-sm">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Sản phẩm đang xem</p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-zinc-950 sm:text-base">{product?.name ?? 'Sản phẩm đang chọn'}</p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700">
                            <span className={cn('size-2 rounded-full', isProcessing ? 'animate-pulse bg-amber-500' : 'bg-zinc-900')} aria-hidden="true" />
                            {getPreviewStatus(job?.status)}
                        </span>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    <ImageIcon className="size-4" aria-hidden="true" />
                                    Ảnh hiện tại
                                </div>
                                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Bản gốc</span>
                            </div>
                            <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)] sm:h-[440px]">
                                {product?.thumbnailUrl ? (
                                    <PreviewImage src={product.thumbnailUrl} alt={`Ảnh hiện tại của ${product.name}`} />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                                        <ImageIcon className="size-12" aria-hidden="true" />
                                        <span className="text-sm">Chưa có ảnh sản phẩm</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500">Di chuột lên ảnh để xem chi tiết. Dùng phím Tab để tiếp cận vùng phóng đại.</p>
                        </div>

                        <div className="space-y-3" aria-live="polite">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    <span className="flex size-6 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                                        <AiAssistantIcon size={14} className="invert" />
                                    </span>
                                    Kết quả AI
                                </div>
                                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Đang xem trước</span>
                            </div>
                            <div className={cn(
                                'relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl p-2 transition-colors sm:h-[440px]',
                                generatedImage
                                    ? 'border border-zinc-200 bg-zinc-50 p-0 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)]'
                                    : 'border border-zinc-800 bg-zinc-950 shadow-[0_24px_55px_-30px_rgba(24,24,27,0.7)]',
                            )}>
                                {!generatedImage ? <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(113,113,122,0.16),transparent_38%)]" /> : null}
                                {generatedImage ? (
                                    <PreviewImage src={generatedImage} alt="Kết quả tối ưu AI" className="relative" />
                                ) : (
                                    <AiImageLoader size={104} label={isProcessing ? getProcessingStageLabel(job?.processingStage) : 'Đang chờ ảnh kết quả...'} className="relative" tone="light" />
                                )}
                            </div>
                            <p className="text-xs text-zinc-500">Kết quả AI chỉ là đề xuất. Seller luôn duyệt trước khi áp dụng.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-sm leading-6 text-zinc-100 shadow-[0_14px_35px_-24px_rgba(24,24,27,0.8)]">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-white" aria-hidden="true" />
                        <p>Ảnh gốc vẫn được giữ lại để seller có thể từ chối hoặc khôi phục sau khi áp dụng.</p>
                    </div>
                </div>

                <AlertDialogFooter className="sticky bottom-0 z-20 border-t border-zinc-200 bg-zinc-50 px-8 py-5 sm:px-10">
                    <AlertDialogCancel disabled={rejecting || applying}>Đóng</AlertDialogCancel>
                    <Button variant="destructive" onClick={onReject} disabled={rejecting || applying || !job || isProcessing}>
                        {rejecting ? 'Đang từ chối...' : 'Từ chối kết quả'}
                    </Button>
                    <Button onClick={onApply} disabled={applying || rejecting || !job || !canApply || !generatedImage}>
                        <Check className="size-4" aria-hidden="true" />
                        {applying ? 'Đang áp dụng...' : 'Dùng ảnh này'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
