'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft, Store, X } from 'lucide-react';

import { SellerSidebar } from '@/components/layout/seller/sidebar';
import { SellerTopbar } from '@/components/layout/seller/topbar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RootState } from '@/store';
import {
    canAccessAdmin,
    canAccessSellerCenter,
    canViewSellerDashboard,
} from '@/services/auth/access';

interface SellerLayoutShellProps {
    children: React.ReactNode;
}

const SELLER_ACCESS_DENIED_PATH = '/seller/access-denied';

// Bao toàn bộ Seller Center để xử lý auth, permission, topbar và sidebar responsive ở một nơi duy nhất.
// Các trang đăng ký seller được đi qua layout này nhưng không yêu cầu quyền vào Seller Center.
export function SellerLayoutShell({ children }: SellerLayoutShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, initialized } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const pathname = usePathname();
    const isRegisterRoute = pathname.startsWith('/seller/register');
    const isAccessDeniedRoute = pathname === SELLER_ACCESS_DENIED_PATH;
    const canEnterSellerCenter = canAccessSellerCenter(user);
    const isSellerDashboardRoute = pathname === '/seller';

    useEffect(() => {
        if (initialized && !user) {
            // Chưa đăng nhập thì đưa về login vì chỉ tài khoản đã đăng ký mới được mở hồ sơ seller.
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [initialized, pathname, router, user]);

    useEffect(() => {
        if (!initialized || !user || isRegisterRoute) return;

        if (isAccessDeniedRoute) {
            // Nếu user vừa được cấp quyền vào Seller Center, không để họ ở lại màn hình từ chối quyền.
            if (canEnterSellerCenter) router.replace('/seller');
            return;
        }

        if (!canEnterSellerCenter) {
            // Nhân sự nội bộ đi nhầm Seller Center sẽ thấy màn deny để không hiểu nhầm là cần đăng ký shop.
            // Customer thường được đưa sang đăng ký bán hàng vì họ là đối tượng hợp lệ để bắt đầu onboarding.
            router.replace(canAccessAdmin(user) ? SELLER_ACCESS_DENIED_PATH : '/seller/register');
        }

        if (isSellerDashboardRoute && !canViewSellerDashboard(user)) {
            // Quyền vào Seller Center chỉ mở khung chung; dashboard vẫn cần quyền xem riêng để sau này phân quyền theo module.
            router.replace(SELLER_ACCESS_DENIED_PATH);
        }
    }, [
        canEnterSellerCenter,
        initialized,
        isAccessDeniedRoute,
        isSellerDashboardRoute,
        isRegisterRoute,
        pathname,
        router,
        user,
    ]);

    // Khi đổi route trên mobile, tự đóng sidebar để người bán quay lại nội dung đang thao tác.
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (!initialized || !user) return null;

    if (isAccessDeniedRoute) return canEnterSellerCenter ? null : children;

    // Route đăng ký seller dùng khung riêng vì người dùng lúc này chưa có shop để quản trị.
    // Không render SellerSidebar ở đây để tránh tạo cảm giác đã vào được Seller Center.
    if (isRegisterRoute) {
        return (
            <div className="min-h-screen bg-zinc-50 text-zinc-950">
                <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                        <Link href="/" className="flex min-w-0 items-center gap-3">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                <Store className="size-5" />
                            </span>
                            <span className="min-w-0">
                                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                                    Bin Seller
                                    <span className="hidden rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-500 sm:inline-flex">
                                        Onboarding
                                    </span>
                                </span>
                                <span className="block truncate text-xs text-zinc-500">
                                    Đăng ký trở thành người bán
                                </span>
                            </span>
                        </Link>

                        <div className="flex shrink-0 items-center gap-2">
                            <Link
                                href="/"
                                className={cn(
                                    buttonVariants({ variant: 'outline', size: 'sm' }),
                                    'h-9 gap-2 rounded-full px-3 shadow-sm',
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                <span className="hidden sm:inline">Về trang mua sắm</span>
                                <span className="sm:hidden">Quay lại</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        );
    }

    if (!canEnterSellerCenter) return null;

    const shopName = user.name ? `Shop ${user.name}` : 'Shop của tôi';

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950">
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
                <SellerSidebar />
            </div>

            {sidebarOpen ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-zinc-950/45"
                        aria-label="Đóng menu người bán"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative h-full w-80 max-w-[86vw] bg-white shadow-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-3 z-10"
                            aria-label="Đóng menu người bán"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="size-5" />
                        </Button>
                        <SellerSidebar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>
            ) : null}

            <div className="min-w-0 lg:pl-72">
                <SellerTopbar
                    shopName={shopName}
                    userName={user.name}
                    avatarUrl={user.avatarUrl}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />
                <main className="mx-auto w-full min-w-0 max-w-[1500px] overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
