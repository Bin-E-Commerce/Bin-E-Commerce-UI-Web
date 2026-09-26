// Card session của user detail; chỉ render metadata an toàn và phát event thu hồi lên hook.
import { Button } from '@/components/ui/button';
import { LockKeyhole, XCircle } from 'lucide-react';
import type { AdminUserSession } from '@/services/admin';
import type { RevokeAdminUserSessionInput } from '../../hooks/useAdminUserDetail';
import { formatAdminUserDate } from '../../utils/admin-user.utils';

interface AdminUserSessionsCardProps {
    sessions: AdminUserSession[];
    isMutationProtected: boolean;
    isSelfProtected: boolean;
    isPending: boolean;
    reason: string;
    onRevoke: (input: RevokeAdminUserSessionInput) => void;
}

// Hiển thị session và khóa các thao tác nguy hiểm với chính mình hoặc tài khoản ADMIN.
export function AdminUserSessionsCard({
    sessions,
    isMutationProtected,
    isSelfProtected,
    isPending,
    reason,
    onRevoke,
}: AdminUserSessionsCardProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-zinc-950">Session</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {isMutationProtected
                            ? isSelfProtected
                                ? 'Bạn đang xem các session của chính tài khoản này; các thao tác thu hồi bị khóa để tránh tự làm mất phiên đăng nhập.'
                                : 'Session của tài khoản ADMIN chỉ được xem trong MVP; không có thao tác thu hồi từ Admin Center.'
                            : 'Thu hồi session khiến user phải đăng nhập lại trên thiết bị tương ứng. Nhập lý do ở khung bên trái trước khi thu hồi.'}
                    </p>
                </div>
                {isMutationProtected ? (
                    <span className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-500">
                        Chỉ xem
                    </span>
                ) : (
                    <Button
                        variant="ghost"
                        type="button"
                        disabled={
                            !sessions.length || isPending || !reason.trim()
                        }
                        onClick={() => onRevoke({ revokeAll: true })}
                        className="shrink-0 whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Thu hồi tất cả
                    </Button>
                )}
            </div>
            {isMutationProtected ? (
                <div className="mt-4 flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
                    <LockKeyhole className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                    <p>
                        {isSelfProtected
                            ? 'Không thể thu hồi session của chính tài khoản đang đăng nhập. Hãy dùng chức năng đăng xuất trên thiết bị tương ứng nếu cần.'
                            : 'Admin khác có thể xem metadata session để kiểm tra vận hành, nhưng không thể thu hồi session của tài khoản quản trị.'}
                    </p>
                </div>
            ) : null}
            <div className="mt-4 space-y-3">
                {sessions.length ? (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium text-zinc-900">
                                        {session.deviceName} · {session.browser}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        {session.os} · IP{' '}
                                        {session.ipAddress ?? 'Không rõ'} · hoạt
                                        động{' '}
                                        {formatAdminUserDate(
                                            session.lastActiveAt,
                                        )}
                                    </p>
                                </div>
                                {isMutationProtected ? (
                                    <span className="text-xs font-semibold text-zinc-400">
                                        Chỉ xem
                                    </span>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        disabled={!reason.trim() || isPending}
                                        onClick={() =>
                                            onRevoke({ sessionId: session.id })
                                        }
                                        className="text-xs font-semibold text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Thu hồi
                                    </Button>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-zinc-500">
                                Hết hạn:{' '}
                                {formatAdminUserDate(session.expiresAt)}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg bg-zinc-50 p-5 text-center text-sm text-zinc-500">
                        <XCircle className="mx-auto size-5 text-zinc-300" />
                        <p className="mt-2">Không có session đang hoạt động</p>
                    </div>
                )}
            </div>
        </div>
    );
}
