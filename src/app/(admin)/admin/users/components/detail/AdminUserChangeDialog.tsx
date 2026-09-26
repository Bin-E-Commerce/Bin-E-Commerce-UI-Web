// Dialog xác nhận mutation user; không tự gọi service, chỉ hiển thị payload sắp gửi và phát confirm/cancel.
import { Button } from '@/components/ui/button';
import type { AdminUserRole, AdminUserStatus } from '@/services/admin';

interface AdminUserChangeDialogProps {
    isOpen: boolean;
    selectedRole: AdminUserRole | null;
    selectedStatus: AdminUserStatus | null;
    reason: string;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

// Buộc admin xem lại role/status và reason trước khi mutation được thực thi.
export function AdminUserChangeDialog({
    isOpen,
    selectedRole,
    selectedStatus,
    reason,
    isPending,
    onCancel,
    onConfirm,
}: AdminUserChangeDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 p-4">
            <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
                <h2 className="text-lg font-semibold text-zinc-950">
                    Xác nhận thay đổi tài khoản
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Thao tác này sẽ cập nhật quyền/trạng thái và thu hồi toàn bộ
                    refresh session của user. Hãy kiểm tra lại lý do trước khi
                    tiếp tục.
                </p>
                <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                    <p>
                        <strong>Thay đổi:</strong>{' '}
                        {selectedRole
                            ? `role → ${selectedRole}`
                            : `status → ${selectedStatus}`}
                    </p>
                    <p className="mt-1">
                        <strong>Lý do:</strong> {reason}
                    </p>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {isPending ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
