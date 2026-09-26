// Orchestrator của màn hình danh sách user; chỉ nối hook dữ liệu với các mảnh UI.
// Header, filter, summary, table và pagination được tách riêng để file này không ôm layout chi tiết.
'use client';

import type { AdminUserRole, AdminUserStatus } from '@/services/admin';
import { useAdminUsersList } from '../../hooks/useAdminUsersList';
import { AdminUsersFilters } from './AdminUsersFilters';
import { AdminUsersHeader } from './AdminUsersHeader';
import { AdminUsersSummary } from './AdminUsersSummary';
import { AdminUsersTable } from './AdminUsersTable';

// Điều phối state filter/pagination và truyền callback nhỏ xuống các component trình bày.
export function AdminUsersPageClient() {
    const {
        query,
        data,
        search,
        setSearch,
        role,
        setRole,
        status,
        setStatus,
        page,
        setPage,
        resetPage,
    } = useAdminUsersList();

    return (
        <div className="space-y-5">
            <AdminUsersHeader
                isFetching={query.isFetching}
                onRefresh={() => void query.refetch()}
            />
            <AdminUsersSummary summary={data?.summary} />
            <AdminUsersFilters
                search={search}
                role={role}
                status={status}
                onSearchChange={(value) => {
                    setSearch(value);
                    resetPage();
                }}
                onRoleChange={(value: AdminUserRole | '') => {
                    setRole(value);
                    resetPage();
                }}
                onStatusChange={(value: AdminUserStatus | '') => {
                    setStatus(value);
                    resetPage();
                }}
            />
            {query.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Không tải được danh sách người dùng. Kiểm tra quyền ADMIN
                    hoặc thử lại.
                </div>
            ) : null}
            <AdminUsersTable
                items={data?.items ?? []}
                isLoading={query.isLoading}
                isFetching={query.isFetching}
                page={data?.meta.page ?? page}
                totalPages={data?.meta.totalPages ?? 1}
                total={data?.meta.total ?? 0}
                onPrevious={() => setPage((value) => Math.max(1, value - 1))}
                onNext={() =>
                    setPage((value) =>
                        Math.min(data?.meta.totalPages ?? value, value + 1),
                    )
                }
            />
        </div>
    );
}
