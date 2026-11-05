// Trang tổng quan hồ sơ chỉ trình bày dữ liệu đã xác thực; chỉnh sửa được giao cho dialog riêng.
'use client';

import { Calendar, Mail, Phone, User } from 'lucide-react';
import { useSelector } from 'react-redux';

import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';
import type { RootState } from '@/store';

import { getAvatarVariantUrls } from './avatar/utils/avatar-image';
import { ProfileEditDialog } from './components/ProfileEditDialog';
import { RefundBankAccountCard } from './components/RefundBankAccountCard';

// Hiển thị hồ sơ đồng bộ với Auth state, còn thay đổi dữ liệu được xác nhận qua Auth Service.
export default function ProfilePage() {
    const { user } = useSelector((state: RootState) => state.auth);

    if (!user) {
        return (
            <div className="flex h-64 items-center justify-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            </div>
        );
    }

    const initials = user.name
        .split(' ')
        .map((word) => word[0])
        .slice(-2)
        .join('')
        .toUpperCase();
    const avatarVariants = getAvatarVariantUrls(user.avatarUrl);

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-0 lg:px-0">
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <main className="min-w-0 flex-1 space-y-6">
                    <section className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        {avatarVariants ? (
                            <img
                                src={avatarVariants.medium}
                                srcSet={`${avatarVariants.thumb} 128w, ${avatarVariants.medium} 512w, ${avatarVariants.large} 1080w`}
                                sizes="64px"
                                alt={user.name}
                                className="h-16 w-16 rounded-full object-cover"
                            />
                        ) : (
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-xl font-bold text-white">
                                {initials}
                            </span>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-zinc-900">
                                {user.name}
                            </p>
                            <p className="truncate text-sm text-zinc-500">
                                {user.email}
                            </p>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-zinc-900">
                                    Thông tin cá nhân
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Quản lý tên và số điện thoại liên hệ của
                                    bạn.
                                </p>
                            </div>
                            <ProfileEditDialog
                                user={{
                                    name: user.name,
                                    email: user.email,
                                    phone: user.phone,
                                }}
                            />
                        </div>

                        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
                                <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                                <div className="min-w-0">
                                    <dt className="text-xs font-medium text-zinc-500">
                                        Họ và tên
                                    </dt>
                                    <dd className="mt-1 break-words text-sm font-medium text-zinc-900">
                                        {user.name}
                                    </dd>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                                <div className="min-w-0">
                                    <dt className="text-xs font-medium text-zinc-500">
                                        Email
                                    </dt>
                                    <dd className="mt-1 break-all text-sm font-medium text-zinc-900">
                                        {user.email}
                                    </dd>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                                <div className="min-w-0">
                                    <dt className="text-xs font-medium text-zinc-500">
                                        Điện thoại
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-zinc-900">
                                        {user.phone || (
                                            <span className="font-normal text-zinc-400">
                                                Chưa cập nhật
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            </div>
                            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4">
                                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                                <div className="min-w-0">
                                    <dt className="text-xs font-medium text-zinc-500">
                                        Ngày tham gia
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-zinc-900">
                                        {new Date(
                                            user.createdAt,
                                        ).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </section>

                    <RefundBankAccountCard userId={user.id} />
                </main>
            </div>
        </div>
    );
}
