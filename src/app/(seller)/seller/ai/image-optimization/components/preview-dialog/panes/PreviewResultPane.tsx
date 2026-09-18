// Khung hiển thị preview AI, trạng thái lỗi và tiến trình finalization.
// Component chỉ render theo job snapshot; không tự retry, apply hoặc gọi provider.

import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';
import { AiImageLoader } from '@/components/ui/ai-image-loader';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PreviewImage } from './PreviewImage';
import type { ImageOptimizationJob } from '@/services/ai/types/image-optimization.types';

interface PreviewResultPaneProps {
    generatedImage: string | null;
    isFailed: boolean;
    isProcessing: boolean;
    isFinalizing: boolean;
    processingStage: ImageOptimizationJob['processingStage'] | undefined;
    failureCode: string | null | undefined;
}

// Trả về hướng dẫn an toàn theo mã lỗi, không đưa raw message của provider ra giao diện seller.
function FailureMessage({
    failureCode,
}: {
    failureCode: string | null | undefined;
}) {
    const message =
        failureCode === 'AI_PROVIDER_CONFIGURATION_ERROR' ||
        failureCode === 'PROVIDERCONFIGURATIONERROR'
            ? 'Provider AI chưa được bật cho project hiện tại. Hãy kiểm tra API key, quyền model và billing.'
            : failureCode === 'AI_PROVIDER_RATE_LIMITED' ||
                failureCode === 'PROVIDERRATELIMITEDERROR'
              ? 'Provider AI đang giới hạn lượt tạo ảnh. Hãy chờ vài phút rồi thử lại.'
              : failureCode === 'AI_PROVIDER_TIMEOUT' ||
                  failureCode === 'PROVIDERTIMEOUTERROR'
                ? 'Provider AI phản hồi quá lâu. Hãy thử lại hoặc chọn nền trắng để xử lý nhanh hơn.'
                : failureCode === 'AI_PROVIDER_REQUEST_REJECTED' ||
                    failureCode === 'PROVIDERREQUESTREJECTEDERROR'
                  ? 'Provider AI đã từ chối yêu cầu. Hãy kiểm tra ảnh nguồn và tham số rồi thử lại.'
                  : failureCode === 'CONFIGURATIONERROR'
                    ? 'AI Service chưa được cấu hình provider đầy đủ.'
                    : failureCode === 'INVALIDPROVIDERRESPONSEERROR'
                      ? 'Provider AI trả về kết quả không hợp lệ. Hãy thử lại.'
                      : failureCode === 'PROVIDERUNAVAILABLEERROR'
                        ? 'Provider AI đang bận hoặc tạm thời không khả dụng. Hãy thử lại sau ít phút.'
                        : failureCode?.includes('CLEANUP_PENDING')
                          ? 'Kết quả chưa hoàn tất và đang chờ hệ thống dọn dữ liệu tạm thời.'
                          : 'Không thể hoàn tất tối ưu ảnh. Hãy đóng cửa sổ và tạo yêu cầu mới.';
    return <>{message}</>;
}

// Chuyển stage kỹ thuật thành nhãn ngắn cho vùng ảnh trong khi step ngang phía trên vẫn là tiến trình chính.
function getProcessingStageMessage(
    stage: ImageOptimizationJob['processingStage'] | undefined,
): string {
    return stage === 'FETCHING_SOURCE'
        ? 'Đang lấy ảnh gốc an toàn'
        : stage === 'PREPARING_IMAGE'
          ? 'Đang chuẩn bị ảnh để xử lý nhanh hơn'
          : stage === 'GENERATING'
            ? 'AI đang phân tích và tạo ảnh'
            : stage === 'UPLOADING'
              ? 'Đang lưu kết quả để bạn xem trước'
              : stage === 'READY'
                ? 'Kết quả đã sẵn sàng để duyệt'
                : stage === 'FAILED'
                  ? 'Xử lý chưa hoàn thành'
                  : 'Đang xếp hàng xử lý';
}

// Render đúng một trạng thái preview, giữ ảnh gốc/preview và giải thích ngắn gọn vì sao seller cần chờ.
export function PreviewResultPane({
    generatedImage,
    isFailed,
    isProcessing,
    isFinalizing,
    processingStage,
    failureCode,
}: PreviewResultPaneProps) {
    return (
        <div className="space-y-3" aria-live="polite">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm">
                        <AiAssistantIcon size={20} />
                    </span>
                    Kết quả AI
                </div>
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Đang xem trước
                </span>
            </div>
            <div
                className={cn(
                    'relative flex h-[360px] items-center justify-center overflow-hidden rounded-2xl p-2 transition-colors sm:h-[440px]',
                    generatedImage
                        ? 'border border-zinc-200 bg-zinc-50 p-0 shadow-[0_18px_45px_-30px_rgba(24,24,27,0.45)]'
                        : isFailed
                          ? 'border border-zinc-200 bg-zinc-50'
                          : 'border border-zinc-800 bg-zinc-950 shadow-[0_24px_55px_-30px_rgba(24,24,27,0.7)]',
                )}
            >
                {!generatedImage && !isFailed ? (
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(113,113,122,0.16),transparent_38%)]" />
                ) : null}
                {isFailed ? (
                    <div className="mx-5 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-8 text-center">
                        <span className="flex size-11 items-center justify-center rounded-full bg-zinc-950 text-white">
                            <AlertCircle
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="text-sm font-semibold text-zinc-950">
                            Tối ưu ảnh chưa hoàn tất
                        </p>
                        <p className="text-xs leading-5 text-zinc-600">
                            <FailureMessage failureCode={failureCode} />
                        </p>
                    </div>
                ) : generatedImage ? (
                    <div className="relative size-full">
                        <PreviewImage
                            src={generatedImage}
                            alt="Kết quả tối ưu AI"
                            className={cn(
                                'relative size-full',
                                isProcessing &&
                                    (isFinalizing
                                        ? 'opacity-30 blur-[2px]'
                                        : 'opacity-45 blur-[1px]'),
                            )}
                        />
                        {isProcessing ? (
                            <div
                                className={cn(
                                    'absolute inset-0 flex items-center justify-center',
                                    isFinalizing
                                        ? 'bg-zinc-950/60'
                                        : 'bg-zinc-950/35',
                                )}
                            >
                                <AiImageLoader
                                    size={isFinalizing ? 104 : 88}
                                    label={getProcessingStageMessage(
                                        processingStage,
                                    )}
                                    tone="light"
                                />
                            </div>
                        ) : null}
                    </div>
                ) : isProcessing ? (
                    <AiImageLoader
                        size={104}
                        label={getProcessingStageMessage(processingStage)}
                        className="relative"
                        tone="light"
                    />
                ) : (
                    <AiImageLoader
                        size={104}
                        label="Đang chờ ảnh kết quả..."
                        className="relative"
                        tone="light"
                    />
                )}
            </div>
            <p className="text-xs text-zinc-500">
                {generatedImage
                    ? 'Đây là bản xem nhanh để kiểm tra bố cục. Ảnh chất lượng cao sẽ được tạo sau khi bạn xác nhận.'
                    : 'Kết quả AI sẽ xuất hiện ở đây sau khi bản xem nhanh hoàn tất.'}
            </p>
        </div>
    );
}
