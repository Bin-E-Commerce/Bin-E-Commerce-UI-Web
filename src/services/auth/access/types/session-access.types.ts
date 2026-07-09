import type { AccessProfile } from '../../types/auth.types';

export type SessionPermission = string;

export interface PermissionAwareUser {
    role?: string;
    roles?: string[];
    permissions?: string[];
    accessProfile?: AccessProfile;
}
