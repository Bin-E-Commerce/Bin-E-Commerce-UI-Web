import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import publicAxios from '@/utils/publicAxios';

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
    refreshExpiresIn?: number;
    sessionId: string;
    user: AuthUser;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    statusCode: number;
}

export interface SessionDto {
    id: string;
    deviceName: string;
    deviceType: string;
    browser: string;
    os: string;
    loginMethod: string;
    ipAddress: string | null;
    location: string | null;
    userAgent: string | null;
    issuedAt: string;
    lastActiveAt: string | null;
    expiresAt: string;
    clientId: string | null;
    isCurrent: boolean;
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

    // Khôi phục phiên bằng httpOnly refresh_token cookie.
    refresh: () =>
        publicAxios
            .post<ApiResponse<AuthData>>(`${BASE}/refresh`, {})
            .then((r) => r.data),

    logout: () =>
        authorizedAxios
            .post<ApiResponse<null>>(`${BASE}/logout`, {})
            .then((r) => r.data),

    // Đổi mật khẩu và nhận lại token/session mới để tránh refresh trang bị logout.
    changePassword: (
        dto: { currentPassword: string; newPassword: string },
        currentSessionId?: string | null,
    ) =>
        authorizedAxios
            .post<ApiResponse<AuthData>>(`${BASE}/change-password`, dto, {
                headers: currentSessionId
                    ? { 'X-Session-Id': currentSessionId }
                    : {},
            })
            .then((r) => r.data),

    getSocialAuthUrl: (provider: string) =>
        publicAxios
            .get<
                ApiResponse<{ authUrl: string; state: string }>
            >(`${BASE}/social/start/${provider}`)
            .then((r) => r.data),

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

    // Lấy danh sách phiên qua auth-service để đúng nhóm nghiệp vụ authentication.
    getSessions: (sessionId?: string | null) =>
        authorizedAxios
            .get<ApiResponse<SessionDto[]>>(`${BASE}/sessions`, {
                headers: sessionId ? { 'X-Session-Id': sessionId } : {},
            })
            .then((r) => r.data),

    revokeSession: (sessionId: string, currentSessionId?: string | null) =>
        authorizedAxios
            .post<ApiResponse<null>>(
                `${BASE}/sessions/${sessionId}/revoke`,
                {},
                {
                    headers: currentSessionId
                        ? { 'X-Session-Id': currentSessionId }
                        : {},
                },
            )
            .then((r) => r.data),

    revokeOtherSessions: (currentSessionId?: string | null) =>
        authorizedAxios
            .post<ApiResponse<{ revokedCount: number }>>(
                `${BASE}/sessions/logout-others`,
                {},
                {
                    headers: currentSessionId
                        ? { 'X-Session-Id': currentSessionId }
                        : {},
                },
            )
            .then((r) => r.data),

    logoutAllSessions: () =>
        authorizedAxios
            .post<ApiResponse<{ revokedCount: number }>>(
                `${BASE}/sessions/logout-all`,
                {},
            )
            .then((r) => r.data),
};
