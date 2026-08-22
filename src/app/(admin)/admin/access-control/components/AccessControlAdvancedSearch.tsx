import { useMemo } from 'react';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminAccessRole } from '@/services/admin';
import type {
    AccessControlFilters,
    PermissionStatusFilter,
} from '../types/access-control-filter.type';
import {
    AccessControlCombobox,
    type AccessControlComboboxOption,
} from './AccessControlCombobox';

interface AccessControlAdvancedSearchProps {
    filters: AccessControlFilters;
    roles: AdminAccessRole[];
    resourceOptions: string[];
    resultCount: number;
    hasActiveFilters: boolean;
    onFilterChange: <Key extends keyof AccessControlFilters>(
        key: Key,
        value: AccessControlFilters[Key],
    ) => void;
    onResetFilters: () => void;
}

// Hiển thị bộ lọc nâng cao để admin tìm nhanh permission theo keyword, role, trạng thái và resource.
export function AccessControlAdvancedSearch({
    filters,
    roles,
    resourceOptions,
    resultCount,
    hasActiveFilters,
    onFilterChange,
    onResetFilters,
}: AccessControlAdvancedSearchProps) {
    const roleOptions = useMemo<AccessControlComboboxOption[]>(
        () => [
            { value: 'all', label: 'Tất cả role' },
            ...roles.map((role) => ({
                value: role.code,
                label: `${role.code} - ${role.name}`,
                description: role.description ?? undefined,
            })),
        ],
        [roles],
    );
    const statusOptions = useMemo<AccessControlComboboxOption[]>(
        () => [
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'active', label: 'Đang bật' },
            { value: 'inactive', label: 'Đang tắt' },
            { value: 'locked', label: 'Bị khóa' },
        ],
        [],
    );
    const resourceComboboxOptions = useMemo<AccessControlComboboxOption[]>(
        () => [
            { value: 'all', label: 'Tất cả resource' },
            ...resourceOptions.map((resource) => ({
                value: resource,
                label: resource,
            })),
        ],
        [resourceOptions],
    );

    return (
        <div className="border-b border-zinc-200 bg-zinc-50/70 p-5">
            <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_240px_220px_260px_auto] xl:items-end">
                <label className="min-w-0">
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Tìm kiếm quyền
                    </span>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            value={filters.keyword}
                            className="h-11 rounded-xl bg-white pl-9"
                            placeholder="Nhập tên quyền, mã quyền, resource hoặc action..."
                            onChange={(event) =>
                                onFilterChange('keyword', event.target.value)
                            }
                        />
                    </div>
                </label>

                <label>
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Role
                    </span>
                    <AccessControlCombobox
                        value={filters.roleCode}
                        options={roleOptions}
                        placeholder="Tìm hoặc chọn role"
                        emptyMessage="Không tìm thấy role phù hợp."
                        onValueChange={(value) =>
                            onFilterChange('roleCode', value)
                        }
                    />
                </label>

                <label>
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Trạng thái
                    </span>
                    <AccessControlCombobox
                        value={filters.status}
                        options={statusOptions}
                        placeholder="Tìm hoặc chọn trạng thái"
                        emptyMessage="Không tìm thấy trạng thái phù hợp."
                        onValueChange={(value) =>
                            onFilterChange(
                                'status',
                                value as PermissionStatusFilter,
                            )
                        }
                    />
                </label>

                <label>
                    <span className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Resource
                    </span>
                    <AccessControlCombobox
                        value={filters.resource}
                        options={resourceComboboxOptions}
                        placeholder="Tìm hoặc chọn resource"
                        emptyMessage="Không tìm thấy resource phù hợp."
                        onValueChange={(value) =>
                            onFilterChange('resource', value)
                        }
                    />
                </label>

                <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    disabled={!hasActiveFilters}
                    onClick={onResetFilters}
                >
                    <X className="size-4" />
                    Xóa lọc
                </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                    Đang hiển thị {resultCount} quyền phù hợp
                </span>
                {hasActiveFilters ? (
                    <span>
                        Danh sách bên dưới chỉ còn các role có quyền khớp bộ
                        lọc.
                    </span>
                ) : (
                    <span>
                        Nhập từ khóa hoặc chọn bộ lọc để thu hẹp ma trận quyền.
                    </span>
                )}
            </div>
        </div>
    );
}
