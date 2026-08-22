import { API_VERSION } from '@/config/api.config';
import type { ShopProfileChangeRequestDto } from '@/services/seller';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ListShopProfileChangeRequestsParams,
    ListShopProfileChangeRequestsResponse,
    RejectShopProfileChangeRequestPayload,
    ReviewShopProfileChangeRequestPayload,
} from './types/admin-shop-profile-changes.types';

const ENDPOINT = `${API_VERSION}/seller/shop/profile/change-requests/admin`;

// Loại bỏ trạng thái all trước khi gọi API vì backend chỉ nhận các giá trị enum nghiệp vụ.
function buildListParams(
    params: ListShopProfileChangeRequestsParams,
): Record<string, string | number> {
    const query: Record<string, string | number> = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
    };
    if (params.status && params.status !== 'all') {
        query.status = params.status;
    }
    return query;
}

export const adminShopProfileChangesService = {
    // Đọc hàng đợi thay đổi hồ sơ theo trạng thái để Admin Center xử lý có thứ tự.
    list: (params: ListShopProfileChangeRequestsParams = {}) =>
        authorizedAxios
            .get<ListShopProfileChangeRequestsResponse>(ENDPOINT, {
                params: buildListParams(params),
            })
            .then((response) => response.data),

    // Lấy snapshot trước và sau của một yêu cầu; response này chứa dữ liệu nhạy cảm và được backend bảo vệ riêng.
    getById: (requestId: string) =>
        authorizedAxios
            .get<ShopProfileChangeRequestDto>(`${ENDPOINT}/${requestId}`)
            .then((response) => response.data),

    // Chấp thuận request để Seller Service áp dụng toàn bộ thay đổi trong một transaction.
    approve: (
        requestId: string,
        payload: ReviewShopProfileChangeRequestPayload,
    ) =>
        authorizedAxios
            .post<ShopProfileChangeRequestDto>(
                `${ENDPOINT}/${requestId}/approve`,
                payload,
            )
            .then((response) => response.data),

    // Từ chối request và giữ nguyên hồ sơ compliance đang có hiệu lực.
    reject: (
        requestId: string,
        payload: RejectShopProfileChangeRequestPayload,
    ) =>
        authorizedAxios
            .post<ShopProfileChangeRequestDto>(
                `${ENDPOINT}/${requestId}/reject`,
                payload,
            )
            .then((response) => response.data),
};
