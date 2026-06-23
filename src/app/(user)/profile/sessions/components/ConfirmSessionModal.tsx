import { LogOut } from 'lucide-react';

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
import type { SessionDto } from '@/services/auth';

// Xác nhận trước khi đăng xuất một phiên cụ thể để tránh thao tác nhầm trên thiết bị đang dùng hoặc thiết bị khác.
export function ConfirmSessionModal({
    session,
    loading,
    onOpenChange,
    onConfirm,
}: {
    session: SessionDto | null;
    loading: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}) {
    const isCurrent = Boolean(session?.isCurrent);

    return (
        <AlertDialog open={Boolean(session)} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                            <LogOut className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="space-y-1">
                            <AlertDialogTitle>
                                {isCurrent
                                    ? 'Đăng xuất thiết bị này?'
                                    : 'Kết thúc phiên này?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isCurrent
                                    ? 'Bạn sẽ được chuyển về trang đăng nhập.'
                                    : 'Thiết bị này sẽ bị đăng xuất ở lần hoạt động tiếp theo.'}
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
