// Trang bắt đầu luồng khôi phục mật khẩu; form và trạng thái submit được tách sang feature-local component/hook.
import Link from 'next/link';

import { ForgotPasswordForm } from './components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    Quên mật khẩu
                </h1>
                <p className="text-sm leading-6 text-zinc-500">
                    Nhập email tài khoản để nhận mã xác thực đặt lại mật khẩu.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                Nếu email tồn tại, mã OTP sẽ được gửi trong ít phút. Hãy nhập mã
                ngay khi nhận được email.
            </div>

            <ForgotPasswordForm />

            <Link
                href="/login"
                className="flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
                Quay lại đăng nhập
            </Link>
        </div>
    );
}
