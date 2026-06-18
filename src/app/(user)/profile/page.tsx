'use client';

import { Calendar, Mail, Phone, User } from 'lucide-react';
import { useSelector } from 'react-redux';

import { ProfileSidebar } from '@/components/layout/profile-sidebar';
import type { RootState } from '@/store';

import { getAvatarVariantUrls } from './avatar/utils/avatar-image';

// Hiển thị thông tin tài khoản và dùng srcSet cho avatar để browser chọn đúng ảnh resize.
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
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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

                    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-zinc-900">
                            Thông tin cá nhân
                        </h2>
                        <dl className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-zinc-400" />
                                <dt className="w-32 text-sm text-zinc-500">
                                    Họ và tên
                                </dt>
                                <dd className="text-sm font-medium text-zinc-900">
                                    {user.name}
                                </dd>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                <dt className="w-32 text-sm text-zinc-500">
                                    Email
                                </dt>
                                <dd className="text-sm font-medium text-zinc-900">
                                    {user.email}
                                </dd>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                <dt className="w-32 text-sm text-zinc-500">
                                    Điện thoại
                                </dt>
                                <dd className="text-sm font-medium text-zinc-900">
                                    {user.phone ?? (
                                        <span className="text-zinc-400">
                                            Chưa cập nhật
                                        </span>
                                    )}
                                </dd>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-zinc-400" />
                                <dt className="w-32 text-sm text-zinc-500">
                                    Ngày tham gia
                                </dt>
                                <dd className="text-sm font-medium text-zinc-900">
                                    {new Date(
                                        user.createdAt,
                                    ).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </main>
            </div>
        </div>
    );
}
