'use client';

import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';

import { AvatarUploadPanel } from './components/AvatarUploadPanel';

// Trang đổi ảnh đại diện giữ layout chung của khu vực profile và giao phần upload cho component riêng.
export default function AvatarPage() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <main className="min-w-0 flex-1">
                    <AvatarUploadPanel />
                </main>
            </div>
        </div>
    );
}
