import { SlidersHorizontal } from 'lucide-react';

import type {
    AdminAccessControlOverview,
    AdminAccessPermission,
    AdminAccessRole,
    AdminRolePermission,
} from '@/services/admin';
import type {
    AccessControlFilters,
    FilteredRolePermissionGroup,
} from '../types/access-control-filter.type';
import { AccessControlAdvancedSearch } from './AccessControlAdvancedSearch';
import { RolePermissionEditor } from './RolePermissionEditor';

interface AccessControlRoleMatrixProps {
    overview: AdminAccessControlOverview | null;
    rolePermissionGroups: Record<string, AdminRolePermission[]>;
    filteredRolePermissionGroups: FilteredRolePermissionGroup[];
    filters: AccessControlFilters;
    resourceOptions: string[];
    filteredPermissionCount: number;
    hasActiveFilters: boolean;
    actionKey: string | null;
    isError: boolean;
    onFilterChange: <Key extends keyof AccessControlFilters>(
        key: Key,
        value: AccessControlFilters[Key],
    ) => void;
    onResetFilters: () => void;
    onToggle: (
        role: AdminAccessRole,
        permission: AdminAccessPermission,
        enabled: boolean,
    ) => void;
}

// Render ma trận role-permission kèm bộ lọc nâng cao để admin tìm quyền nhanh trong catalog lớn.
export function AccessControlRoleMatrix({
    overview,
    rolePermissionGroups,
    filteredRolePermissionGroups,
    filters,
    resourceOptions,
    filteredPermissionCount,
    hasActiveFilters,
    actionKey,
    isError,
    onFilterChange,
    onResetFilters,
    onToggle,
}: AccessControlRoleMatrixProps) {
    const canUpdate = Boolean(overview?.canUpdateRolePermissions);

    return (
        <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 p-5">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-5 text-zinc-500" />
                    <h2 className="text-base font-semibold text-zinc-950">
                        Cấp quyền theo role
                    </h2>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                    Bật hoặc tắt permission cho từng role. Backend sẽ ghi audit
                    log và xóa Redis cache quyền sau mỗi thay đổi.
                    {canUpdate ? null : (
                        <span className="mt-1 block text-amber-600">
                            Tài khoản hiện tại chỉ có quyền xem cấu hình phân
                            quyền.
                        </span>
                    )}
                </p>
            </div>

            <AccessControlAdvancedSearch
                filters={filters}
                roles={overview?.roles ?? []}
                resourceOptions={resourceOptions}
                resultCount={filteredPermissionCount}
                hasActiveFilters={hasActiveFilters}
                onFilterChange={onFilterChange}
                onResetFilters={onResetFilters}
            />

            {isError ? (
                <div className="p-5 text-sm text-red-600">
                    Không tải được dữ liệu phân quyền. Vui lòng kiểm tra quyền
                    truy cập hoặc thử lại.
                </div>
            ) : null}

            {filteredRolePermissionGroups.length === 0 && !isError ? (
                <div className="p-8 text-center">
                    <p className="text-sm font-semibold text-zinc-900">
                        Không tìm thấy quyền phù hợp
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                        Thử đổi từ khóa, role, trạng thái hoặc resource để mở
                        rộng kết quả.
                    </p>
                </div>
            ) : null}

            <div className="divide-y divide-zinc-100">
                {filteredRolePermissionGroups.map(({ role, permissions }) => (
                    <RolePermissionEditor
                        key={role.id}
                        role={role}
                        permissions={permissions}
                        rolePermissions={rolePermissionGroups[role.code] ?? []}
                        actionKey={actionKey}
                        canUpdate={canUpdate}
                        onToggle={onToggle}
                    />
                ))}
            </div>
        </section>
    );
}
