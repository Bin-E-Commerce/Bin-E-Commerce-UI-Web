// Dialog xem trước ảnh AI trước khi seller duyệt áp dụng.
// Dialog chỉ hiển thị dữ liệu và phát action; việc apply/reject do feature hook xử lý.

'use client';

import { useEffect, useState } from 'react';
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
import { AlertCircle, Check, ImageIcon, Loader2, ShieldCheck } from 'lucide-react';
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
    if (status === 'PROCESSING') return 'Đang tạo bản xem nhanh';
    if (status === 'FINALIZING') return 'Đang hoàn thiện ảnh chất lượng cao';
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

// Chuyển failureCode kỹ thuật thành hướng dẫn an toàn để seller biết cần chờ, kiểm tra cấu hình hay tạo lại job.
// Không hiển thị message/raw response từ OpenAI vì các giá trị đó có thể chứa chi tiết hạ tầng hoặc thông tin nhạy cảm.
function getFailureMessage(failureCode: string | null | undefined) {
    if (failureCode === 'AI_PROVIDER_CONFIGURATION_ERROR' || failureCode === 'PROVIDERCONFIGURATIONERROR') return 'Provider AI chưa được bật cho project hiện tại. Hãy kiểm tra API key, quyền model và billing.';
    if (failureCode === 'AI_PROVIDER_RATE_LIMITED' || failureCode === 'PROVIDERRATELIMITEDERROR') return 'Provider AI đang giới hạn lượt tạo ảnh. Hãy chờ vài phút rồi thử lại.';
    if (failureCode === 'AI_PROVIDER_TIMEOUT' || failureCode === 'PROVIDERTIMEOUTERROR') return 'Provider AI phản hồi quá lâu. Hãy thử lại hoặc chọn nền trắng để xử lý nhanh hơn.';
    if (failureCode === 'AI_PROVIDER_REQUEST_REJECTED' || failureCode === 'PROVIDERREQUESTREJECTEDERROR') return 'Provider AI đã từ chối yêu cầu. Hãy kiểm tra ảnh nguồn và tham số rồi thử lại.';
    if (failureCode === 'CONFIGURATIONERROR') return 'AI Service chưa được cấu hình provider đầy đủ.';
    if (failureCode === 'INVALIDPROVIDERRESPONSEERROR') return 'Provider AI trả về kết quả không hợp lệ. Hãy thử lại.';
    if (failureCode === 'PROVIDERUNAVAILABLEERROR') return 'Provider AI đang bận hoặc tạm thời không khả dụng. Hãy thử lại sau ít phút.';
    if (failureCode?.includes('CLEANUP_PENDING')) return 'Kết quả chưa hoàn tất và đang chờ hệ thống dọn dữ liệu tạm thời.';
    return 'Không thể hoàn tất tối ưu ảnh. Hãy đóng cửa sổ và tạo yêu cầu mới.';
}

// Hiển thị một ảnh có Lens để seller kiểm tra chi tiết trước khi duyệt.
function PreviewImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    return (
        <Lens className="h-full w-full" zoomFactor={1.7} lensSize={190} lensColor="rgba(24, 24, 27, 0.92)" ariaLabel={`Phóng đại ${alt}`}>
            <img src={src} alt={alt} className={cn('h-full w-full object-contain', className)} />
        </Lens>
    );
}

// Hiển thị trạng thái hoàn thiện ảnh cuối theo cách minh bạch: giữ bản preview trên màn hình,
// giải thích bước đang chạy và nhấn mạnh rằng seller không cần bấm lại hay lo mất ảnh gốc.
function FinalizationProgressCard() {
    return (
        <div className="w-[min(92%,360px)] rounded-2xl border border-zinc-200/90 bg-white/95 p-4 text-left shadow-[0_18px_50px_-28px_rgba(24,24,27,0.55)] backdrop-blur-md sm:p-5">
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-950">Đang hoàn thiện ảnh chất lượng cao</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">Bản xem trước vẫn được giữ nguyên trong lúc hệ thống chuẩn bị ảnh cuối để áp dụng.</p>
                </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-600">
                    <Check className="size-3.5 text-zinc-950" aria-hidden="true" />
                    <span>Đã giữ bản xem trước</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-zinc-950">
                    <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    <span>Đang tạo ảnh chất lượng cao</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                    <span className="ml-0.5 size-2 rounded-full bg-zinc-300" aria-hidden="true" />
                    <span>Sẽ tự động lưu vào sản phẩm</span>
                </div>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-label="Đang hoàn thiện ảnh chất lượng cao" aria-valuetext="Đang xử lý">
                <div className="h-full w-1/2 rounded-full bg-zinc-950 animate-pulse motion-reduce:animate-none" />
            </div>
        </div>
    );
}

