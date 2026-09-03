import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';
import type {
    ApiResponse,
    AuthData,
    RegisterInitiatePayload,
    RegisterVerifyPayload,
} from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Gửi thông tin đăng ký ban đầu để backend tạo OTP xác minh tài khoản.
export function registerInitiate(payload: RegisterInitiatePayload) {
    return publicAxios
        .post<ApiResponse<{ message: string; expiresIn: number }>>(
            `${BASE}/register/initiate`,
            payload,
        )
        .then((response) => response.data);
}

// Xác minh OTP đăng ký và nhận phiên đăng nhập mới khi OTP hợp lệ.
export function registerVerify(payload: RegisterVerifyPayload) {
    return publicAxios
        .post<ApiResponse<AuthData>>(`${BASE}/register/verify`, payload)
        .then((response) => response.data);
}

