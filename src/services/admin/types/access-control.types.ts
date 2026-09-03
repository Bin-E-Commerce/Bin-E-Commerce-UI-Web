export interface AdminAccessRole {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    isActive: boolean;
}

export interface AdminAccessPermission {
    id: string;
    code: string;
    name: string;
    description: string | null;
    resource: string;
    action: string;
    permissionVersion: string;
    isActive: boolean;
}

export interface AdminRolePermission {
    id: string;
    scope: string;
    isActive: boolean;
    role: AdminAccessRole;
    permission: AdminAccessPermission;
}

export interface AdminNavigationItem {
    id: string;
    area: 'admin' | 'seller';
    groupCode: string;
    groupLabel: string;
    groupOrder: number;
    code: string;
    label: string;
    description: string;
    href: string;
    icon: string;
    sortOrder: number;
    requiredPermissionCode: string;
    requiredScope: string | null;
    isActive: boolean;
}

export interface AdminAccessControlOverview {
    permissionVersion: string;
    canUpdateRolePermissions: boolean;
    roles: AdminAccessRole[];
    permissions: AdminAccessPermission[];
    rolePermissions: AdminRolePermission[];
    navigation: AdminNavigationItem[];
}

export interface AdminAccessControlOverviewResponse {
    data: AdminAccessControlOverview;
    message: string;
    statusCode: number;
}

export interface UpdateRolePermissionPayload {
    permissionCode: string;
    scope: string;
    enabled: boolean;
    reason?: string;
}

export interface UpdateRolePermissionResponse {
    data: AdminRolePermission;
    message: string;
    statusCode: number;
}
