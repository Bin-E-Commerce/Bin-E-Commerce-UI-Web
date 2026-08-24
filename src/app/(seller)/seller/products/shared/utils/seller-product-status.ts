import type {
    SellerProductPublicationStatus,
    SellerProductStatus,
} from '@/services/product';

// Tính trạng thái tiếp theo cho thao tác nhanh; bản nháp luôn đi vào ACTIVE khi seller đăng bán.
export function getNextSellerProductStatus(
    status: SellerProductStatus,
): SellerProductPublicationStatus {
    return status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
}
