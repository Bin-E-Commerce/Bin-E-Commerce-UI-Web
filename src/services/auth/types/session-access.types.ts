import type { AccessProfile } from './auth.types';

export type SessionPermission = string;

export interface PermissionAwareUser {
    role?: string;
    roles?: string[];
    permissions?: string[];
    permissionGrants?: Array<{ code: string }>;
    accessProfile?: AccessProfile;
}
