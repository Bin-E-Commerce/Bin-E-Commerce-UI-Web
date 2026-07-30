import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    SellerProductListParams,
    SellerProductListResponse,
} from './types/seller-product.types';

export const sellerProductService = {
    // Gọi endpoint đã được API Gateway bảo vệ; backend tự lấy chủ sở hữu từ JWT nên FE không gửi sellerId.
    listOwnedProducts: (params: SellerProductListParams = {}) =>
        authorizedAxios
            .get<SellerProductListResponse>(
                `${API_VERSION}/products/seller`,
                { params },
            )
            .then((response) => response.data),
};
