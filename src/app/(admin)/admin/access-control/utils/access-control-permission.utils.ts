import type {
    AdminAccessControlOverview,
    AdminAccessPermission,
    AdminAccessRole,
    AdminRolePermission,
} from '@/services/admin';
import { GLOBAL_SCOPE, OWN_SHOP_SCOPE } from '../constants/access-control.constant';
import type {
    AccessControlFilters,
    FilteredRolePermissionGroup,
    PermissionResourceGroup,
} from '../types/access-control-filter.type';

const RESOURCE_GROUP_META: Record<
    string,
    { label: string; description: string; order: number }
> = {
    admin: {
        label: 'Admin Center',
        description: 'Quyền vào khu vực vận hành nội bộ.',
        order: 10,
    },
    'admin.dashboard': {
        label: 'Bảng điều khiển admin',
        description: 'Quyền xem số liệu tổng quan của nền tảng.',
        order: 20,
    },
    'admin.access_control': {
        label: 'Phân quyền',
        description: 'Quyền xem và chỉnh cấu hình role, permission, menu.',
        order: 30,
    },
    seller: {
        label: 'Seller Center',
        description: 'Quyền vào khu vực vận hành shop.',
        order: 40,
    },
    'seller.dashboard': {
        label: 'Bảng điều khiển seller',
        description: 'Quyền xem dashboard vận hành shop.',
        order: 50,
    },
    'seller.application': {
        label: 'Hồ sơ seller',
        description: 'Quyền kiểm tra, duyệt hoặc từ chối hồ sơ người bán.',
        order: 60,
    },
    'seller.product': {
        label: 'Sản phẩm của shop',
        description: 'Quyền quản lý dữ liệu sản phẩm thuộc shop.',
        order: 70,
    },
    'seller.shop_profile': {
        label: 'Hồ sơ shop',
        description: 'Quyền xem và cập nhật thông tin vận hành của shop.',
        order: 80,
    },
};

export interface ResolvedRolePermissionState {
    scope: string;
    active: boolean;
    activeScopes: string[];
}

// Nhóm role-permission theo role để màn hình không phải filter lại trên từng dòng permission.
export function groupRolePermissions(rolePermissions: AdminRolePermission[]) {
    return rolePermissions.reduce<Record<string, AdminRolePermission[]>>(
        (groups, item) => {
            const key = item.role.code;
            groups[key] = [...(groups[key] ?? []), item];
            return groups;
        },
        {},
    );
}

// Chọn scope ưu tiên khi DB chưa có record cho cặp role-permission.
// Seller vận hành dữ liệu trong shop của mình nên dùng own_shop; role nội bộ mặc định dùng global.
function getFallbackScopeForPermission(
    roleCode: string,
    permission: AdminAccessPermission,
): string {
    if (roleCode === 'SELLER' && permission.resource.startsWith('seller')) {
        return OWN_SHOP_SCOPE;
    }

    return GLOBAL_SCOPE;
}

// Resolve trạng thái từ chính role-permission backend trả về để UI và runtime cùng đọc một bản ghi.
// Logic ưu tiên scope chuẩn của role, nhưng vẫn nhận diện scope cũ đang bật để admin có thể gỡ sạch dữ liệu lệch trước đây.
export function resolveRolePermissionState(
    roleCode: string,
    permission: AdminAccessPermission,
    rolePermissions: AdminRolePermission[],
): ResolvedRolePermissionState {
    const fallbackScope = getFallbackScopeForPermission(roleCode, permission);
    const matchingRecords = rolePermissions.filter(
        (item) => item.permission.code === permission.code,
    );
    const activeRecords = matchingRecords.filter((item) => item.isActive);
    const preferredActiveRecord = activeRecords.find(
        (item) => item.scope === fallbackScope,
    );
    const preferredExistingRecord = matchingRecords.find(
        (item) => item.scope === fallbackScope,
    );
    const selectedRecord =
        preferredActiveRecord ??
        activeRecords[0] ??
        preferredExistingRecord ??
        matchingRecords[0];

    return {
        scope: selectedRecord?.scope ?? fallbackScope,
        active: activeRecords.length > 0,
        activeScopes: Array.from(
            new Set(activeRecords.map((item) => item.scope)),
        ),
    };
}

// Khóa các quyền cốt lõi của ADMIN ở UI; backend vẫn là lớp bảo vệ cuối cùng khi request gửi lên.
export function isCriticalAdminPermission(
    role: AdminAccessRole,
    permission: AdminAccessPermission,
    scope: string,
): boolean {
    if (role.code !== 'ADMIN' || scope !== GLOBAL_SCOPE) return false;

    return (
        (permission.resource === 'admin' && permission.action === 'access') ||
        (permission.resource === 'admin.access_control' &&
            ['read', 'update'].includes(permission.action))
    );
}

