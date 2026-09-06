'use client';

import { useQuery } from '@tanstack/react-query';

import { useAppSelector } from '@/store/hooks';
import { productService } from '@/services/product';
import {
    getRecommendationSessionId,
    getRecommendations,
} from '@/services/recommendation';
import type {
    ProductDetailData,
    ProductDetailRecommendation,
} from '../types/product-detail.types';

type ProductRecommendationResult = {
    requestId?: string;
    items: ProductDetailRecommendation[];
};

// Tải chi tiết và danh sách gợi ý song song để tránh chờ product xong mới bắt đầu request liên quan.
async function fetchProductDetail(
    productId: string,
): Promise<ProductDetailData> {
    const productPromise = productService.getProductById(productId);
    const recommendationPromise: Promise<ProductRecommendationResult> =
        getRecommendations({
            surface: 'product_detail',
            productId,
            page: 1,
            pageSize: 6,
        }).catch(() =>
            // Recommendation lỗi không được làm hỏng trang chi tiết; catalog public là fallback an toàn cho khu vực liên quan.
            productService
                .listProducts({
                    page: 1,
                    pageSize: 6,
                    status: 'ACTIVE',
                    inStock: true,
                    sort: 'sold_desc',
                })
                .then((response) => ({
                    requestId: 'product-detail-fallback',
                    items: response.items.map((item, index) => ({
                        product: item,
                        rank: index + 1,
                        source: 'FALLBACK_BEST_SELLING',
                        reasons: ['Được chọn từ những sản phẩm bán chạy'],
                    })),
                })),
        );
    const [product, recommendationPage] = await Promise.all([
        productPromise,
        recommendationPromise,
    ]);

    return {
        product,
        recommendations: recommendationPage.items
            .filter((item) => item.product.id !== product.id)
            .map((item) => ({
                ...item,
                recommendationRequestId: recommendationPage.requestId,
            })),
    };
}

// Quản lý cache riêng theo product ID để chuyển qua lại giữa các sản phẩm không tải lại dữ liệu vừa xem.
export function useProductDetail(productId: string) {
    const initialized = useAppSelector((state) => state.auth.initialized);
    const userId = useAppSelector((state) => state.auth.user?.id ?? 'guest');
    const recommendationSessionId = getRecommendationSessionId() ?? 'anonymous';

    return useQuery({
        // Session cũng ảnh hưởng danh sách liên quan nên phải nằm trong key để đổi actor không dùng dữ liệu cũ.
        queryKey: [
            'products',
            'detail',
            productId,
            userId,
            recommendationSessionId,
        ],
        queryFn: () => fetchProductDetail(productId),
        // Chờ xác định phiên đăng nhập để API detail gắn đúng likedByCurrentUser sau refresh.
        enabled: Boolean(productId) && initialized,
        // Lượt bán thay đổi theo trạng thái đơn; không giữ cache 5 phút để số đơn hoàn/hủy phản ánh ngay.
        staleTime: 0,
        refetchOnWindowFocus: true,
    });
}
