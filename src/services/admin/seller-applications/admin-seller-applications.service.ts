import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';

import type {
    ListSellerApplicationsParams,
    ListSellerApplicationsResponse,
} from './types/admin-seller-applications.types';
import type { SellerApplicationDto } from '@/services/seller';

// Chuẩn hóa query trước khi gọi API để không gửi các giá trị rỗng làm backend hiểu sai filter.
function buildListSellerApplicationsParams(
    params: ListSellerApplicationsParams,
): Record<string, string | number> {
    const query: Record<string, string | number> = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
    };

    if (params.status && params.status !== 'all') {
        query.status = params.status;
    }

    if (params.search?.trim()) {
        query.search = params.search.trim();
    }

    return query;
}

export const adminSellerApplicationsService = {
    // Lấy danh sách hồ sơ đăng ký người bán cho admin, có phân trang và filter nhẹ.
    list: (params: ListSellerApplicationsParams = {}) =>
        authorizedAxios
            .get<ListSellerApplicationsResponse>(
                `${API_VERSION}/seller/applications/admin`,
                { params: buildListSellerApplicationsParams(params) },
            )
            .then((response) => response.data),

    // Lấy một hồ sơ theo id để trang chi tiết hiển thị đủ dữ liệu thay vì phụ thuộc vào dòng trong bảng.
    getById: (applicationId: string) =>
        authorizedAxios
            .get<SellerApplicationDto>(
                `${API_VERSION}/seller/applications/admin/${applicationId}`,
            )
            .then((response) => response.data),
};
