import Link from 'next/link';

export default function ForgotPasswordPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    Quên mật khẩu
                </h1>
                <p className="text-sm leading-6 text-zinc-500">
                    Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-600 shadow-sm">
                Tính năng đặt lại mật khẩu sẽ được mở trong bước hoàn thiện
                xác thực tài khoản.
            </div>

            <Link
                href="/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
                Quay lại đăng nhập
            </Link>
        </div>
    );
}
