// Data hooks của trang shop public.
// Profile và catalog có query key riêng để từng vùng có skeleton/cache độc lập.

'use client';

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { productService } from '@/services/product';
import { publicShopService } from '@/services/seller';
import type { PublicShopResponse } from '@/services/seller';
import type { ShopCatalogFilters } from '../types/shop-page.types';

// Tải hồ sơ ngay cả khi auth đang hydrate; query key sẽ đổi từ guest sang user để cập nhật isFollowing sau đó.
export function usePublicShopProfile(slug: string) {
    const viewerId = useAppSelector((state) => state.auth.user?.id ?? 'guest');

    return useQuery({
        queryKey: ['shops', 'public', slug, viewerId],
        queryFn: () => publicShopService.getBySlug(slug),
        enabled: Boolean(slug),
        staleTime: 60_000,
    });
}

// Tải catalog theo bộ lọc; query key phụ thuộc filters để back/forward và cache từng trạng thái rõ ràng.
export function usePublicShopCatalog(
    shopId: string | undefined,
    filters: ShopCatalogFilters,
    enabled: boolean,
) {
    return useQuery({
        queryKey: ['shops', 'catalog', shopId, filters],
        queryFn: async () => {
            if (!shopId) throw new Error('Thiếu shopId để tải catalog.');
            return productService.listProducts({
                page: filters.page,
                pageSize: 12,
                search: filters.search || undefined,
                sellerShopId: shopId,
                minRating: filters.minRating,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                inStock: filters.inStock || undefined,
                sort: filters.sort,
                status: 'ACTIVE',
            });
        },
        enabled: Boolean(shopId) && enabled,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
}

// Tải summary độc lập với filters để đổi search/sort không tạo thêm request đếm sản phẩm và review.
export function usePublicShopSummary(
    shopId: string | undefined,
    enabled: boolean,
) {
    return useQuery({
        queryKey: ['shops', 'summary', shopId],
        queryFn: async () => {
            if (!shopId) throw new Error('Thiếu shopId để tải summary.');
            return productService.getShopSummary(shopId);
        },
        enabled: Boolean(shopId) && enabled,
        staleTime: 60_000,
    });
}

// Đồng bộ cache profile sau mutation để header cập nhật follower count và trạng thái button ngay lập tức.
export function useShopFollowMutation(slug: string) {
    const queryClient = useQueryClient();
    // Cập nhật ngay mọi cache profile cùng slug rồi revalidate để các viewer variant không giữ follower count cũ.
    const updateCache = (response: PublicShopResponse) => {
        queryClient.setQueriesData<PublicShopResponse>(
            { queryKey: ['shops', 'public', slug] },
            response,
        );
        queryClient.invalidateQueries({ queryKey: ['shops', 'public', slug] });
    };

    const follow = useMutation({
        mutationFn: () => publicShopService.follow(slug),
        onSuccess: updateCache,
    });
    const unfollow = useMutation({
        mutationFn: () => publicShopService.unfollow(slug),
        onSuccess: updateCache,
    });

    return { follow, unfollow };
}
