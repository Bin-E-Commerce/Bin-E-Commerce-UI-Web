import { API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';
import type {
    ListProductsParams,
    PaginatedProductResponse,
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
};
