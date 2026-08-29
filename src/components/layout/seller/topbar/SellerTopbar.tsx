'use client';

import { Menu, Search, Store, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/common/notifications';
import { cn } from '@/lib/utils';

interface SellerTopbarProps {
    shopName: string;
    userName: string;
    avatarUrl?: string | null;
    onOpenSidebar: () => void;
}

// Topbar giữ các hành động thường dùng của seller luôn ở trên cùng khi cuộn nội dung.
export function SellerTopbar({
    shopName,
    userName,
    avatarUrl,
    onOpenSidebar,
}: SellerTopbarProps) {
    return (
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onOpenSidebar}
                    aria-label="Mở menu người bán"
                >
                    <Menu className="size-5" />
                </Button>

                <div className="hidden min-w-0 items-center gap-3 lg:flex">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100">
                        <Store className="size-4 text-zinc-700" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-950">{shopName}</p>
                        <p className="text-xs text-zinc-500">Không gian quản trị người bán</p>
                    </div>
                </div>

                <div className="mx-auto hidden h-10 w-full max-w-xl items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 md:flex">
                    <Search className="size-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400">Tìm đơn hàng, sản phẩm hoặc mã vận đơn...</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" className="hidden sm:inline-flex">
                        Xem shop
                    </Button>
                    <NotificationBell />
                    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5">
                        <div
                            className={cn(
                                'flex size-8 items-center justify-center overflow-hidden rounded-full bg-zinc-950 text-xs font-semibold text-white',
                                avatarUrl ? 'bg-zinc-100' : '',
                            )}
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Ảnh đại diện người bán"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <UserRound className="size-4" />
                            )}
                        </div>
                        <span className="hidden max-w-32 truncate text-sm font-medium text-zinc-800 sm:block">
                            {userName}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
