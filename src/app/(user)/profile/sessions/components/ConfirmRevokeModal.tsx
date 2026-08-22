import { ShieldAlert } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Hộp thoại xác nhận đăng xuất các thiết bị khác bằng AlertDialog chuẩn để xử lý focus, overlay và đóng modal ổn định.
export function ConfirmRevokeModal({
    open,
    loading,
    onOpenChange,
    onConfirm,
}: {
    open: boolean;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                            <ShieldAlert className="h-5 w-5 text-zinc-900" />
                        </div>
                        <div className="space-y-1">
                            <AlertDialogTitle>
                                Đăng xuất tất cả thiết bị khác?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Phiên bạn đang dùng sẽ được giữ lại.
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                    <AlertDialogCancel disabled={loading} className="mt-0">
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                        className="bg-zinc-950 text-white hover:bg-zinc-800"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng xuất'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
