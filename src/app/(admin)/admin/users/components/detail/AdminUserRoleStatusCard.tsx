// Card điều khiển role/status; chỉ phát lựa chọn và submit callback, còn policy/mutation nằm trong detail hook.
import { Button } from '@/components/ui/button';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import type {
    AdminUserDetail,
    AdminUserRole,
    AdminUserStatus,
} from '@/services/admin';
import {
    ADMIN_USER_ROLES,
    ADMIN_USER_STATUSES,
} from '../../constants/admin-user.constants';
import { AdminUserCombobox } from '../shared/AdminUserCombobox';

interface AdminUserRoleStatusCardProps {
    user: AdminUserDetail;
    isSelfProtected: boolean;
    isMutationProtected: boolean;
    selectedRole: AdminUserRole | null;
    selectedStatus: AdminUserStatus | null;
    reason: string;
    message: string | null;
    isPending: boolean;
    onRoleChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onReasonChange: (value: string) => void;
    onSubmit: () => void;
}

// Render các control quản trị và giải thích rõ vì sao self/admin target bị khóa thao tác.
export function AdminUserRoleStatusCard({
    user,
    isSelfProtected,
    isMutationProtected,
    selectedRole,
    selectedStatus,
    reason,
    message,
    isPending,
    onRoleChange,
    onStatusChange,
    onReasonChange,
    onSubmit,
}: AdminUserRoleStatusCardProps) {
    const isProtectedAdmin = user.role === 'ADMIN';

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-5 text-zinc-500" />
                <div>
                    <h2 className="font-semibold text-zinc-950">
                        Role và trạng thái
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                        {isSelfProtected
                            ? 'Không thể thao tác lên chính tài khoản đang đăng nhập.'
                            : isProtectedAdmin
                              ? 'Tài khoản ADMIN chỉ được xem trong MVP; không thể đổi role, trạng thái hoặc thu hồi session.'
                              : 'Mỗi thay đổi cần lý do, thu hồi session và cập nhật audit.'}
                    </p>
                </div>
            </div>
            {isMutationProtected ? (
                <div className="mt-4 flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                    <LockKeyhole className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                    <p>
                        {isSelfProtected
                            ? 'Đây là tài khoản đang đăng nhập. Hệ thống khóa các thao tác tự thay đổi quyền, trạng thái và session.'
                            : 'Bạn vẫn xem được profile, session và audit của admin này, nhưng mọi thao tác thay đổi đều bị khóa theo chính sách bảo vệ tài khoản quản trị.'}
                    </p>
                </div>
            ) : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <AdminUserCombobox
                    value={selectedRole ?? user.role}
                    ariaLabel="Chọn role người dùng"
                    placeholder="Chọn role"
                    disabled={isMutationProtected}
                    options={[
                        {
                            value: user.role,
                            label: `${user.role} · hiện tại`,
                        },
                        ...ADMIN_USER_ROLES.filter(
                            (role) => role !== user.role,
                        ).map((role) => ({ value: role, label: role })),
                    ]}
                    onValueChange={onRoleChange}
                />
                <AdminUserCombobox
                    value={selectedStatus ?? user.status}
                    ariaLabel="Chọn trạng thái người dùng"
                    placeholder="Chọn trạng thái"
                    disabled={isMutationProtected}
                    options={[
                        {
                            value: user.status,
                            label: `${user.status} · hiện tại`,
                        },
                        ...ADMIN_USER_STATUSES.filter(
                            (status) => status !== user.status,
                        ).map((status) => ({ value: status, label: status })),
                    ]}
                    onValueChange={onStatusChange}
                />
            </div>
            <textarea
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
                placeholder="Lý do bắt buộc cho mọi thay đổi hoặc thu hồi session"
                disabled={isMutationProtected}
                className="mt-3 min-h-24 w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            />
            <Button
                variant="ghost"
                type="button"
                disabled={
                    isMutationProtected ||
                    isPending ||
                    (!selectedRole && !selectedStatus) ||
                    !reason.trim()
                }
                onClick={onSubmit}
                className="mt-3 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
                Xác nhận thay đổi
            </Button>
            {message ? (
                <p className="mt-3 text-sm text-zinc-600">{message}</p>
            ) : null}
        </div>
    );
}
