'use client';

import { ProfileSidebar } from '@/components/layout/profile-sidebar';
import { ChangePasswordForm } from './components/ChangePasswordForm';

// Trang bảo mật chỉ giữ bố cục, phần form và logic đổi mật khẩu được tách thành feature components/hooks.
export default function SecurityPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <main className="flex-1">
                    <section className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
                        <div className="mb-7">
                            <h2 className="text-xl font-semibold text-zinc-950">
                                Đổi mật khẩu
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">
                                Cập nhật mật khẩu định kỳ để bảo vệ tài khoản
                                và các phiên đăng nhập của bạn.
                            </p>
                        </div>

                        <ChangePasswordForm />
                    </section>
                </main>
            </div>
        </div>
    );
}
