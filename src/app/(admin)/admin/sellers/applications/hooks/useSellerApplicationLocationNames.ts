'use client';

import { useQueries } from '@tanstack/react-query';

import { locationService } from '@/services/location';

interface UseSellerApplicationLocationNamesResult {
    provinceName: string;
    wardName: string;
    loading: boolean;
}

// Lấy tên tỉnh/phường theo id để trang chi tiết không hiển thị UUID kỹ thuật cho admin.
export function useSellerApplicationLocationNames(
    provinceId: string | null,
    wardId: string | null,
): UseSellerApplicationLocationNamesResult {
    const [provinceQuery, wardQuery] = useQueries({
        queries: [
            {
                queryKey: ['location', provinceId],
                queryFn: () => locationService.getLocationById(provinceId as string),
                enabled: Boolean(provinceId),
            },
            {
                queryKey: ['location', wardId],
                queryFn: () => locationService.getLocationById(wardId as string),
                enabled: Boolean(wardId),
            },
        ],
    });

    return {
        provinceName: provinceQuery.data?.name ?? provinceId ?? 'Chưa cung cấp',
        wardName: wardQuery.data?.name ?? wardId ?? 'Chưa cung cấp',
        loading: provinceQuery.isFetching || wardQuery.isFetching,
    };
}