// Chuẩn hóa chuỗi trước khi so khớp để admin tìm được cả mã quyền, tên quyền, resource hoặc action.
function normalizeSearchValue(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase();
}

// Kiểm tra một permission có khớp keyword hay không; role cũng được đưa vào để tìm theo tên/mã role.
function matchesPermissionKeyword(
    role: AdminAccessRole,
    permission: AdminAccessPermission,
    keyword: string,
): boolean {
    if (!keyword) return true;

    const searchableText = [
        role.code,
        role.name,
        role.description,
        permission.code,
        permission.name,
        permission.description,
        permission.resource,
        permission.action,
    ]
        .map(normalizeSearchValue)
        .join(' ');

    return searchableText.includes(keyword);
}

// Tách điều kiện trạng thái ra riêng để UI có thể lọc đúng quyền đang bật, đang tắt hoặc bị khóa.
function matchesPermissionStatus({
    active,
    locked,
    status,
}: {
    active: boolean;
    locked: boolean;
    status: AccessControlFilters['status'];
}): boolean {
    if (status === 'all') return true;
    if (status === 'active') return active;
    if (status === 'inactive') return !active && !locked;
    return locked;
}

// Lọc ma trận role-permission dựa trên dữ liệu backend trả về, nhờ vậy FE không cần tự định nghĩa bộ quyền riêng.
export function filterRolePermissionGroups({
    overview,
    rolePermissionGroups,
    filters,
}: {
    overview: AdminAccessControlOverview | null;
    rolePermissionGroups: Record<string, AdminRolePermission[]>;
    filters: AccessControlFilters;
}): FilteredRolePermissionGroup[] {
    if (!overview) return [];

    const keyword = normalizeSearchValue(filters.keyword);

    return overview.roles
        .filter(
            (role) =>
                filters.roleCode === 'all' || role.code === filters.roleCode,
        )
        .map((role) => {
            const rolePermissions = rolePermissionGroups[role.code] ?? [];
            const permissions = overview.permissions.filter((permission) => {
                const permissionState = resolveRolePermissionState(
                    role.code,
                    permission,
                    rolePermissions,
                );
                const { active, scope } = permissionState;
                const locked = isCriticalAdminPermission(role, permission, scope);

                if (
                    filters.resource !== 'all' &&
                    permission.resource !== filters.resource
                ) {
                    return false;
                }

                return (
                    matchesPermissionKeyword(role, permission, keyword) &&
                    matchesPermissionStatus({
                        active,
                        locked,
                        status: filters.status,
                    })
                );
            });

            return { role, permissions };
        })
        .filter((group) => group.permissions.length > 0);
}

// Lấy danh sách resource duy nhất từ permission catalog để admin lọc theo module nghiệp vụ.
export function getPermissionResourceOptions(
    permissions: AdminAccessPermission[] = [],
): string[] {
    return Array.from(
        new Set(permissions.map((permission) => permission.resource).filter(Boolean)),
    ).sort((first, second) => first.localeCompare(second));
}

// Chuyển resource kỹ thuật thành tên nhóm dễ đọc, vẫn fallback được khi backend thêm resource mới.
function getResourceGroupMeta(resource: string) {
    return (
        RESOURCE_GROUP_META[resource] ?? {
            label: resource,
            description: 'Nhóm quyền được phân loại theo resource từ backend.',
            order: 999,
        }
    );
}

// Gom permission theo resource/chức năng để mỗi role có cấu trúc rõ ràng thay vì một danh sách phẳng.
export function groupPermissionsByResource(
    permissions: AdminAccessPermission[],
): PermissionResourceGroup[] {
    const groupMap = new Map<string, AdminAccessPermission[]>();

    permissions.forEach((permission) => {
        const currentPermissions = groupMap.get(permission.resource) ?? [];
        groupMap.set(permission.resource, [...currentPermissions, permission]);
    });

    return Array.from(groupMap.entries())
        .map(([resource, groupedPermissions]) => {
            const meta = getResourceGroupMeta(resource);

            return {
                resource,
                label: meta.label,
                description: meta.description,
                permissions: groupedPermissions.sort((first, second) =>
                    first.action.localeCompare(second.action),
                ),
            };
        })
        .sort((first, second) => {
            const firstMeta = getResourceGroupMeta(first.resource);
            const secondMeta = getResourceGroupMeta(second.resource);

            if (firstMeta.order !== secondMeta.order) {
                return firstMeta.order - secondMeta.order;
            }

            return first.label.localeCompare(second.label);
        });
}
