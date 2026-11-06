// Adapter gọi endpoint hồ sơ người dùng qua Gateway; dữ liệu tài khoản ngân hàng dùng route tách biệt.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ApiResponse,
    AuthUser,
    RefundBankAccountProfile,
    RefundBankAccountPayload,
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

// Lấy danh sách tài khoản nhận hoàn đã lưu qua endpoint hồ sơ riêng tư.
export function getRefundBankAccounts() {
    return authorizedAxios
        .get<
            ApiResponse<RefundBankAccountProfile[]>
        >(`${USERS}/me/refund-bank-accounts`)
        .then((response) => response.data);
}

// Tạo tài khoản mới; server đánh dấu mặc định khi user chưa có tài khoản nào.
export function createRefundBankAccount(payload: RefundBankAccountPayload) {
    return authorizedAxios
        .post<
            ApiResponse<RefundBankAccountProfile>
        >(`${USERS}/me/refund-bank-accounts`, payload)
        .then((response) => response.data);
}

// Cập nhật tài khoản theo ID, trong khi server vẫn kiểm tra ID thuộc user hiện tại.
export function updateRefundBankAccount(
    accountId: string,
    payload: RefundBankAccountPayload,
) {
    return authorizedAxios
        .put<
            ApiResponse<RefundBankAccountProfile>
        >(`${USERS}/me/refund-bank-accounts/${accountId}`, payload)
        .then((response) => response.data);
}

// Xóa tài khoản đã lưu; server tự chọn lại mặc định nếu vừa xóa tài khoản chính.
export function deleteRefundBankAccount(accountId: string) {
    return authorizedAxios
        .delete<
            ApiResponse<null>
        >(`${USERS}/me/refund-bank-accounts/${accountId}`)
        .then((response) => response.data);
}

// Đặt một tài khoản làm mặc định cho các lần nhập thông tin hoàn tiền sau.
export function setDefaultRefundBankAccount(accountId: string) {
    return authorizedAxios
        .put<
            ApiResponse<RefundBankAccountProfile>
        >(`${USERS}/me/refund-bank-accounts/${accountId}/default`)
        .then((response) => response.data);
}
