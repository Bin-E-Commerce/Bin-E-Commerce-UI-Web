// API client cho đổi mật khẩu khi đã đăng nhập và khôi phục mật khẩu bằng OTP khi chưa đăng nhập.
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import publicAxios from '@/utils/publicAxios';
import type {
    ApiResponse,
    AuthData,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    ForgotPasswordResult,
    ResetPasswordPayload,
} from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Gửi yêu cầu tạo OTP bằng public client để người chưa đăng nhập không bị auth interceptor chuyển hướng.
export function forgotPassword(payload: ForgotPasswordPayload) {
    return publicAxios
        .post<ApiResponse<ForgotPasswordResult>>(
            `${BASE}/forgot-password`,
            payload,
        )
        .then((response) => response.data);
}

// Xác minh OTP và cập nhật mật khẩu; backend sẽ thu hồi các refresh session sau khi thành công.
export function resetPassword(payload: ResetPasswordPayload) {
    return publicAxios
        .post<ApiResponse<null>>(`${BASE}/reset-password`, payload)
        .then((response) => response.data);
}

// Đổi mật khẩu và nhận token/session mới để tránh refresh trang bị logout sau khi đổi mật khẩu.
export function changePassword(
    payload: ChangePasswordPayload,
    currentSessionId?: string | null,
) {
    return authorizedAxios
        .post<ApiResponse<AuthData>>(`${BASE}/change-password`, payload, {
            headers: currentSessionId
                ? { 'X-Session-Id': currentSessionId }
                : {},
        })
        .then((response) => response.data);
}
