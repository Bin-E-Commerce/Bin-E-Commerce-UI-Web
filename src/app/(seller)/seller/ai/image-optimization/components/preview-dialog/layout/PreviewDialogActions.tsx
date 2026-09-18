// Footer action của preview dialog.
// Component chỉ phát callback từ parent và khóa nút theo lifecycle mutation hiện tại.

import {
    AlertDialogCancel,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

interface PreviewDialogActionsProps {
    isFinalizing: boolean;
    completed: boolean;
    canApply: boolean;
    hasGeneratedImage: boolean;
    hasJob: boolean;
    rejecting: boolean;
    applying: boolean;
    onReject: () => void;
    onApply: () => void;
}

// Giữ action nhất quán với lifecycle: không reject khi đang xử lý và không apply khi chưa có output hợp lệ.
export function PreviewDialogActions({
    isFinalizing,
    completed,
    canApply,
    hasGeneratedImage,
    hasJob,
    rejecting,
    applying,
    onReject,
    onApply,
}: PreviewDialogActionsProps) {
    return (
        <AlertDialogFooter className="sticky bottom-0 z-20 flex-col gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:flex-row sm:items-center sm:px-8 sm:py-5 lg:px-10">
            <AlertDialogCancel disabled={rejecting || applying || isFinalizing}>
                Đóng
            </AlertDialogCancel>
            {!completed ? (
                <>
                    <Button
                        variant="destructive"
                        onClick={onReject}
                        disabled={
                            rejecting || applying || !hasJob || isFinalizing
                        }
                    >
                        {rejecting ? 'Đang từ chối...' : 'Từ chối kết quả'}
                    </Button>
                    <Button
                        onClick={onApply}
                        disabled={
                            applying ||
                            rejecting ||
                            !hasJob ||
                            !canApply ||
                            !hasGeneratedImage
                        }
                        aria-busy={isFinalizing}
                    >
                        {isFinalizing ? (
                            <Loader2
                                className="size-4 animate-spin motion-reduce:animate-none"
                                aria-hidden="true"
                            />
                        ) : (
                            <Check className="size-4" aria-hidden="true" />
                        )}
                        {isFinalizing ? 'Đang hoàn thiện...' : 'Dùng ảnh này'}
                    </Button>
                </>
            ) : null}
        </AlertDialogFooter>
    );
}
