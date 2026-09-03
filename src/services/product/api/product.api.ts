// File này là adapter gọi Product Service qua API Gateway.
// File không chứa state UI; mọi mutation review đều đi qua authorizedAxios để Gateway xác thực customer.
import { API_VERSION } from '@/config/api.config';
import type {
    ListProductsParams,
    PaginatedProductResponse,
    ProductDetail,
    OrderReviewStatusResponse,
    PublicProduct,
    ShopCatalogSummary,
} from '../types/product.types';
import authorizedAxios from '@/utils/authorizedAxios';
import publicAxios from '@/utils/publicAxios';

export const productService = {
    // Homepage dùng endpoint public qua API Gateway để không phụ thuộc trực tiếp URL nội bộ của product-service.
    listProducts: (params: ListProductsParams = {}) =>
        publicAxios
            .get<
                PaginatedProductResponse<PublicProduct>
            >(`${API_VERSION}/products`, { params })
            .then((response) => response.data),

    // Lấy đầy đủ quan hệ của một sản phẩm; authorizedAxios vẫn cho phép anonymous nhưng gửi identity nếu customer đã đăng nhập để biết like của mình.
    getProductById: (productId: string) =>
        authorizedAxios
            .get<ProductDetail>(`${API_VERSION}/products/${productId}`)
            .then((response) => response.data),

    // Lấy summary của shop qua Product Service để header không phải suy luận từ trang hiện tại.
    getShopSummary: (shopId: string) =>
        publicAxios
            .get<ShopCatalogSummary>(
                `${API_VERSION}/products/shops/${shopId}/summary`,
            )
            .then((response) => response.data),

    // Lấy trạng thái review của order hiện tại qua Gateway để customer không phải gọi từng sản phẩm.
    getOrderReviewStatus: (orderId: string) =>
        authorizedAxios
            .get<OrderReviewStatusResponse>(
                `${API_VERSION}/products/reviews/me`,
                { params: { orderId } },
            )
            .then((response) => response.data),

    // Gửi review đầy đủ cho đúng order item; Product Service tự kiểm tra purchase proof trước khi lưu.
    createReview: (
        productId: string,
        input: {
            orderItemId: string;
            rating: number;
            title?: string;
            content?: string;
            images?: string[];
            videos?: string[];
            isAnonymous?: boolean;
        },
    ) =>
        authorizedAxios
            .post(`${API_VERSION}/products/${productId}/reviews`, input)
            .then((response) => response.data),

    // Cập nhật review đã tồn tại; identity order item và product luôn được Product Service suy ra từ review gốc.
    updateReview: (
        reviewId: string,
        input: {
            rating?: number;
            title?: string;
            content?: string;
            images?: string[];
            videos?: string[];
            isAnonymous?: boolean;
        },
    ) =>
        authorizedAxios
            .patch(`${API_VERSION}/products/reviews/${reviewId}`, input)
            .then((response) => response.data),

    // Gắn like idempotent; backend trả lại count chuẩn để UI không phải tự đoán số lượt thích.
    likeReview: (reviewId: string) =>
        authorizedAxios
            .put<{
                reviewId: string;
                liked: boolean;
                likeCount: number;
            }>(`${API_VERSION}/products/reviews/${reviewId}/like`)
            .then((response) => response.data),

    // Bỏ like idempotent và đồng bộ lại trạng thái của đúng review đang tương tác.
    unlikeReview: (reviewId: string) =>
        authorizedAxios
            .delete<{
                reviewId: string;
                liked: boolean;
                likeCount: number;
            }>(`${API_VERSION}/products/reviews/${reviewId}/like`)
            .then((response) => response.data),
};
