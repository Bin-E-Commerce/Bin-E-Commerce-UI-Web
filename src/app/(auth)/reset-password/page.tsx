import Link from 'next/link';

export default function ResetPasswordPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    Đặt lại mật khẩu
                </h1>
                <p className="text-sm leading-6 text-zinc-500">
                    Tạo mật khẩu mới cho tài khoản của bạn.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-600 shadow-sm">
                Liên kết đặt lại mật khẩu chưa sẵn sàng hoặc đã hết hạn.
            </div>

            <Link
                href="/forgot-password"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
                Gửi lại yêu cầu
            </Link>
        </div>
    );
}
