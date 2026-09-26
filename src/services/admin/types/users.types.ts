export type AdminUserRole = 'CUSTOMER' | 'SELLER' | 'SUPPORT_AGENT' | 'ADMIN';
export type AdminUserStatus = 'ACTIVE' | 'BANNED';

export interface AdminUserListItem {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: AdminUserRole;
    status: AdminUserStatus;
    avatarUrl: string | null;
    lastLoginAt: string | null;
    createdAt: string;
}

export interface AdminUserDetail extends AdminUserListItem {
    updatedAt: string;
    sessionCount: number;
}

export interface AdminUserSession {
    id: string;
    deviceName: string;
    deviceType: string;
    browser: string;
    os: string;
    ipAddress: string | null;
    userAgent: string | null;
    issuedAt: string;
    lastActiveAt: string | null;
    expiresAt: string;
}

export interface AdminUserAudit {
    id: string;
    actorUserId: string | null;
    targetUserId: string;
    action: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    reason: string | null;
    syncStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
    ipAddress: string | null;
    createdAt: string;
}

export interface ListAdminUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: AdminUserRole;
    status?: AdminUserStatus;
    sortBy?: 'createdAt' | 'lastLoginAt' | 'name';
    sortOrder?: 'ASC' | 'DESC';
}

export interface ListAdminUsersResponse {
    data: {
        items: AdminUserListItem[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        summary: {
            total: number;
            active: number;
            banned: number;
        };
    };
    message: string;
    statusCode: number;
}

export interface AdminUserResponse {
    data: AdminUserDetail;
    message: string;
    statusCode: number;
}

export interface AdminUserSessionsResponse {
    data: AdminUserSession[];
    message: string;
    statusCode: number;
}

export interface AdminUserAuditResponse {
    data: AdminUserAudit[];
    message: string;
    statusCode: number;
}

export interface AdminUserMutationResponse {
    data: AdminUserDetail;
    message: string;
    statusCode: number;
}
