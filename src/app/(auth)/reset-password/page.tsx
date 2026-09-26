// Trang hoàn tất khôi phục mật khẩu; dữ liệu nhạy cảm chỉ nằm trong form client và không được lưu vào URL.
import Link from 'next/link';
import { Suspense } from 'react';

import { ResetPasswordForm } from './components/ResetPasswordForm';

export default function ResetPasswordPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    Đặt lại mật khẩu
                </h1>
                <p className="text-sm leading-6 text-zinc-500">
                    Nhập mã OTP trong email và tạo mật khẩu mới cho tài khoản.
                </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
                Mã OTP chỉ có hiệu lực trong thời gian giới hạn. Không chia sẻ
                mã xác thực với bất kỳ ai.
            </div>

            <Suspense
                fallback={
                    <div className="h-11 w-full animate-pulse rounded-lg bg-zinc-100" />
                }
            >
                <ResetPasswordForm />
            </Suspense>

            <Link
                href="/forgot-password"
                className="flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
                Yêu cầu mã mới
            </Link>
        </div>
    );
}
