'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

import { SellerSidebar } from '@/components/layout/seller/sidebar';
import { SellerTopbar } from '@/components/layout/seller/topbar';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';

interface SellerLayoutShellProps {
    children: React.ReactNode;
}

// Bao toàn bộ Seller Center để xử lý auth, topbar và sidebar responsive ở một nơi duy nhất.
export function SellerLayoutShell({ children }: SellerLayoutShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, initialized } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (initialized && !user) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [initialized, pathname, router, user]);

    // Khi đổi route trên mobile, tự đóng sidebar để người bán quay lại nội dung đang thao tác.
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    if (!initialized || !user) return null;

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

            <div className="lg:pl-72">
                <SellerTopbar
                    shopName={shopName}
                    userName={user.name}
                    avatarUrl={user.avatarUrl}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />
                <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
