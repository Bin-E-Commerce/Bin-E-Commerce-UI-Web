import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    AdminUserAuditResponse,
    AdminUserActivityResponse,
    AdminUserMutationResponse,
    AdminUserResponse,
    AdminUserRole,
    AdminUserSessionsResponse,
    AdminUserStatus,
    ListAdminUsersParams,
    ListAdminUsersResponse,
} from '../types/users.types';

const baseUrl = `${API_VERSION}/admin/users`;

export const adminUsersService = {
    // Lấy số user CUSTOMER/SELLER mới theo ngày cho dashboard vận hành.
    getActivity: (range: { from: string; to: string }) =>
        authorizedAxios
            .get<AdminUserActivityResponse>(`${baseUrl}/activity`, {
                params: range,
            })
            .then((response) => response.data),

    list: (params: ListAdminUsersParams = {}) =>
        authorizedAxios
            .get<ListAdminUsersResponse>(baseUrl, { params })
            .then((response) => response.data),
    getById: (id: string) =>
        authorizedAxios
            .get<AdminUserResponse>(`${baseUrl}/${id}`)
            .then((response) => response.data),
    getSessions: (id: string) =>
        authorizedAxios
            .get<AdminUserSessionsResponse>(`${baseUrl}/${id}/sessions`)
            .then((response) => response.data),
    getAudit: (id: string) =>
        authorizedAxios
            .get<AdminUserAuditResponse>(`${baseUrl}/${id}/audit`)
            .then((response) => response.data),
    updateRole: (
        id: string,
        payload: {
            role: AdminUserRole;
            reason: string;
            expectedUpdatedAt: string;
        },
    ) =>
        authorizedAxios
            .put<AdminUserMutationResponse>(`${baseUrl}/${id}/role`, payload)
            .then((response) => response.data),
    updateStatus: (
        id: string,
        payload: {
            status: AdminUserStatus;
            reason: string;
            expectedUpdatedAt: string;
        },
    ) =>
        authorizedAxios
            .put<AdminUserMutationResponse>(`${baseUrl}/${id}/status`, payload)
            .then((response) => response.data),
    revokeSession: (id: string, sessionId: string, reason: string) =>
        authorizedAxios
            .delete(`${baseUrl}/${id}/sessions/${sessionId}`, {
                data: { reason },
            })
            .then((response) => response.data),
    revokeAllSessions: (id: string, reason: string) =>
        authorizedAxios
            .post(`${baseUrl}/${id}/sessions/revoke-all`, { reason })
            .then((response) => response.data),
};
