// Topbar dùng chung cho Seller Center.
// Component chỉ phụ trách nhận diện workspace, tìm kiếm, thông báo và các lối tắt chính.
// Nút xem shop dùng slug public từ Seller Service; không tự suy luận URL từ tên hiển thị.
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    ChevronDown,
    LogOut,
    Menu,
    Settings,
    Store,
    UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/common/notifications';
import { cn } from '@/lib/utils';
import { shopProfileService } from '@/services/seller';
import type { AppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';

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
    const dispatch = useDispatch<AppDispatch>();

    // Lấy slug thật của shop để nút mở đúng public storefront, còn fallback giữ seller không bị kẹt khi profile đang tải.
    const profileQuery = useQuery({
        queryKey: ['seller', 'shop-profile', 'topbar'],
        queryFn: shopProfileService.getMine,
        staleTime: 60_000,
    });
    const shopHref = profileQuery.data?.shop.slug
        ? `/shop/${profileQuery.data.shop.slug}`
        : '/seller/shop';
    // Seller Center ưu tiên nhận diện bằng logo shop; avatar cá nhân chỉ là fallback khi shop chưa có ảnh đại diện.
    const displayAvatarUrl = profileQuery.data?.shop.logoUrl || avatarUrl;

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
                        <p className="truncate text-sm font-semibold text-zinc-950">
                            {shopName}
                        </p>
                        <p className="text-xs text-zinc-500">
                            Không gian quản trị người bán
                        </p>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Link
                        href={shopHref}
                        aria-label="Mở trang shop công khai"
                        className="group hidden h-9 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm transition-all hover:border-zinc-950 hover:bg-zinc-950 hover:text-white sm:inline-flex"
                    >
                        <Store className="size-4 text-zinc-500 transition-colors group-hover:text-white" />
                        Xem shop
                    </Link>
                    <NotificationBell />
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                aria-label="Mở menu tài khoản"
                                className="group flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 pr-3 shadow-sm outline-none transition-colors hover:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950/20"
                            >
                                <span
                                    className={cn(
                                        'relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-950 text-xs font-semibold text-white',
                                        displayAvatarUrl ? 'bg-zinc-100' : '',
                                    )}
                                >
                                    {displayAvatarUrl ? (
                                        // Avatar có thể đến từ media URL local hoặc CDN nên dùng trực tiếp để không bị giới hạn remote pattern của Next Image.
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={displayAvatarUrl}
                                            alt="Ảnh đại diện shop"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UserRound className="size-4" />
                                    )}
                                </span>
                                <span className="hidden max-w-36 truncate text-sm font-medium text-zinc-800 sm:block">
                                    {userName}
                                </span>
                                <ChevronDown className="size-4 text-zinc-400 transition-transform group-data-[state=open]:rotate-180" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={8}
                                className="z-50 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 shadow-xl outline-none"
                            >
                                <div className="border-b border-zinc-100 px-3 pb-3 pt-2">
                                    <p className="truncate text-sm font-semibold text-zinc-950">
                                        {userName}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Không gian quản trị người bán
                                    </p>
                                </div>
                                <DropdownMenu.Item asChild>
                                    <Link
                                        href="/seller/shop"
                                        className="mt-1 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50"
                                    >
                                        <Settings className="size-4 text-zinc-400" />
                                        Hồ sơ shop
                                    </Link>
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />
                                <DropdownMenu.Item
                                    onSelect={() => void dispatch(logoutUser())}
                                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 outline-none transition-colors hover:bg-red-50"
                                >
                                    <LogOut className="size-4" />
                                    Đăng xuất
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>
        </header>
    );
}
