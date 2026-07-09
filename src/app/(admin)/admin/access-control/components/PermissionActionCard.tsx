import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    AdminAccessPermission,
    AdminAccessRole,
    AdminRolePermission,
} from '@/services/admin';
import {
    findActiveRolePermission,
    getDefaultScopeForPermission,
    isCriticalAdminPermission,
} from '../utils/access-control-permission.utils';
import { PermissionStatusIcon } from './PermissionStatusIcon';

interface PermissionActionCardProps {
    role: AdminAccessRole;
    permission: AdminAccessPermission;
    rolePermissions: AdminRolePermission[];
    actionKey: string | null;
    canUpdate: boolean;
    onToggle: (
        role: AdminAccessRole,
        permission: AdminAccessPermission,
        enabled: boolean,
    ) => void;
}

// Render một permission card và tự tính trạng thái theo role/scope để nút thao tác luôn đúng với backend contract.
export function PermissionActionCard({
    role,
    permission,
    rolePermissions,
    actionKey,
    canUpdate,
    onToggle,
}: PermissionActionCardProps) {
    const scope = getDefaultScopeForPermission(role.code, permission);
    const active = Boolean(
        findActiveRolePermission(rolePermissions, permission.code, scope),
    );
    const currentActionKey = `${role.code}:${permission.code}:${scope}`;
    const pending = actionKey === currentActionKey;
    const locked = isCriticalAdminPermission(role, permission, scope);
    const disabled = pending || locked || !canUpdate;

    return (
        <div
            className={cn(
                'group rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md',
                active
                    ? 'border-zinc-200'
                    : 'border-dashed border-zinc-200 bg-zinc-50/70',
                locked ? 'bg-zinc-50' : null,
            )}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <PermissionStatusIcon active={active} locked={locked} />
                        <p className="text-sm font-semibold text-zinc-950">
                            {permission.name}
                        </p>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                            {active ? 'Đang bật' : 'Đang tắt'}
                        </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-zinc-500">
                        {permission.code}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">
                        {permission.description ??
                            'Permission này chưa có mô tả nghiệp vụ.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-600">
                            Resource: {permission.resource}
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-600">
                            Action: {permission.action}
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-600">
                            Scope: {scope}
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    size="sm"
                    variant={active ? 'outline' : 'default'}
                    disabled={disabled}
                    className={cn(
                        'min-w-28 shrink-0',
                        active && !disabled
                            ? 'hover:border-red-200 hover:bg-red-50 hover:text-red-600'
                            : null,
                    )}
                    onClick={() => onToggle(role, permission, !active)}
                >
                    {pending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : locked ? (
                        'Khóa'
                    ) : !canUpdate ? (
                        'Chỉ xem'
                    ) : active ? (
                        'Gỡ quyền'
                    ) : (
                        'Cấp quyền'
                    )}
                </Button>
            </div>
        </div>
    );
}
