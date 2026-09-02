// Component điều phối Seller order list: query, filter, trạng thái tải/lỗi/rỗng và card detail.

'use client';

import { AlertCircle, ClipboardList } from 'lucide-react';

import { SellerOrderCard } from './seller-order-card';
import { SellerOrderFilters } from './seller-order-filters';
import { SellerOrdersEmptyState } from './seller-orders-empty-state';
import { SellerOrdersPagination } from './seller-orders-pagination';
import { SellerOrdersSkeleton } from './seller-orders-skeleton';
import { useSellerOrders } from '../hooks/use-seller-orders';
import { useOrderProductImages } from '@/hooks/use-order-product-images';

// Phối hợp mọi state của list trong một component để page route chỉ còn nhiệm vụ compose feature.
export function SellerOrdersPageContent() {
    const {
        status,
        search,
        page,
        ordersQuery,
        changeSearch,
        changeStatus,
        setPage,
    } = useSellerOrders();
    const data = ordersQuery.data;
    const legacyImages = useOrderProductImages(
        data?.items.flatMap((order) => order.previewItems) ?? [],
    );
    const filtered = Boolean(status || search.trim());

    // Xóa cả search và status rồi quay về page đầu để seller nhận lại toàn bộ order của shop.
    const clearFilters = () => {
        changeSearch('');
        changeStatus(undefined);
    };

    return (
        <div className="min-w-0 space-y-4 sm:space-y-5">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div className="min-w-0">
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                        Đơn hàng
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        Theo dõi các đơn hàng có sản phẩm thuộc shop của bạn.
                    </p>
                </div>
                <div className="flex w-fit items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                        <ClipboardList className="size-4" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500">Tổng đơn hàng</p>
                        <p className="text-sm font-semibold tabular-nums text-zinc-950">
                            {data?.counts?.all ?? data?.total ?? 0} đơn
                        </p>
                    </div>
                </div>
            </header>

            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <SellerOrderFilters
                    status={status}
                    counts={data?.counts}
                    search={search}
                    refreshing={ordersQuery.isFetching}
                    onStatusChange={changeStatus}
                    onSearchChange={changeSearch}
                    onRefresh={() => void ordersQuery.refetch()}
                />

                {ordersQuery.isError ? (
                    <div className="m-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                Không thể tải danh sách đơn hàng
                            </p>
                            <p className="mt-1 leading-6">
                                Vui lòng kiểm tra quyền truy cập hoặc thử làm
                                mới sau ít phút.
                            </p>
                        </div>
                    </div>
                ) : ordersQuery.isPending ? (
                    <SellerOrdersSkeleton />
                ) : data && data.items.length > 0 ? (
                    <div className="space-y-3 p-4 sm:p-6">
                        {data.items.map((order) => (
                            <SellerOrderCard
                                key={order.id}
                                order={order}
                                legacyImages={legacyImages}
                            />
                        ))}
                    </div>
                ) : (
                    <SellerOrdersEmptyState
                        filtered={filtered}
                        onClear={clearFilters}
                    />
                )}

                <SellerOrdersPagination
                    page={data?.page ?? page}
                    totalPages={data?.totalPages ?? 0}
                    total={data?.total ?? 0}
                    onPageChange={setPage}
                />
            </section>
        </div>
    );
}
