import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    adminAccessControlService,
    type AdminAccessPermission,
    type AdminAccessRole,
} from '@/services/admin';
import { ACCESS_CONTROL_OVERVIEW_QUERY_KEY } from '../constants/access-control.constant';
import type { AccessControlFilters } from '../types/access-control-filter.type';
import {
    filterRolePermissionGroups,
    getPermissionResourceOptions,
    groupRolePermissions,
    resolveRolePermissionState,
} from '../utils/access-control-permission.utils';

const DEFAULT_FILTERS: AccessControlFilters = {
    keyword: '',
    roleCode: 'all',
    status: 'all',
    resource: 'all',
};

// Gom data fetching, mutation và filter của trang phân quyền để page chỉ còn nhiệm vụ compose UI.
export function useAdminAccessControl() {
    const queryClient = useQueryClient();
    const [actionKey, setActionKey] = useState<string | null>(null);
    const [filters, setFilters] = useState<AccessControlFilters>(DEFAULT_FILTERS);

    const overviewQuery = useQuery({
        queryKey: ACCESS_CONTROL_OVERVIEW_QUERY_KEY,
        queryFn: adminAccessControlService.getOverview,
        select: (response) => response.data,
    });

    const overview = overviewQuery.data ?? null;
    const rolePermissionGroups = useMemo(
        () => groupRolePermissions(overview?.rolePermissions ?? []),
        [overview?.rolePermissions],
    );
    const resourceOptions = useMemo(
        () => getPermissionResourceOptions(overview?.permissions ?? []),
        [overview?.permissions],
    );

    // Lọc sau khi đã group role-permission để mỗi card biết đúng trạng thái bật/tắt/khóa theo scope hiện tại.
    const filteredRolePermissionGroups = useMemo(
        () =>
            filterRolePermissionGroups({
                overview,
                rolePermissionGroups,
                filters,
            }),
        [filters, overview, rolePermissionGroups],
    );
    const filteredPermissionCount = useMemo(
        () =>
            filteredRolePermissionGroups.reduce(
                (total, group) => total + group.permissions.length,
                0,
            ),
        [filteredRolePermissionGroups],
    );
    const hasActiveFilters = useMemo(
        () =>
            filters.keyword.trim().length > 0 ||
            filters.roleCode !== DEFAULT_FILTERS.roleCode ||
            filters.status !== DEFAULT_FILTERS.status ||
            filters.resource !== DEFAULT_FILTERS.resource,
        [filters],
    );

    const updatePermissionMutation = useMutation({
        // Mutation nhận role/permission đầy đủ để tự tính scope rồi gửi payload đúng contract backend.
        mutationFn: async ({
            role,
            permission,
            enabled,
            scopes,
        }: {
            role: AdminAccessRole;
            permission: AdminAccessPermission;
            enabled: boolean;
            scopes: string[];
        }) => {
            // Khi gỡ quyền, cập nhật mọi scope đang bật để xóa cả record global sai do phiên bản UI cũ tạo ra.
            // Khi cấp quyền, mảng chỉ có scope chuẩn đã resolve từ dữ liệu backend hoặc policy fallback của role.
            return Promise.all(
                scopes.map((scope) =>
                    adminAccessControlService.updateRolePermission(role.code, {
                        permissionCode: permission.code,
                        scope,
                        enabled,
                        reason: enabled
                            ? 'Admin cấp quyền từ màn hình phân quyền.'
                            : 'Admin gỡ quyền từ màn hình phân quyền.',
                    }),
                ),
            );
        },
        onSuccess: async (_response, variables) => {
            toast.success(
                variables.enabled ? 'Đã cấp quyền.' : 'Đã gỡ quyền.',
            );
            await queryClient.invalidateQueries({
                queryKey: ACCESS_CONTROL_OVERVIEW_QUERY_KEY,
            });
        },
        onError: (error) => {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Không cập nhật được quyền.';
            toast.error(message);
        },
        onSettled: () => {
            setActionKey(null);
        },
    });

    // Gắn actionKey theo role/permission/scope để chỉ card đang thao tác hiển thị loading.
    function handleTogglePermission(
        role: AdminAccessRole,
        permission: AdminAccessPermission,
        enabled: boolean,
    ) {
        const rolePermissions = rolePermissionGroups[role.code] ?? [];
        const permissionState = resolveRolePermissionState(
            role.code,
            permission,
            rolePermissions,
        );
        const scopes =
            !enabled && permissionState.activeScopes.length > 0
                ? permissionState.activeScopes
                : [permissionState.scope];

        // actionKey dùng scope đang hiển thị để chỉ card được thao tác chuyển sang trạng thái loading.
        const scope = permissionState.scope;
        setActionKey(`${role.code}:${permission.code}:${scope}`);
        updatePermissionMutation.mutate({
            role,
            permission,
            enabled,
            scopes,
        });
    }

    // Cho admin chủ động refetch khi vừa seed hoặc thay đổi quyền từ nơi khác.
    function handleRefresh() {
        void overviewQuery.refetch();
    }

    // Cập nhật từng tiêu chí lọc độc lập để input không làm mất trạng thái các bộ lọc còn lại.
    function handleFilterChange<Key extends keyof AccessControlFilters>(
        key: Key,
        value: AccessControlFilters[Key],
    ) {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [key]: value,
        }));
    }

    // Đưa bộ lọc về trạng thái mặc định để admin quay lại ma trận đầy đủ chỉ bằng một thao tác.
    function handleResetFilters() {
        setFilters(DEFAULT_FILTERS);
    }

    return {
        overview,
        rolePermissionGroups,
        filteredRolePermissionGroups,
        filteredPermissionCount,
        resourceOptions,
        filters,
        hasActiveFilters,
        actionKey,
        isFetching: overviewQuery.isFetching,
        isError: overviewQuery.isError,
        handleRefresh,
        handleFilterChange,
        handleResetFilters,
        handleTogglePermission,
    };
}
