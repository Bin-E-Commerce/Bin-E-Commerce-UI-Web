'use client';

import { AlertCircle, PackageSearch } from 'lucide-react';

import { useSellerProducts } from '../hooks/useSellerProducts';
import { SellerProductFilters } from './SellerProductFilters';
import { SellerProductsEmptyState } from './SellerProductsEmptyState';
import { SellerProductsPagination } from './SellerProductsPagination';
import { SellerProductsSkeleton } from './SellerProductsSkeleton';
import { SellerProductsSummary } from './SellerProductsSummary';
import { SellerProductsTable } from './SellerProductsTable';

// Điều phối toàn bộ trạng thái trang sản phẩm seller nhưng giao từng vùng hiển thị cho component chuyên trách.
export function SellerProductsPageContent() {
    const {
        search,
        status,
        sortBy,
        sortOrder,
        page,
        productsQuery,
        changeSearch,
        changeStatus,
        changeSort,
        setPage,
    } = useSellerProducts();
    const data = productsQuery.data;
    const summary = data?.summary ?? {
        total: 0,
        active: 0,
        draft: 0,
        inactive: 0,
        outOfStock: 0,
    };
    const hasFilters = Boolean(search.trim() || status);

    // Xóa các điều kiện người dùng có thể nhìn thấy; tiêu chí sắp xếp được giữ vì không làm mất kết quả.
    const clearFilters = () => {
        changeSearch('');
        changeStatus(undefined);
    };

    return (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
            <header className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase text-zinc-500">
                        Quản lý sản phẩm
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-zinc-950">
                        Tất cả sản phẩm
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                        Theo dõi giá bán, tồn kho, hiệu suất và trạng thái hiển
                        thị của sản phẩm trong shop.
                    </p>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-zinc-50 px-4 py-3">
                    <PackageSearch className="size-5 text-zinc-500" />
                    <div>
                        <p className="text-xs text-zinc-500">Đang hiển thị</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-950">
                            {data?.totalItems ?? 0} sản phẩm
                        </p>
                    </div>
                </div>
            </header>

            <SellerProductsSummary summary={summary} />
            <SellerProductFilters
                search={search}
                status={status}
                sortBy={sortBy}
                sortOrder={sortOrder}
                summary={summary}
                refreshing={productsQuery.isFetching}
                onSearchChange={changeSearch}
                onStatusChange={changeStatus}
                onSortChange={changeSort}
                onRefresh={() => void productsQuery.refetch()}
            />

            {productsQuery.isError ? (
                <div className="m-4 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <div>
                        <p className="font-semibold">
                            Không tải được danh sách sản phẩm
                        </p>
                        <p className="mt-1">
                            Vui lòng kiểm tra quyền truy cập hoặc thử làm mới
                            sau ít phút.
                        </p>
                    </div>
                </div>
            ) : productsQuery.isLoading ? (
                <SellerProductsSkeleton />
            ) : data && data.items.length > 0 ? (
                <SellerProductsTable products={data.items} />
            ) : (
                <SellerProductsEmptyState
                    filtered={hasFilters}
                    onClearFilters={clearFilters}
                />
            )}

            <SellerProductsPagination
                page={page}
                totalPages={data?.totalPages ?? 0}
                totalItems={data?.totalItems ?? 0}
                onPageChange={setPage}
            />
        </div>
    );
}
