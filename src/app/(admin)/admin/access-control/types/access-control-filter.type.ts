import type {
    AdminAccessPermission,
    AdminAccessRole,
} from '@/services/admin';

export type PermissionStatusFilter = 'all' | 'active' | 'inactive' | 'locked';

export interface AccessControlFilters {
    keyword: string;
    roleCode: string;
    status: PermissionStatusFilter;
    resource: string;
}

export interface FilteredRolePermissionGroup {
    role: AdminAccessRole;
    permissions: AdminAccessPermission[];
}

export interface PermissionResourceGroup {
    resource: string;
    label: string;
    description: string;
    permissions: AdminAccessPermission[];
}
