import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    CreateSellerProductPayload,
    CreateSellerProductResponse,
    DeleteSellerProductResponse,
    ChangeSellerProductStatusResponse,
    RestoreSellerProductResponse,
    SellerProductPublicationStatus,
    UpdateSellerProductPayload,
    UpdateSellerProductResponse,
    ProductBrandListParams,
    ProductBrandListResponse,
    SellerProductListParams,
    SellerProductListResponse,
    SellerProductDetail,
} from '../types/seller-product.types';

export const sellerProductService = {
    // Gọi endpoint đã được API Gateway bảo vệ; backend tự lấy chủ sở hữu từ JWT nên FE không gửi sellerId.
    listOwnedProducts: (params: SellerProductListParams = {}) =>
        authorizedAxios
            .get<SellerProductListResponse>(`${API_VERSION}/products/seller`, {
                params,
            })
            .then((response) => response.data),

    // Lấy chi tiết qua endpoint seller để backend kiểm tra quyền đọc và ownership thay vì dùng dữ liệu storefront công khai.
    getOwnedProductById: (productId: string) =>
        authorizedAxios
            .get<SellerProductDetail>(
                `${API_VERSION}/products/seller/${productId}`,
            )
            .then((response) => response.data),

    // Tìm brand theo trang để combobox không tải toàn bộ danh mục thương hiệu vào trình duyệt.
    listBrands: (params: ProductBrandListParams = {}) =>
        authorizedAxios
            .get<ProductBrandListResponse>(`${API_VERSION}/products/brands`, {
                params,
            })
            .then((response) => response.data),

    // Tạo toàn bộ product graph; backend tự xác định shop từ user context thay vì nhận shopId từ frontend.
    createProduct: (payload: CreateSellerProductPayload) =>
        authorizedAxios
            .post<CreateSellerProductResponse>(
                `${API_VERSION}/products/seller`,
                payload,
            )
            .then((response) => response.data),

    // Gửi toàn bộ product graph để backend reconcile option, variant, inventory trong một transaction.
    updateProduct: (productId: string, payload: UpdateSellerProductPayload) =>
        authorizedAxios
            .put<UpdateSellerProductResponse>(
                `${API_VERSION}/products/seller/${productId}`,
                payload,
            )
            .then((response) => response.data),

    // Gửi yêu cầu xóa mềm; backend kiểm tra ownership, trạng thái bán và permission trước khi cập nhật.
    deleteProduct: (productId: string) =>
        authorizedAxios
            .delete<DeleteSellerProductResponse>(
                `${API_VERSION}/products/seller/${productId}`,
            )
            .then((response) => response.data),

    // Chỉ gửi trạng thái đích để bật/tắt sản phẩm mà không gửi lại toàn bộ form và media.
    changeStatus: (productId: string, status: SellerProductPublicationStatus) =>
        authorizedAxios
            .patch<ChangeSellerProductStatusResponse>(
                `${API_VERSION}/products/seller/${productId}/status`,
                { status },
            )
            .then((response) => response.data),

    // Khôi phục sản phẩm đã xóa mềm về trạng thái đang ẩn để seller chủ động bật bán lại.
    restoreProduct: (productId: string) =>
        authorizedAxios
            .post<RestoreSellerProductResponse>(
                `${API_VERSION}/products/seller/${productId}/restore`,
            )
            .then((response) => response.data),
};
