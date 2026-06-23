'use client';

import Link from 'next/link';
import { useDispatch } from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ArrowRight, LogOut, MapPin, Settings, ShoppingBag, Store } from 'lucide-react';

import type { AppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';

interface UserMenuDropdownProps {
    name: string;
    email: string;
    initials: string;
    avatarUrl?: string;
    role?: string;
}

// Dropdown tài khoản đặt entry seller ở ngữ cảnh tài khoản, giống một hành động nâng cấp vai trò.
export function UserMenuDropdown({
    name,
    email,
    role,
}: UserMenuDropdownProps) {
    const dispatch = useDispatch<AppDispatch>();
    const isSeller = role?.toUpperCase().includes('SELLER');

    return (
        <DropdownMenu.Portal>
            <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            >
                <div className="mb-1 px-3 py-2">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                        {name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{email}</p>
                </div>

                <DropdownMenu.Item asChild>
                    <Link
                        href={isSeller ? '/seller' : '/seller/register'}
                        className="mb-1 flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none transition-colors hover:border-zinc-300 hover:bg-white"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <Store className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-zinc-950">
                                {isSeller ? 'Seller Center' : 'Đăng ký trở thành người bán'}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                                {isSeller
                                    ? 'Quản lý shop, đơn hàng và doanh thu.'
                                    : 'Mở shop và bắt đầu bán hàng trên Bin.'}
                            </span>
                        </span>
                        <ArrowRight className="size-4 text-zinc-400" />
                    </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />

                <DropdownMenu.Item asChild>
                    <Link
                        href="/profile"
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50"
                    >
                        <Settings className="h-4 w-4 text-zinc-400" />
                        Thông tin tài khoản
                    </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                    <Link
                        href="/profile/orders"
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50"
                    >
                        <ShoppingBag className="h-4 w-4 text-zinc-400" />
                        Đơn hàng của tôi
                    </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                    <Link
                        href="/profile/addresses"
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50"
                    >
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        Địa chỉ giao hàng
                    </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />

                <DropdownMenu.Item
                    onSelect={() => dispatch(logoutUser())}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 outline-none transition-colors hover:bg-red-50"
                >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    );
}
