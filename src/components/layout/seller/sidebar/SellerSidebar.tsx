// File này kết nối navigation Seller với unread notification count để menu Đơn hàng có badge đồng bộ cùng chuông.

'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Store } from 'lucide-react';

import type { RootState } from '@/store';
import type { SellerNavItem } from './types/seller-nav-item.type';
import {
    useMarkNotificationsReadByBadgeKey,
    useNotificationCounts,
} from '@/common/notifications';
import { SellerSidebarGroup } from './components/SellerSidebarGroup';
import { mapSellerNavigation } from './utils/map-seller-navigation';

interface SellerSidebarProps {
    onNavigate?: () => void;
}

// Sidebar chính của Seller Center, tự nhận pathname hiện tại để giữ trạng thái active nhất quán.
export function SellerSidebar({ onNavigate }: SellerSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const user = useSelector((state: RootState) => state.auth.user);
    const search = searchParams.toString();
    const notificationCounts = useNotificationCounts();
    const markBadgeRead = useMarkNotificationsReadByBadgeKey();

    // Navigation code trùng với badgeKey do backend cấp, giúp mỗi menu chỉ hiển thị unread count của chính nó.
    const visibleGroups = mapSellerNavigation(user).map((group) => ({
        ...group,
        items: group.items.map((item) => ({
            ...item,
            badgeCount: notificationCounts.data?.byBadgeKey[item.code] ?? 0,
        })),
    }));

    // Khi Seller mở menu Đơn hàng, dọn đúng nhóm notification liên quan mà không ảnh hưởng các thông báo khác.
    function handleItemNavigate(item: SellerNavItem) {
        onNavigate?.();
        if ((item.badgeCount ?? 0) > 0) {
            markBadgeRead.mutate(item.code);
        }
    }

    return (
        <aside className="flex h-full w-72 shrink-0 flex-col border-r border-zinc-200 bg-white">
            <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <Store className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-950">Bin Seller Center</p>
                    <p className="truncate text-xs text-zinc-500">Vận hành shop chuyên nghiệp</p>
                </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {visibleGroups.map((group) => (
                    <SellerSidebarGroup
                        key={group.title}
                        group={group}
                        pathname={pathname}
                        search={search}
                        onNavigate={handleItemNavigate}
                    />
                ))}
            </nav>
        </aside>
    );
}
