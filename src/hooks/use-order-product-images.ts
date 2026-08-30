'use client';

// Hook dùng chung để bổ sung ảnh hiện tại cho order cũ chưa lưu imageUrl trong snapshot.

import { useQueries } from '@tanstack/react-query';

import { getProductThumbnail } from '@/app/(public)/products/utils/product-formatters';
import { productService } from '@/services/product/product.service';

interface OrderImageCandidate {
    productId: string;
    imageUrl: string | null;
}

// Chỉ gọi Product Service cho item thiếu ảnh và cache theo productId để không tạo request lặp.
export function useOrderProductImages(items: OrderImageCandidate[]) {
    const productIds = Array.from(
        new Set(
            items
                .filter((item) => !item.imageUrl)
                .map((item) => item.productId)
                .filter(Boolean),
        ),
    );
    const productQueries = useQueries({
        queries: productIds.map((productId) => ({
            queryKey: ['order-product-preview', productId],
            queryFn: () => productService.getProductById(productId),
            select: getProductThumbnail,
            staleTime: 5 * 60_000,
            retry: 1,
        })),
    });

    return new Map(
        productIds.map((productId, index) => [
            productId,
            productQueries[index]?.data ?? null,
        ]),
    );
}
