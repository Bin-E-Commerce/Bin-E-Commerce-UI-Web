import Link from 'next/link';
import { UserRound } from 'lucide-react';

// Thu gọn thao tác tài khoản thành biểu tượng trên mobile để header không tràn, còn desktop vẫn hiển thị đủ đăng nhập và đăng ký.
export function UserMenuGuest() {
    return (
        <div className="flex items-center sm:gap-2">
            <Link
                href="/login"
                className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:h-auto sm:w-auto sm:rounded-none sm:bg-transparent sm:text-sm sm:font-medium"
                aria-label="Đăng nhập hoặc đăng ký"
            >
                <UserRound className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
            <span className="hidden text-zinc-300 sm:inline">|</span>
            <Link
                href="/register"
                className="hidden rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 sm:inline-flex"
            >
                Đăng ký
            </Link>
        </div>
    );
}
