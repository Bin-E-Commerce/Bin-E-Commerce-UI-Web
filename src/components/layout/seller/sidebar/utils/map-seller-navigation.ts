import type { AuthUser } from '@/services/auth';
import {
    SELLER_NAVIGATION_FALLBACK_ICON,
    SELLER_NAVIGATION_ICON_MAP,
} from '../constants/seller-navigation-icons.constant';
import type {
    SellerNavGroup,
    SellerNavItem,
} from '../types/seller-nav-item.type';

// Chuyển menu backend đã lọc permission thành nhóm sidebar và giữ nguyên thứ tự nghiệp vụ do manifest quy định.
// Frontend không tự bổ sung menu fallback để tránh hiển thị chức năng mà tài khoản không được phép dùng.
export function mapSellerNavigation(
    user: AuthUser | null,
): SellerNavGroup[] {
    const navigation = user?.accessProfile?.areas.seller.navigation ?? [];
    const groupMap = new Map<
        string,
        { title: string; order: number; items: SellerNavItem[] }
    >();

    for (const item of navigation) {
        const group = groupMap.get(item.groupCode) ?? {
            title: item.groupLabel,
            order: item.groupOrder,
            items: [],
        };

        group.items.push({
            code: item.code,
            href: item.href,
            label: item.label,
            description: item.description,
            icon:
                SELLER_NAVIGATION_ICON_MAP[item.icon] ??
                SELLER_NAVIGATION_FALLBACK_ICON,
            exact: true,
        });
        groupMap.set(item.groupCode, group);
    }

    return [...groupMap.values()]
        .sort((left, right) => left.order - right.order)
        .map((group) => ({
            title: group.title,
            items: group.items,
        }));
}
