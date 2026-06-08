import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Xác nhận trước khi đăng xuất hàng loạt để tránh thao tác nhầm trên các thiết bị khác.
export function ConfirmRevokeModal({
    onConfirm,
    onCancel,
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
                        <ShieldAlert className="h-5 w-5 text-zinc-900" />
                    </div>
                    <div>
                        <p className="font-semibold text-zinc-900">
                            Đăng xuất tất cả thiết bị?
                        </p>
                        <p className="text-sm text-zinc-500">
                            Phiên bạn đang dùng sẽ được giữ lại.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 pt-1">
                    <Button variant="outline" className="flex-1" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button className="flex-1" onClick={onConfirm}>
                        Đăng xuất
                    </Button>
                </div>
            </div>
        </div>
    );
}
