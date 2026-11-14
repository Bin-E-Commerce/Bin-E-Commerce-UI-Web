// Query hooks cho listing tìm kiếm và autocomplete, tách cache để gợi ý không kéo theo kết quả phân trang.
'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product';
import type { ProductSearchFilters } from '../types/product-search.types';

// Tải một trang catalog theo toàn bộ điều kiện URL; cache key tách biệt giữa query/filter/page.
export function useProductSearch(
    filters: ProductSearchFilters,
    enabled = true,
) {
    return useQuery({
        queryKey: ['product-search', 'results', filters],
        queryFn: ({ signal }) =>
            productService.listProducts(
                {
                    page: filters.page,
                    pageSize: 24,
                    search: filters.query || undefined,
                    minPrice: filters.minPrice,
                    maxPrice: filters.maxPrice,
                    minRating: filters.minRating,
                    inStock: filters.inStock || undefined,
                    sort: filters.sort,
                },
                signal,
            ),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        retry: 1,
        enabled,
    });
}

// Tải tối đa sáu gợi ý sau debounce; query ngắn hoặc popup đóng thì không gọi API, query cũ được hủy nếu còn chạy.
export function useProductSearchSuggestions(query: string, enabled: boolean) {
    const searchTerm = query.trim();

    return useQuery({
        queryKey: ['product-search', 'suggestions', searchTerm],
        queryFn: ({ signal }) =>
            productService.getSearchSuggestions(searchTerm, signal),
        enabled: enabled && searchTerm.length >= 2,
        staleTime: 30_000,
        retry: false,
    });
}
