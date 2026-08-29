'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useDeferredValue, useMemo } from 'react';

import { sellerProductService } from '@/services/product';

const BRAND_PAGE_SIZE = 50;

// Tải thương hiệu theo từng trang và cache theo từ khóa để popup không phải nhận toàn bộ danh mục trong một request.
export function useProductBrands(search: string, enabled: boolean) {
    const deferredSearch = useDeferredValue(search.trim());
    const brandsQuery = useInfiniteQuery({
        queryKey: ['product-brands', deferredSearch],
        queryFn: ({ pageParam }) =>
            sellerProductService.listBrands({
                search: deferredSearch || undefined,
                page: pageParam,
                pageSize: BRAND_PAGE_SIZE,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
        enabled,
        staleTime: 5 * 60_000,
    });

    // Ghép các page theo đúng thứ tự API để component chỉ cần render một danh sách liên tục.
    const brands = useMemo(
        () => brandsQuery.data?.pages.flatMap((page) => page.items) ?? [],
        [brandsQuery.data],
    );
    const total = brandsQuery.data?.pages[0]?.total ?? 0;

    return {
        ...brandsQuery,
        brands,
        total,
    };
}
