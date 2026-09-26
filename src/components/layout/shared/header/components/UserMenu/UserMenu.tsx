// Menu tài khoản dùng chung cho storefront Customer và Seller.
'use client';
import { Button } from '@/components/ui/button';

import { useSelector } from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

import type { RootState } from '@/store';
import { getUserDisplayName } from '@/services/auth';
import { UserMenuSkeleton } from './UserMenuSkeleton';
import { UserMenuGuest } from './UserMenuGuest';
import { UserMenuDropdown } from './UserMenuDropdown';

// Hiển thị trạng thái tài khoản và dùng trực tiếp ảnh đã trả trong login/refresh, không gọi thêm API shop.
export function UserMenu() {
    const { user, initialized } = useSelector((state: RootState) => state.auth);

    if (!initialized) {
        return <UserMenuSkeleton />;
    }

    if (!user) {
        return <UserMenuGuest />;
    }

    const displayName = getUserDisplayName(user);
    const initials = displayName
        .split(' ')
        .map((word) => word[0])
        .slice(-2)
        .join('')
        .toUpperCase();
    // Ưu tiên ảnh cá nhân; nếu chưa có thì fallback sang logo shop từ Auth Service.
    const displayAvatarUrl = user.avatarUrl || user.shopLogoUrl;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full p-1 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                    aria-label="Tài khoản của bạn"
                >
                    {displayAvatarUrl ? (
                        // URL ảnh có thể đến từ media local hoặc CDN nên dùng thẻ ảnh trực tiếp.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={displayAvatarUrl}
                            alt={
                                user.avatarUrl
                                    ? displayName
                                    : 'Ảnh đại diện shop'
                            }
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                            {initials}
                        </span>
                    )}
                    <span className="hidden max-w-30 truncate lg:block">
                        {displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </Button>
            </DropdownMenu.Trigger>

            <UserMenuDropdown
                name={displayName}
                email={user.email}
                user={user}
            />
        </DropdownMenu.Root>
    );
}
