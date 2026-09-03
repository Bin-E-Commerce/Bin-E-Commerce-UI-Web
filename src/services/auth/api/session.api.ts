import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type { ApiResponse, SessionDto } from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Lấy danh sách phiên đăng nhập để người dùng quản lý thiết bị đang hoạt động.
export function getSessions(sessionId?: string | null) {
    return authorizedAxios
        .get<ApiResponse<SessionDto[]>>(`${BASE}/sessions`, {
            headers: sessionId ? { 'X-Session-Id': sessionId } : {},
        })
        .then((response) => response.data);
}

// Kết thúc một phiên cụ thể, có truyền phiên hiện tại để backend phân biệt thiết bị đang thao tác.
export function revokeSession(
    sessionId: string,
    currentSessionId?: string | null,
) {
    return authorizedAxios
        .post<ApiResponse<null>>(
            `${BASE}/sessions/${sessionId}/revoke`,
            {},
            {
                headers: currentSessionId
                    ? { 'X-Session-Id': currentSessionId }
                    : {},
            },
        )
        .then((response) => response.data);
}

// Đăng xuất toàn bộ thiết bị khác và giữ lại phiên hiện tại.
export function revokeOtherSessions(currentSessionId?: string | null) {
    return authorizedAxios
        .post<ApiResponse<{ revokedCount: number }>>(
            `${BASE}/sessions/logout-others`,
            {},
            {
                headers: currentSessionId
                    ? { 'X-Session-Id': currentSessionId }
                    : {},
            },
        )
        .then((response) => response.data);
}

// Đăng xuất toàn bộ phiên của tài khoản, bao gồm cả phiên hiện tại.
export function logoutAllSessions() {
    return authorizedAxios
        .post<ApiResponse<{ revokedCount: number }>>(
            `${BASE}/sessions/logout-all`,
            {},
        )
        .then((response) => response.data);
}

