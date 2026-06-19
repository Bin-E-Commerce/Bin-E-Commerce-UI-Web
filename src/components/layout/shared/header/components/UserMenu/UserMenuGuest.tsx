import Link from 'next/link';

export function UserMenuGuest() {
    return (
        <div className="flex items-center gap-2">
            <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
                Đăng nhập
            </Link>
            <span className="text-zinc-300">|</span>
            <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
                Đăng ký
            </Link>
        </div>
    );
}
