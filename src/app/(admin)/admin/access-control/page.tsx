'use client';

import { AccessControlHeader } from './components/AccessControlHeader';
import { AccessControlRoleMatrix } from './components/AccessControlRoleMatrix';
import { AccessControlSummaryGrid } from './components/AccessControlSummaryGrid';
import { useAdminAccessControl } from './hooks/useAdminAccessControl';

// Page chỉ compose các khối của màn phân quyền; data fetching, filter và UI chi tiết đã tách sang hook/components.
export default function AdminAccessControlPage() {
    const {
        overview,
        rolePermissionGroups,
        filteredRolePermissionGroups,
        filteredPermissionCount,
        resourceOptions,
        filters,
        hasActiveFilters,
        actionKey,
        isFetching,
        isError,
        handleRefresh,
        handleFilterChange,
        handleResetFilters,
        handleTogglePermission,
    } = useAdminAccessControl();

    return (
        <div className="space-y-6">
            <AccessControlHeader
                isFetching={isFetching}
                onRefresh={handleRefresh}
            />
            <AccessControlSummaryGrid overview={overview} />
            <AccessControlRoleMatrix
                overview={overview}
                rolePermissionGroups={rolePermissionGroups}
                filteredRolePermissionGroups={filteredRolePermissionGroups}
                filters={filters}
                resourceOptions={resourceOptions}
                filteredPermissionCount={filteredPermissionCount}
                hasActiveFilters={hasActiveFilters}
                actionKey={actionKey}
                isError={isError}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                onToggle={handleTogglePermission}
            />
        </div>
    );
}
