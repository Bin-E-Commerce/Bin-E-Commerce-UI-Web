'use client';

import { useDeferredValue, useMemo, useState } from 'react';

import type { SellerApplicationStatus } from '@/services/seller';

import { AdminSellerApplicationFilters } from './AdminSellerApplicationFilters';
import { AdminSellerApplicationStats } from './AdminSellerApplicationStats';
import { AdminSellerApplicationsTable } from './AdminSellerApplicationsTable';
import { useAdminSellerApplications } from '../hooks/useAdminSellerApplications';

type AdminSellerApplicationStatusFilter = SellerApplicationStatus | 'all';

// Trang client gom state filter/pagination, còn bảng và filter được tách riêng để dễ mở rộng nghiệp vụ duyệt sau.
export function AdminSellerApplicationsPageClient() {
    const [status, setStatus] = useState<AdminSellerApplicationStatusFilter>('pending_review');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const deferredSearch = useDeferredValue(search);
    const pageSize = 20;

    const query = useAdminSellerApplications({
        status,
        search: deferredSearch,
        page,
        pageSize,
    });

    const items = query.data?.items ?? [];
    const meta = query.data?.meta ?? {
        page,
        pageSize,
        totalItems: 0,
        totalPages: 1,
    };

    const pendingItems = useMemo(
        () => items.filter((item) => item.status === 'pending_review').length,
        [items],
    );

    // Khi đổi trạng thái, quay về trang đầu để tránh rơi vào trang rỗng của filter mới.
    function handleStatusChange(nextStatus: AdminSellerApplicationStatusFilter) {
        setStatus(nextStatus);
        setPage(1);
    }

    // Khi đổi từ khóa, reset trang để kết quả tìm kiếm bắt đầu từ đầu danh sách.
    function handleSearchChange(nextSearch: string) {
        setSearch(nextSearch);
        setPage(1);
    }

    return (
        <div className="space-y-5">
            <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            Người bán
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
                            Hồ sơ đăng ký seller
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                            Kiểm tra danh sách hồ sơ người bán trước khi duyệt và kích hoạt
                            quyền vận hành shop.
                        </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Ưu tiên xử lý
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Hồ sơ chờ duyệt mới nhất
                        </p>
                    </div>
                </div>
            </section>

            <AdminSellerApplicationFilters
                status={status}
                search={search}
                loading={query.isFetching}
                onStatusChange={handleStatusChange}
                onSearchChange={handleSearchChange}
                onRefresh={() => query.refetch()}
            />

            {query.isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Không tải được danh sách hồ sơ. Vui lòng kiểm tra quyền truy cập hoặc thử lại.
                </div>
            ) : null}

            <AdminSellerApplicationStats
                totalItems={meta.totalItems}
                pageItems={items.length}
                pendingItems={pendingItems}
            />

            <AdminSellerApplicationsTable
                items={items}
                loading={query.isLoading}
                page={meta.page}
                totalPages={meta.totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}
