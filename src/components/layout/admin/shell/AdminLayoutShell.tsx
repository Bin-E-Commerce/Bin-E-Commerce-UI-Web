'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

import { AdminSidebar } from '@/components/layout/admin/sidebar';
import { AdminTopbar } from '@/components/layout/admin/topbar';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import {
    ADMIN_ACCESS_DENIED_PATH,
    canAccessAdmin,
    canAccessAdminPath,
    getDefaultAdminPath,
} from '@/services/auth/access';

interface AdminLayoutShellProps {
    children: ReactNode;
}

// Khung layout dùng chung cho mọi trang admin: kiểm tra đăng nhập, quyền và render shell quản trị.
// Layout chỉ điều hướng UI; API vẫn phải được backend bảo vệ bằng permission guard tương ứng.
export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, initialized } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const pathname = usePathname();
    const hasAnyAdminAccess = canAccessAdmin(user);
    const hasCurrentPathAccess = canAccessAdminPath(pathname, user);

    useEffect(() => {
        if (initialized && !user) {
            // Chưa đăng nhập thì quay về login, giữ redirect để đăng nhập xong có thể trở lại trang đang mở.
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [initialized, pathname, router, user]);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!initialized || !user) return;

        if (pathname === ADMIN_ACCESS_DENIED_PATH) {
            // Nếu token mới đã có quyền admin, không để user kẹt ở trang deny sau khi đăng nhập lại/cấp quyền.
            if (hasAnyAdminAccess) router.replace(getDefaultAdminPath(user));
            return;
        }

        // User có permission admin khác nhưng đi nhầm route sẽ được đưa về trang đầu tiên được phép.
        // Nếu không có permission admin nào, chuyển sang màn deny thay vì render nội dung quản trị.
        if (!hasCurrentPathAccess) {
            router.replace(
                hasAnyAdminAccess
                    ? getDefaultAdminPath(user)
                    : ADMIN_ACCESS_DENIED_PATH,
            );
        }
    }, [hasAnyAdminAccess, hasCurrentPathAccess, initialized, pathname, router, user]);

    if (!initialized || !user) return null;

    if (pathname === ADMIN_ACCESS_DENIED_PATH) {
        return hasAnyAdminAccess ? null : children;
    }

    if (!hasAnyAdminAccess || !hasCurrentPathAccess) return null;

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950">
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
                <AdminSidebar />
            </div>

            {sidebarOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-zinc-950/45"
                        aria-label="Đóng menu quản trị"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative h-full w-80 max-w-[86vw] bg-white shadow-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-3 z-10"
                            aria-label="Đóng menu quản trị"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="size-5" />
                        </Button>
                        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>
            ) : null}

            <div className="lg:pl-80">
                <AdminTopbar
                    userName={user.name}
                    userRole={user.role}
                    avatarUrl={user.avatarUrl}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />
                <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
