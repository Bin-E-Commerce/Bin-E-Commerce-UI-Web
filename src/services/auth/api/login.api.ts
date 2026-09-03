import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import publicAxios from '@/utils/publicAxios';
import type { ApiResponse, AuthData, AuthUser, LoginPayload } from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Gọi API đăng nhập bằng email/password và trả về token cùng thông tin người dùng.
export function login(payload: LoginPayload) {
    return publicAxios
        .post<ApiResponse<AuthData>>(`${BASE}/login`, payload)
        .then((response) => response.data);
}

// Khôi phục phiên bằng httpOnly refresh_token cookie để người dùng không phải đăng nhập lại sau khi reload.
export function refresh() {
    return publicAxios
        .post<ApiResponse<AuthData>>(`${BASE}/refresh`, {})
        .then((response) => response.data);
}

// Lấy viewer hiện tại từ access token mà không rotate refresh token, phù hợp khi chỉ cần đồng bộ roles/permissions.
export function getViewer() {
    return authorizedAxios
        .get<ApiResponse<AuthUser>>(`${BASE}/me`)
        .then((response) => response.data);
}
