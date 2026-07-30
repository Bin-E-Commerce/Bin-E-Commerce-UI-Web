import { API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';
import type {
    ListProductsParams,
    PaginatedProductResponse,
    ProductDetail,
    PublicProduct,
} from './types/product.types';

export const productService = {
    // Homepage dùng endpoint public qua API Gateway để không phụ thuộc trực tiếp URL nội bộ của product-service.
    listProducts: (params: ListProductsParams = {}) =>
        publicAxios
            .get<PaginatedProductResponse<PublicProduct>>(
                `${API_VERSION}/products`,
                { params },
            )
            .then((response) => response.data),

    // Lấy đầy đủ quan hệ của một sản phẩm để gallery, biến thể, shop và mô tả dùng chung một request.
    getProductById: (productId: string) =>
        publicAxios
            .get<ProductDetail>(`${API_VERSION}/products/${productId}`)
            .then((response) => response.data),
};
