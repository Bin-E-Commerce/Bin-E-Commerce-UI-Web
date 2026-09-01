'use client';

import { useQuery } from '@tanstack/react-query';

import { useAppSelector } from '@/store/hooks';
import { productService } from '@/services/product';
import type { ProductDetailData } from '../types/product-detail.types';

// Tải chi tiết và danh sách gợi ý song song để tránh chờ product xong mới bắt đầu request liên quan.
async function fetchProductDetail(productId: string): Promise<ProductDetailData> {
    const [product, recommendationPage] = await Promise.all([
        productService.getProductById(productId),
        productService.listProducts({ page: 1, pageSize: 12, status: 'ACTIVE' }),
    ]);

    return {
        product,
        recommendations: recommendationPage.items
            .filter((item) => item.id !== product.id)
            .slice(0, 6),
    };
}

// Quản lý cache riêng theo product ID để chuyển qua lại giữa các sản phẩm không tải lại dữ liệu vừa xem.
export function useProductDetail(productId: string) {
    const initialized = useAppSelector((state) => state.auth.initialized);
    const userId = useAppSelector((state) => state.auth.user?.id ?? 'guest');

    return useQuery({
        queryKey: ['products', 'detail', productId, userId],
        queryFn: () => fetchProductDetail(productId),
        // Chờ xác định phiên đăng nhập để API detail gắn đúng likedByCurrentUser sau refresh.
        enabled: Boolean(productId) && initialized,
        staleTime: 5 * 60_000,
    });
}
