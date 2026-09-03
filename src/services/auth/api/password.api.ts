import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ApiResponse,
    AuthData,
    ChangePasswordPayload,
} from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Đổi mật khẩu và nhận token/session mới để tránh refresh trang bị logout sau khi đổi mật khẩu.
export function changePassword(
    payload: ChangePasswordPayload,
    currentSessionId?: string | null,
) {
    return authorizedAxios
        .post<ApiResponse<AuthData>>(`${BASE}/change-password`, payload, {
            headers: currentSessionId ? { 'X-Session-Id': currentSessionId } : {},
        })
        .then((response) => response.data);
}

