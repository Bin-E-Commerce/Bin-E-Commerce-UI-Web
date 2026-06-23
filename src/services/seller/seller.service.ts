import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    SellerApplicationDto,
    SellerApplicationPayload,
} from './types/seller.types';

export const sellerService = {
    // Lấy hồ sơ seller của user hiện tại để khôi phục nháp hoặc chặn gửi trùng hồ sơ.
    getMyApplication: () =>
        authorizedAxios
            .get<SellerApplicationDto | null>(
                `${API_VERSION}/seller/applications/me`,
            )
            .then((response) => response.data),

    // Lưu nháp hồ sơ từng bước; request dùng authorizedAxios nên gateway sẽ bắt buộc đăng nhập.
    saveDraft: (payload: SellerApplicationPayload) =>
        authorizedAxios
            .patch<SellerApplicationDto>(
                `${API_VERSION}/seller/applications/me`,
                payload,
            )
            .then((response) => response.data),

    // Gửi hồ sơ duyệt; backend validate lại toàn bộ dữ liệu và publish Kafka email.
    submit: (payload: SellerApplicationPayload) =>
        authorizedAxios
            .post<SellerApplicationDto>(
                `${API_VERSION}/seller/applications/submit`,
                payload,
            )
            .then((response) => response.data),
};

