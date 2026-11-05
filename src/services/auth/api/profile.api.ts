// Adapter gọi endpoint hồ sơ người dùng qua Gateway; dữ liệu tài khoản ngân hàng dùng route tách biệt.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ApiResponse,
    AuthUser,
    RefundBankAccountProfile,
    UpdateProfilePayload,
} from '../types/auth.types';

const USERS = `${API_BASE_URL}${API_VERSION}/users`;

// Lấy thông tin người dùng hiện tại từ Auth Service thông qua API Gateway.
export function getMe() {
    return authorizedAxios
        .get<ApiResponse<AuthUser>>(`${USERS}/me`)
        .then((response) => response.data);
}

// Cập nhật hồ sơ cơ bản; avatar được xác nhận riêng qua Media Service.
export function updateProfile(payload: UpdateProfilePayload) {
    return authorizedAxios
        .put<ApiResponse<AuthUser>>(`${USERS}/me`, payload)
        .then((response) => response.data);
}

// Lấy tài khoản nhận hoàn đã lưu; null cho biết user chưa dùng chức năng hoàn tiền trước đây.
export function getRefundBankAccount() {
    return authorizedAxios
        .get<ApiResponse<RefundBankAccountProfile | null>>(
            `${USERS}/me/refund-bank-account`,
        )
        .then((response) => response.data);
}

// Ghi đè tài khoản nhận hoàn mặc định sau khi người dùng xác nhận thông tin mới.
export function updateRefundBankAccount(payload: RefundBankAccountProfile) {
    return authorizedAxios
        .put<ApiResponse<RefundBankAccountProfile>>(
            `${USERS}/me/refund-bank-account`,
            payload,
        )
        .then((response) => response.data);
}
