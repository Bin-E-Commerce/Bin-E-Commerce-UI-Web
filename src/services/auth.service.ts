import publicAxios from '@/utils/publicAxios';
import authorizedAxios from '@/utils/authorizedAxios';
import { API_BASE_URL, API_VERSION } from '@/config/api.config';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;
const USERS = `${API_BASE_URL}${API_VERSION}/users`;

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    status: string;
    avatarUrl: string | null;
    createdAt: string;
}

export interface AuthData {
    accessToken: string;
    expiresIn: number;
    sessionId: string;
    user: AuthUser;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    statusCode: number;
}

export const authService = {
    login: (dto: { email: string; password: string }) =>
        publicAxios
            .post<ApiResponse<AuthData>>(`${BASE}/login`, dto)
            .then((r) => r.data),

    registerInitiate: (dto: {
        email: string;
        name: string;
        password: string;
        phone?: string;
    }) =>
        publicAxios
            .post<
                ApiResponse<{ message: string; expiresIn: number }>
            >(`${BASE}/register/initiate`, dto)
            .then((r) => r.data),

    registerVerify: (dto: { identifier: string; otp: string }) =>
        publicAxios
            .post<ApiResponse<AuthData>>(`${BASE}/register/verify`, dto)
            .then((r) => r.data),

    // Không gửi body — httpOnly cookie tự động đính kèm
    refresh: () =>
        publicAxios
            .post<ApiResponse<AuthData>>(`${BASE}/refresh`, {})
            .then((r) => r.data),

    logout: () =>
        authorizedAxios
            .post<ApiResponse<null>>(`${BASE}/logout`, {})
            .then((r) => r.data),

    // ─── Social OAuth ─────────────────────────────────────────────────────
    // Lấy URL xác thực từ Keycloak. State được sinh server-side để chống CSRF.
    getSocialAuthUrl: (provider: string) =>
        publicAxios
            .get<
                ApiResponse<{ authUrl: string; state: string }>
            >(`${BASE}/social/start/${provider}`)
            .then((r) => r.data),

    // Đổi authorization code lấy access/refresh token sau khi Keycloak redirect về FE.
    socialCallback: (provider: string, dto: { code: string; state: string }) =>
        publicAxios
            .post<
                ApiResponse<AuthData>
            >(`${BASE}/social/callback/${provider}`, dto)
            .then((r) => r.data),

    getMe: () =>
        authorizedAxios
            .get<ApiResponse<AuthUser>>(`${USERS}/me`)
            .then((r) => r.data),

    // ─── Session Management ───────────────────────────────────────────────────
    getSessions: (sessionId?: string | null) =>
        authorizedAxios
            .get<ApiResponse<SessionDto[]>>(`${USERS}/me/sessions`, {
                headers: sessionId ? { 'X-Session-Id': sessionId } : {},
            })
            .then((r) => r.data),

    revokeSession: (sessionId: string, currentSessionId?: string | null) =>
        authorizedAxios
            .delete<ApiResponse<null>>(`${USERS}/me/sessions/${sessionId}`, {
                headers: currentSessionId ? { 'X-Session-Id': currentSessionId } : {},
            })
            .then((r) => r.data),

    revokeOtherSessions: (currentSessionId: string) =>
        authorizedAxios
            .delete<ApiResponse<{ revokedCount: number }>>(`${USERS}/me/sessions`, {
                headers: { 'X-Session-Id': currentSessionId },
            })
            .then((r) => r.data),
};

export interface SessionDto {
    id: string;
    issuedAt: string;
    expiresAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    clientId: string | null;
    isCurrent: boolean;
}
