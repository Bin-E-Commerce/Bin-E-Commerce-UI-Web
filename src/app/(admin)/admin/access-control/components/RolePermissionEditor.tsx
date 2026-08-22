import { useMemo } from 'react';

import type {
    AdminAccessPermission,
    AdminAccessRole,
    AdminRolePermission,
} from '@/services/admin';
import { groupPermissionsByResource } from '../utils/access-control-permission.utils';
import { PermissionActionCard } from './PermissionActionCard';

interface RolePermissionEditorProps {
    role: AdminAccessRole;
    permissions: AdminAccessPermission[];
    rolePermissions: AdminRolePermission[];
    actionKey: string | null;
    canUpdate: boolean;
    onToggle: (
        role: AdminAccessRole,
        permission: AdminAccessPermission,
        enabled: boolean,
    ) => void;
}

// Hiển thị một role theo các nhóm chức năng để admin không phải đọc một danh sách permission phẳng.
export function RolePermissionEditor({
    role,
    permissions,
    rolePermissions,
    actionKey,
    canUpdate,
    onToggle,
}: RolePermissionEditorProps) {
    const permissionGroups = useMemo(
        () => groupPermissionsByResource(permissions),
        [permissions],
    );

    return (
        <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-zinc-950 px-2.5 py-1 text-sm font-semibold text-white">
                    {role.code}
                </span>
                <span className="text-sm font-medium text-zinc-800">
                    {role.name}
                </span>
                {role.isSystem ? (
                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500">
                        Hệ thống
                    </span>
                ) : null}
            </div>
            <p className="mt-2 text-sm text-zinc-500">{role.description}</p>

            <div className="mt-5 space-y-5">
                {permissionGroups.map((group) => (
                    <section
                        key={group.resource}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4"
                    >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-zinc-950">
                                    {group.label}
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {group.description}
                                </p>
                            </div>
                            <span className="w-fit rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-500">
                                {group.permissions.length} quyền
                            </span>
                        </div>

                        <div className="mt-4 grid gap-3 xl:grid-cols-2">
                            {group.permissions.map((permission) => (
                                <PermissionActionCard
                                    key={permission.id}
                                    role={role}
                                    permission={permission}
                                    rolePermissions={rolePermissions}
                                    actionKey={actionKey}
                                    canUpdate={canUpdate}
                                    onToggle={onToggle}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
