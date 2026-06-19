'use client';

import Link from 'next/link';
import { useDispatch } from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Settings, ShoppingBag, MapPin, LogOut } from 'lucide-react';
import type { AppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';

interface UserMenuDropdownProps {
    name: string;
    email: string;
    initials: string;
    avatarUrl?: string;
}

export function UserMenuDropdown({
    name,
    email,
    initials,
    avatarUrl,
}: UserMenuDropdownProps) {
    const dispatch = useDispatch<AppDispatch>();

    return (
        <DropdownMenu.Portal>
            <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-50 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
            >
                {/* User info */}
                <div className="px-3 py-2 mb-1">
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                        {name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">{email}</p>
                </div>
                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />

                <DropdownMenu.Item asChild>
                    <Link
                        href="/profile"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50 cursor-pointer"
                    >
                        <Settings className="h-4 w-4 text-zinc-400" />
                        Thông tin tài khoản
                    </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                    <Link
                        href="/orders"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50 cursor-pointer"
                    >
                        <ShoppingBag className="h-4 w-4 text-zinc-400" />
                        Đơn hàng của tôi
                    </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                    <Link
                        href="/addresses"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-50 cursor-pointer"
                    >
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        Địa chỉ giao hàng
                    </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />

                <DropdownMenu.Item
                    onSelect={() => dispatch(logoutUser())}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 outline-none transition-colors hover:bg-red-50 cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    );
}
