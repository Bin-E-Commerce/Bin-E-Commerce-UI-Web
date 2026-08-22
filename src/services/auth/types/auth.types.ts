export interface PermissionGrant {
    code: string;
    scopes: string[];
}

export interface AccessNavigationItem {
    code: string;
    groupCode: string;
    groupLabel: string;
    groupOrder: number;
    label: string;
    description: string;
    href: string;
    icon: string;
    sortOrder: number;
    requiredPermissionCode: string;
}

export interface AccessArea {
    canAccess: boolean;
    defaultRoute: string | null;
    navigation: AccessNavigationItem[];
}

export interface AccessProfile {
    permissionVersion: string;
    defaultRoute: string;
    areas: {
        admin: AccessArea;
        seller: AccessArea;
    };
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    roles: string[];
    permissions: string[];
    permissionGrants?: PermissionGrant[];
    accessProfile?: AccessProfile;
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

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterInitiatePayload {
    email: string;
    name: string;
    password: string;
    phone?: string;
}

export interface RegisterVerifyPayload {
    identifier: string;
    otp: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfilePayload {
    name?: string;
    phone?: string | null;
}

export interface SocialCallbackPayload {
    code: string;
    state: string;
}
