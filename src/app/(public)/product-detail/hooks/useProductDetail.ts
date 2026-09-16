'use client';

import { useQuery } from '@tanstack/react-query';

import { useAppSelector } from '@/store/hooks';
import { productService } from '@/services/product';
import { getRecommendations } from '@/services/recommendation';
import { useRecommendationSessionId } from '@/services/recommendation/hooks/use-recommendation-session';
import type { RecommendationResponse } from '@/services/recommendation/types/recommendation.types';
import type {
    ProductDetailData,
    ProductDetailRecommendation,
} from '../types/product-detail.types';

// Recommendation là phần bổ trợ; lỗi hoặc độ trễ của nó không được chặn product detail chính.
async function fetchProductRecommendations(
    productId: string,
): Promise<RecommendationResponse> {
    try {
        return await getRecommendations({
            surface: 'product_detail',
            productId,
            page: 1,
            pageSize: 6,
        });
    } catch {
        // Fallback catalog chỉ phục vụ section liên quan khi Recommendation Service tạm thời lỗi.
        const response = await productService.listProducts({
            page: 1,
            pageSize: 7,
            status: 'ACTIVE',
            inStock: true,
            sort: 'sold_desc',
        });
        return {
            requestId: '',
            strategy: 'COLD_START',
            profileState: 'GUEST',
            items: response.items.map((product, index) => ({
                product,
                recommendationItemId: `fallback-${product.id}`,
                rank: index + 1,
                score: 0,
                source: 'FALLBACK_BEST_SELLING',
                reasons: ['Được chọn từ những sản phẩm bán chạy'],
            })),
            page: 1,
            pageSize: 7,
            total: response.total,
            totalPages: response.totalPages,
            generatedAt: new Date().toISOString(),
            ruleVersion: 'fallback',
            rankingPolicyVersion: 'fallback',
            rankingMode: 'HYBRID',
            rankingModelVersion: null,
            experiment: null,
        };
    }
}

// Gắn context recommendation vào item để click/card tracking giữ đúng request, rank và experiment đã phục vụ.
function mapRecommendationItems(
    response: RecommendationResponse | undefined,
    currentProductId: string,
): ProductDetailRecommendation[] {
    return (response?.items ?? [])
        .filter((item) => item.product.id !== currentProductId)
        .map((item) => ({
            ...item,
            recommendationRequestId: response?.requestId,
            recommendationItemId: item.recommendationItemId,
            recommendationPolicyVersion: response?.rankingPolicyVersion,
            recommendationExperimentId: response?.experiment?.id,
            recommendationExperimentVariant: response?.experiment?.variant,
        }));
}

// Tách query product và recommendation để nội dung chính render ngay cả khi session hoặc recommendation backend chậm.
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

    return {
        ...productQuery,
        data: productQuery.data
            ? ({
                  product: productQuery.data,
                  recommendations: mapRecommendationItems(
                      recommendationQuery.data,
                      productQuery.data.id,
                  ),
              } satisfies ProductDetailData)
            : undefined,
        // Section liên quan có thể vẫn đang tải sau khi nội dung product đã hiển thị.
        isFetching: productQuery.isFetching || recommendationQuery.isFetching,
    };
}
