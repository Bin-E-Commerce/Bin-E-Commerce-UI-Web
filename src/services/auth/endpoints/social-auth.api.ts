import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';
import type {
    ApiResponse,
    AuthData,
    SocialCallbackPayload,
} from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Xin URL OAuth từ backend để frontend redirect sang provider như Google.
export function getSocialAuthUrl(provider: string) {
    return publicAxios
        .get<ApiResponse<{ authUrl: string; state: string }>>(
            `${BASE}/social/start/${provider}`,
        )
        .then((response) => response.data);
}

// Gửi code/state OAuth về backend để đổi lấy session đăng nhập của hệ thống.
export function socialCallback(provider: string, payload: SocialCallbackPayload) {
    return publicAxios
        .post<ApiResponse<AuthData>>(
            `${BASE}/social/callback/${provider}`,
            payload,
        )
        .then((response) => response.data);
}

