// Menu tài khoản dùng chung cho storefront Customer.
// Tài khoản có shop sẽ ưu tiên logo shop để giữ nhận diện nhất quán khi chủ shop đang xem storefront.
// Customer thông thường vẫn chỉ dùng avatar cá nhân và không gọi thêm API hồ sơ shop.
'use client';

import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

import type { RootState } from '@/store';
import { canAccessSellerCenter } from '@/services/auth/access';
import { getUserDisplayName } from '@/services/auth';
import { shopProfileService } from '@/services/seller';
import { UserMenuSkeleton } from './UserMenuSkeleton';
import { UserMenuGuest } from './UserMenuGuest';
import { UserMenuDropdown } from './UserMenuDropdown';

// Menu tài khoản chọn đúng trạng thái guest/user và truyền user đầy đủ để dropdown kiểm tra permission.
export function UserMenu() {
    const { user, initialized } = useSelector((state: RootState) => state.auth);
    const canLoadShopLogo = canAccessSellerCenter(user);

    // Chỉ tải profile shop cho tài khoản có quyền Seller; Customer không bị phát sinh request không liên quan.
    const shopProfileQuery = useQuery({
        queryKey: ['seller', 'shop-profile', 'customer-header'],
        queryFn: shopProfileService.getMine,
        enabled: initialized && canLoadShopLogo,
        staleTime: 60_000,
    });

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
    // Ưu tiên logo shop trong storefront của Seller; avatar cá nhân vẫn là fallback cho shop chưa có logo.
    const displayAvatarUrl = shopProfileQuery.data?.shop.logoUrl || user.avatarUrl;

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="flex items-center gap-2 rounded-full p-1 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                    aria-label="Tài khoản của bạn"
                >
                    {displayAvatarUrl ? (
                        // URL ảnh có thể đến từ media local hoặc CDN nên dùng thẻ ảnh trực tiếp như màn hình Profile.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={displayAvatarUrl}
                            alt={shopProfileQuery.data?.shop.logoUrl ? 'Ảnh đại diện shop' : displayName}
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
                </button>
            </DropdownMenu.Trigger>

            <UserMenuDropdown
                name={displayName}
                email={user.email}
                user={user}
            />
        </DropdownMenu.Root>
    );
}
