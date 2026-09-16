// File này sở hữu orchestration query cho product detail; dữ liệu phụ được fail-soft để không chặn nội dung chính.

'use client';

import { useQuery } from '@tanstack/react-query';

import { useAppSelector } from '@/store/hooks';
import { productService } from '@/services/product';
import { getRecommendations } from '@/services/recommendation';
import { useRecommendationSessionId } from '@/services/recommendation/hooks/use-recommendation-session';
import type {
    ProductDetailData,
    ProductDetailRecommendation,
} from '../types/product-detail.types';
import {
    filterRecommendationProducts,
    filterShopProducts,
    getProductShopFilter,
} from '../utils/product-detail-recommendations';

// Recommendation là phần bổ trợ; lỗi hoặc độ trễ của nó không được chặn product detail chính.
async function fetchProductRecommendations(
    productId: string,
): ReturnType<typeof getRecommendations> {
    return getRecommendations({
        surface: 'product_detail',
        productId,
        page: 1,
        pageSize: 24,
    });
}

// Lọc item ở client như lớp bảo vệ thứ hai sau backend, sau đó gắn request/rank/ranking mode vào card.
// Lọc tuần tự rồi mới cắt 24 để item cùng shop ở đầu response không che mất item hợp lệ ở phía sau khi backend fallback.
// Response lỗi được giữ độc lập với shop query: recommendation rỗng không làm mất catalog cùng shop.
function mapRecommendationItems(
    response: Awaited<ReturnType<typeof getRecommendations>> | undefined,
    currentProduct: ProductDetailData['product'],
): ProductDetailRecommendation[] {
    const mappedIds = new Set<string>();
    const allowedItems: Array<
        Awaited<ReturnType<typeof getRecommendations>>['items'][number]
    > = [];

    for (const item of response?.items ?? []) {
        const isAllowed =
            !mappedIds.has(item.product.id) &&
            filterRecommendationProducts([item.product], currentProduct, 1)
                .length > 0;
        if (!isAllowed) continue;
        mappedIds.add(item.product.id);
        allowedItems.push(item);
        if (allowedItems.length >= 24) break;
    }

    return allowedItems.map((item) => ({
        ...item,
        recommendationRequestId: response?.requestId,
        recommendationItemId: item.recommendationItemId,
        recommendationPolicyVersion: response?.rankingPolicyVersion,
        recommendationRankingMode: response?.rankingMode,
    }));
}

// Tách product chính, recommendation và shop catalog thành các query độc lập để lỗi một nguồn không chặn hai nguồn còn lại.
// Recommendation chỉ chạy khi guest session sẵn sàng; shop catalog chạy theo snapshot product và lấy dư một item để loại self.
// Data trả về luôn có mảng rỗng an toàn cho hai section phụ, còn lỗi product chính vẫn được route hiển thị bằng error state.
export function useProductDetail(productId: string) {
    const initialized = useAppSelector((state) => state.auth.initialized);
    const userId = useAppSelector((state) => state.auth.user?.id ?? 'guest');
    const recommendationSessionId = useRecommendationSessionId();

    const productQuery = useQuery({
        queryKey: ['products', 'detail', productId],
        queryFn: () => productService.getProductById(productId),
        enabled: Boolean(productId) && initialized,
        staleTime: 0,
        refetchOnWindowFocus: true,
    });

    const recommendationQuery = useQuery({
        queryKey: [
            'recommendations',
            'product-detail',
            productId,
            userId,
            recommendationSessionId ?? 'pending',
        ],
        queryFn: () => fetchProductRecommendations(productId),
        // Chờ session chỉ cho query phụ; product detail không bị phụ thuộc vào việc tạo guest session ở browser.
        enabled:
            Boolean(productId) &&
            initialized &&
            Boolean(recommendationSessionId),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 0,
    });

    const currentProduct = productQuery.data;
    const shopProductsQuery = useQuery({
        queryKey: [
            'products',
            'detail',
            'shop-products',
            currentProduct?.id,
            currentProduct?.originType,
            currentProduct?.sellerShopId,
            currentProduct?.externalShop?.id,
            currentProduct?.externalShopId,
        ],
        queryFn: async () => {
            if (!currentProduct) return [];
            const shopFilter = getProductShopFilter(currentProduct);
            if (!shopFilter) return [];

            const response = await productService.listProducts({
                page: 1,
                // Lấy dư một item để client loại sản phẩm đang xem mà vẫn đủ sáu card.
                pageSize: 7,
                status: 'ACTIVE',
                inStock: true,
                sort: 'sold_desc',
                ...shopFilter,
            });
            return filterShopProducts(response.items, currentProduct, 6);
        },
        enabled: Boolean(currentProduct),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 0,
    });

    return {
        ...productQuery,
        data: productQuery.data
            ? ({
                  product: productQuery.data,
                  shopProducts: shopProductsQuery.data ?? [],
                  recommendations: mapRecommendationItems(
                      recommendationQuery.data,
                      productQuery.data,
                  ),
              } satisfies ProductDetailData)
            : undefined,
        // Section liên quan có thể vẫn đang tải sau khi nội dung product đã hiển thị.
        isFetching:
            productQuery.isFetching ||
            recommendationQuery.isFetching ||
            shopProductsQuery.isFetching,
    };
}
