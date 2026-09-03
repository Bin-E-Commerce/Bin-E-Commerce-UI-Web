import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type { ApiResponse } from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Đăng xuất phiên hiện tại và để backend thu hồi refresh token tương ứng.
export function logout() {
    return authorizedAxios
        .post<ApiResponse<null>>(`${BASE}/logout`, {})
        .then((response) => response.data);
}

