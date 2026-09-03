// Hook này đọc từng trang sản phẩm gợi ý; quyền truy cập được kiểm soát ở component trước khi gọi API.

'use client';

import { useQuery } from '@tanstack/react-query';

import { productService } from '@/services/product';
import { RECOMMENDATIONS_PAGE_SIZE } from '../constants/recommendations.constants';

// Tải đúng 24 sản phẩm theo trang để giao diện luôn khớp với lưới sáu cột trên màn hình lớn.
export function useRecommendations(enabled: boolean, page: number) {
    return useQuery({
        queryKey: ['recommendations', 'products', page],
        queryFn: () =>
            productService.listProducts({
                page,
                pageSize: RECOMMENDATIONS_PAGE_SIZE,
                status: 'ACTIVE',
                sort: 'newest',
            }),
        enabled,
        staleTime: 30_000,
    });
}
