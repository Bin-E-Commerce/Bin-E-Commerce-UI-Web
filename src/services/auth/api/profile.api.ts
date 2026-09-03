import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ApiResponse,
    AuthUser,
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