// Hiển thị tiến trình áp dụng ở khu vực cố định cùng nút hành động và giữ bộ đếm ổn định
// theo đúng một lần apply. Component không tự gọi API; nó chỉ phản ánh mutation do hook quản lý
// để seller biết preview vẫn được bảo toàn, không cần bấm lại và không thể đóng dialog nhầm.
function ApplyProgressFooter({ startedAt }: { startedAt: number | null }) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Chỉ chạy timer trong lúc apply thật sự đang chờ; dọn timer ngay khi mutation kết thúc
    // để không giữ lại tác vụ nền sau khi dialog đã đóng hoặc request bị lỗi.
    useEffect(() => {
        if (startedAt === null) {
            setElapsedSeconds(0);
            return;
        }

        // Tính elapsed từ mốc mutation thay vì từ lúc mount để thời gian hiển thị phản ánh đúng request.
        const updateElapsed = () => {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
        };
        updateElapsed();
        const timer = window.setInterval(() => {
            updateElapsed();
        }, 1000);

        return () => window.clearInterval(timer);
    }, [startedAt]);

    return (
        <div
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm sm:max-w-[min(100%,460px)]"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            </span>
            <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-zinc-950 sm:text-sm">Đang hoàn thiện ảnh chất lượng cao</span>
                <span className="mt-0.5 block truncate text-[11px] text-zinc-500">Bản xem trước vẫn được giữ nguyên trong lúc hệ thống xử lý.</span>
                <span className="mt-0.5 block text-[10px] font-medium tabular-nums text-zinc-400" aria-hidden="true">Đã xử lý {elapsedSeconds} giây</span>
            </span>
            <span className="ml-auto hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-100 sm:block" aria-hidden="true">
                <span className="block h-full w-2/5 rounded-full bg-zinc-950 animate-pulse motion-reduce:animate-none" />
            </span>
        </div>
    );
}

// Hiển thị lớp chờ riêng khi seller xác nhận áp dụng ảnh.
// Lớp này giữ context preview ở phía sau nhưng chặn mọi thao tác đóng hoặc gửi lại request.
// Nội dung tập trung vào tiến trình hệ thống và cam kết giữ ảnh gốc để seller yên tâm chờ kết quả.
function ApplyProcessingOverlay() {
    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/25 p-4 backdrop-blur-[3px]"
            role="status"
            aria-live="assertive"
            aria-busy="true"
        >
            <div className="w-[min(92vw,440px)] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_28px_90px_-32px_rgba(24,24,27,0.7)]">
                <div className="relative overflow-hidden border-b border-zinc-100 px-6 py-5">
                    <div className="relative flex items-start gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
                            <AiAssistantIcon size={22} className="invert" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Đang áp dụng ảnh AI</p>
                            <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">Đang hoàn thiện ảnh chất lượng cao</h2>
                            <p className="mt-1 text-sm text-zinc-500">Vui lòng chờ trong giây lát, hệ thống đang xử lý.</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-7">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative flex size-20 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
                            <span className="absolute inset-1 rounded-full border-2 border-zinc-200" aria-hidden="true" />
                            <span className="absolute inset-1 rounded-full border-2 border-zinc-950 border-l-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />
                            <Loader2 className="relative size-7 text-zinc-950 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        </div>
                        <p className="mt-5 text-base font-semibold text-zinc-950">Ảnh preview vẫn được giữ nguyên</p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Bạn không cần thao tác thêm. Ảnh chất lượng cao sẽ được lưu vào sản phẩm ngay khi hoàn tất.</p>
                    </div>

                    <div className="mt-6 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm">
                        <div className="flex items-center gap-3 text-zinc-700">
                            <Check className="size-4 shrink-0 text-zinc-950" aria-hidden="true" />
                            <span>Đã xác nhận ảnh bạn chọn</span>
                        </div>
                        <div className="flex items-center gap-3 font-medium text-zinc-950">
                            <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                            <span>Đang tạo và đồng bộ ảnh chất lượng cao</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-400">
                            <span className="size-4 shrink-0 rounded-full border border-zinc-300" aria-hidden="true" />
                            <span>Sẽ tự động cập nhật vào sản phẩm</span>
                        </div>
                    </div>

                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-label="Đang áp dụng ảnh AI" aria-valuetext="Đang xử lý">
                        <div className="h-full w-2/5 rounded-full bg-zinc-950 animate-[apply-progress_1.8s_ease-in-out_infinite] motion-reduce:animate-none" />
                    </div>
                    <p className="mt-3 text-center text-xs text-zinc-400">Ảnh gốc luôn được giữ lại để bạn có thể khôi phục khi cần.</p>
                </div>
            </div>
        </div>
    );
}

