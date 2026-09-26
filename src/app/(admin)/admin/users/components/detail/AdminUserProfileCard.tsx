// Card profile của user detail; chỉ trình bày dữ liệu user và không sở hữu mutation.
import type { AdminUserDetail } from '@/services/admin';
import { AdminUserAvatar } from '../shared/AdminUserAvatar';
import {
    formatAdminUserDate,
    getAdminUserStatusClass,
} from '../../utils/admin-user.utils';

interface AdminUserProfileCardProps {
    user: AdminUserDetail;
}

// Hiển thị identity, role/status và các mốc vận hành quan trọng của tài khoản.
export function AdminUserProfileCard({ user }: AdminUserProfileCardProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <AdminUserAvatar
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    className="size-14 text-xl"
                    fallback="logo"
                />
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        User profile
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
                        {user.name}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
                </div>
                <div className="sm:ml-auto">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                        {user.role}
                    </span>
                    <span
                        className={`ml-2 rounded-full px-3 py-1 text-xs font-semibold ${getAdminUserStatusClass()}`}
                    >
                        {user.status}
                    </span>
                </div>
            </div>
            <div className="mt-6 grid gap-4 border-t border-zinc-100 pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                        Số điện thoại
                    </p>
                    <p className="mt-1 text-zinc-800">
                        {user.phone ?? 'Chưa có'}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                        Đăng nhập gần nhất
                    </p>
                    <p className="mt-1 text-zinc-800">
                        {formatAdminUserDate(user.lastLoginAt)}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                        Tạo tài khoản
                    </p>
                    <p className="mt-1 text-zinc-800">
                        {formatAdminUserDate(user.createdAt)}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-400">
                        Session đang hoạt động
                    </p>
                    <p className="mt-1 text-zinc-800">{user.sessionCount}</p>
                </div>
            </div>
        </section>
    );
}
