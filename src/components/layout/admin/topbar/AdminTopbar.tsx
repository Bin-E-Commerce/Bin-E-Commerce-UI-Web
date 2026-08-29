'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    ShieldCheck,
    ShoppingBag,
    UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AppDispatch } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { NotificationBell } from '@/common/notifications';

interface AdminTopbarProps {
    userName: string;
    userRole: string;
    avatarUrl?: string | null;
    onOpenSidebar: () => void;
}

// Topbar giữ thao tác admin thường dùng ở vị trí cố định và gọn để không chiếm không gian bảng dữ liệu.
export function AdminTopbar({
    userName,
    userRole,
    avatarUrl,
    onOpenSidebar,
}: AdminTopbarProps) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    // Đăng xuất khỏi Admin Center và đưa người dùng về màn hình đăng nhập.
    async function handleLogout() {
        await dispatch(logoutUser());
        router.replace('/login');
    }

    return (
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onOpenSidebar}
                    aria-label="Mở menu quản trị"
                >
                    <Menu className="size-5" />
                </Button>

                <div className="hidden min-w-0 items-center gap-3 lg:flex">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100">
                        <ShieldCheck className="size-4 text-zinc-700" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-950">
                            Admin Center
                        </p>
                        <p className="text-xs text-zinc-500">
                            Quản trị vận hành và kiểm soát nền tảng
                        </p>
                    </div>
                </div>

                <div className="mx-auto hidden h-10 w-full max-w-xl items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 md:flex">
                    <Search className="size-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400">
                        Tìm hồ sơ, người dùng, đơn hàng hoặc sản phẩm...
                    </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <NotificationBell />

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-left transition hover:bg-zinc-50 data-[state=open]:bg-zinc-50"
                                aria-label="Mở menu tài khoản quản trị"
                            >
                                <AdminAvatar avatarUrl={avatarUrl} />
                                <span className="hidden min-w-0 sm:block">
                                    <span className="block max-w-32 truncate text-sm font-medium text-zinc-800">
                                        {userName}
                                    </span>
                                    <span className="block text-[11px] uppercase tracking-wide text-zinc-400">
                                        {userRole}
                                    </span>
                                </span>
                                <ChevronDown className="hidden size-4 text-zinc-400 sm:block" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={8}
                                className="z-50 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl outline-none"
                            >
                                <div className="px-3 py-2">
                                    <p className="truncate text-sm font-semibold text-zinc-950">
                                        {userName}
                                    </p>
                                    <p className="mt-0.5 text-xs uppercase tracking-wide text-zinc-400">
                                        {userRole}
                                    </p>
                                </div>

                                <div className="my-2 h-px bg-zinc-100" />

                                <DropdownMenu.Item asChild>
                                    <Link
                                        href="/admin/dashboard"
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition hover:bg-zinc-100 focus:bg-zinc-100"
                                    >
                                        <LayoutDashboard className="size-4" />
                                        Bảng điều khiển
                                    </Link>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item asChild>
                                    <Link
                                        href="/"
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition hover:bg-zinc-100 focus:bg-zinc-100"
                                    >
                                        <ShoppingBag className="size-4" />
                                        Về trang mua sắm
                                    </Link>
                                </DropdownMenu.Item>

                                <div className="my-2 h-px bg-zinc-100" />

                                <DropdownMenu.Item
                                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-none transition hover:bg-red-50 focus:bg-red-50"
                                    onSelect={(event) => {
                                        event.preventDefault();
                                        void handleLogout();
                                    }}
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

interface AdminAvatarProps {
    avatarUrl?: string | null;
}

// Hiển thị ảnh đại diện admin nếu có, fallback về icon để menu tài khoản luôn ổn định.
function AdminAvatar({ avatarUrl }: AdminAvatarProps) {
    return (
        <div
            className={cn(
                'flex size-8 items-center justify-center overflow-hidden rounded-full bg-zinc-950 text-xs font-semibold text-white',
                avatarUrl ? 'bg-zinc-100' : '',
            )}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Ảnh đại diện quản trị viên"
                    className="h-full w-full object-cover"
                />
            ) : (
                <UserRound className="size-4" />
            )}
        </div>
    );
}
