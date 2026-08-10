'use client';

import { useQuery } from '@tanstack/react-query';

import {
    adminShopProfileChangesService,
    type ListShopProfileChangeRequestsParams,
} from '@/services/admin';

export const SHOP_PROFILE_CHANGES_QUERY_KEY = [
    'admin',
    'shop-profile-changes',
] as const;

// Tải hàng đợi theo filter và giữ dữ liệu cũ trong lúc đổi trang để bảng không nhấp nháy.
export function useShopProfileChangeRequests(
    params: ListShopProfileChangeRequestsParams,
) {
    return useQuery({
        queryKey: [...SHOP_PROFILE_CHANGES_QUERY_KEY, params],
        queryFn: () => adminShopProfileChangesService.list(params),
        placeholderData: (previousData) => previousData,
    });
}