// Hiển thị before/after và các action duyệt ảnh AI trong một dialog rộng, dễ quan sát.
export function AiOptimizationPreviewDialog({ product, job, open, onOpenChange, onReject, rejecting, onApply, applying }: AiOptimizationPreviewDialogProps) {
    const [applyStartedAt, setApplyStartedAt] = useState<number | null>(null);
    const generatedImage = job?.generatedAssets?.find((asset) => asset.imageUrl)?.imageUrl ?? null;
    const sourceImage = product?.sourceImageUrl ?? product?.thumbnailUrl ?? null;
    const isFinalizing = job?.status === 'FINALIZING' || applying;
    const isProcessing = job?.status === 'PENDING' || job?.status === 'PROCESSING' || job?.status === 'FINALIZING';
    const isFailed = job?.status === 'FAILED';
    const canApply = job?.status === 'REVIEW_REQUIRED' || job?.status === 'SUCCEEDED';

    // Khóa mọi đường đóng dialog trong lúc apply để seller không vô tình ngắt luồng finalization.
    // Khi mutation kết thúc, trạng thái được trả về null và Radix Dialog hoạt động bình thường.
    useEffect(() => {
        if (isFinalizing && applyStartedAt === null) {
            setApplyStartedAt(Date.now());
        } else if (!isFinalizing && applyStartedAt !== null) {
            setApplyStartedAt(null);
        }
    }, [applyStartedAt, isFinalizing]);

    // Chặn ESC, nút đóng và các yêu cầu đóng từ Dialog khi ảnh đang được ghi vào sản phẩm.
    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen && isFinalizing) return;
        onOpenChange(nextOpen);
    }

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
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
                            <span className={cn('size-2 rounded-full', isProcessing ? 'animate-pulse motion-reduce:animate-none bg-amber-500' : 'bg-zinc-900')} aria-hidden="true" />
                            {isFinalizing ? 'Đang hoàn thiện ảnh chất lượng cao' : getPreviewStatus(job?.status)}
                        </span>
                    </div>

                    {isFinalizing ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3" role="status" aria-live="polite">
                            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-zinc-950">Bạn không cần thao tác thêm</p>
                                <p className="mt-0.5 text-xs leading-5 text-zinc-500">Ảnh preview và ảnh gốc vẫn an toàn. Kết quả cuối sẽ được lưu tự động khi hoàn tất.</p>
                            </div>
                        </div>
                    ) : null}

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
                                {sourceImage ? (
                                    <PreviewImage src={sourceImage} alt={`Ảnh hiện tại của ${product?.name ?? 'sản phẩm'}`} />
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
                                generatedImage || isFinalizing
                                    ? 'border border-zinc-200 bg-zinc-50 p-0 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)]'
                                    : isFailed
                                      ? 'border border-zinc-200 bg-zinc-50'
                                    : 'border border-zinc-800 bg-zinc-950 shadow-[0_24px_55px_-30px_rgba(24,24,27,0.7)]',
                            )}>
                                {!generatedImage && !isFailed ? <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(113,113,122,0.16),transparent_38%)]" /> : null}
                                {isFinalizing ? (
                                    <>
                                        {generatedImage ? <PreviewImage src={generatedImage} alt="Kết quả tối ưu AI" className="relative" /> : <div className="absolute inset-0 bg-zinc-50" />}
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/55 p-4 backdrop-blur-[2px]">
                                            <FinalizationProgressCard />
                                        </div>
                                    </>
                                ) : isFailed ? (
                                    <div className="mx-5 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-8 text-center">
                                        <span className="flex size-11 items-center justify-center rounded-full bg-zinc-950 text-white">
                                            <AlertCircle className="size-5" aria-hidden="true" />
                                        </span>
                                        <p className="text-sm font-semibold text-zinc-950">Tối ưu ảnh chưa hoàn tất</p>
                                        <p className="text-xs leading-5 text-zinc-600">{getFailureMessage(job?.failureCode)}</p>
                                    </div>
                                ) : generatedImage ? (
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

                <AlertDialogFooter className="sticky bottom-0 z-20 flex-col gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:flex-row sm:items-center sm:px-8 sm:py-5 lg:px-10">
                    {isFinalizing ? <ApplyProgressFooter startedAt={applyStartedAt} /> : null}
                    <AlertDialogCancel disabled={rejecting || applying || isFinalizing}>Đóng</AlertDialogCancel>
                    <Button variant="destructive" onClick={onReject} disabled={rejecting || applying || !job || isProcessing}>
                        {rejecting ? 'Đang từ chối...' : 'Từ chối kết quả'}
                    </Button>
                    <Button onClick={onApply} disabled={applying || rejecting || !job || !canApply || !generatedImage} aria-busy={isFinalizing}>
                        {isFinalizing ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Check className="size-4" aria-hidden="true" />}
                        {isFinalizing ? 'Đang hoàn thiện...' : 'Dùng ảnh này'}
                    </Button>
                </AlertDialogFooter>

                {isFinalizing ? <ApplyProcessingOverlay /> : null}
            </AlertDialogContent>
        </AlertDialog>
    );
}
