// Query riêng cho phạm vi shop để bộ lọc/catalog sản phẩm không dùng nhầm cache hoặc API.
'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { publicShopService } from '@/services/seller';

// Tìm shop public theo query và trang; truyền AbortSignal để lần gõ cũ không giữ request mạng.
export function useShopSearch(query: string, page: number) {
    const searchTerm = query.trim();

    return useQuery({
        queryKey: ['product-search', 'shops', searchTerm, page],
        queryFn: ({ signal }) =>
            publicShopService.list(
                { search: searchTerm || undefined, page, pageSize: 12 },
                signal,
            ),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        retry: 1,
    });
}

// Lấy tối đa bốn shop đang hoạt động; query quá ngắn hoặc popup đóng thì không gọi API.
export function useShopSearchSuggestions(query: string, enabled: boolean) {
    const searchTerm = query.trim();

    return useQuery({
        queryKey: ['product-search', 'shop-suggestions', searchTerm],
        queryFn: ({ signal }) =>
            publicShopService.list(
                { search: searchTerm, page: 1, pageSize: 4 },
                signal,
            ),
        enabled: enabled && searchTerm.length >= 2,
        staleTime: 30_000,
        retry: false,
    });
}
