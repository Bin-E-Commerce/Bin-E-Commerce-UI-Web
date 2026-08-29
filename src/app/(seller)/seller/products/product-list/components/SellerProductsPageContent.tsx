'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AlertCircle, PackagePlus, PackageSearch } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { canAccessSellerPath } from '@/services/auth/access/session-access';
import { useAppSelector } from '@/store/hooks';
import { useSellerProducts } from '../hooks/useSellerProducts';
import { SellerProductFilters } from './SellerProductFilters';
import { SellerProductsEmptyState } from './SellerProductsEmptyState';
import { SellerProductsPagination } from './SellerProductsPagination';
import { SellerProductsSkeleton } from './SellerProductsSkeleton';
import { SellerProductsSummary } from './SellerProductsSummary';
import { SellerProductsTable } from './SellerProductsTable';
import { SellerProductDeleteDialog } from './SellerProductDeleteDialog';
import { SellerProductRestoreDialog } from './SellerProductRestoreDialog';
import { useDeleteSellerProduct } from '../hooks/useDeleteSellerProduct';
import type { SellerProductListItem } from '@/services/product';
import type { SellerProductPublicationStatus } from '@/services/product';
import { SellerProductStatusDialog, type SellerProductStatusTarget } from '../../product-shared/components/SellerProductStatusDialog';
import { useChangeSellerProductStatus } from '../../product-shared/hooks/useChangeSellerProductStatus';
import { useRestoreSellerProduct } from '../hooks/useRestoreSellerProduct';

// Điều phối toàn bộ trạng thái trang sản phẩm seller nhưng giao từng vùng hiển thị cho component chuyên trách.
export function SellerProductsPageContent() {
    const [deleteTarget, setDeleteTarget] = useState<SellerProductListItem | null>(null);
    const [statusTarget, setStatusTarget] = useState<SellerProductStatusTarget | null>(null);
    const [targetStatus, setTargetStatus] = useState<SellerProductPublicationStatus | null>(null);
    const deleteMutation = useDeleteSellerProduct();
    const statusMutation = useChangeSellerProductStatus();
    const restoreMutation = useRestoreSellerProduct();
    const [restoreTarget, setRestoreTarget] = useState<SellerProductListItem | null>(null);
    const user = useAppSelector((state) => state.auth.user);
    const canCreateProduct = canAccessSellerPath(
        '/seller/products/new',
        user,
    );

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
        deleted: 0,
        outOfStock: 0,
    };
    const hasFilters = Boolean(search.trim() || status);

    // Xóa các điều kiện người dùng có thể nhìn thấy; tiêu chí sắp xếp được giữ vì không làm mất kết quả.
    const clearFilters = () => {
        changeSearch('');
        changeStatus(undefined);
    };

    // Chỉ đóng dialog sau khi backend xác nhận xóa thành công; lỗi conflict vẫn giữ context để người dùng đọc lại.
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
        } catch {
            // Mutation đã hiển thị lỗi qua toast; giữ dialog mở để tránh thao tác mất ngữ cảnh.
        }
    };

    // Mở dialog trước khi bật/tắt để thao tác nhanh không thể vô tình làm sản phẩm biến mất khỏi storefront.
    const openStatusDialog = (
        product: SellerProductListItem,
        nextStatus: SellerProductPublicationStatus,
    ) => {
        setStatusTarget({ id: product.id, name: product.name, status: product.status });
        setTargetStatus(nextStatus);
    };

    // Chỉ đóng dialog sau khi PATCH thành công; lỗi conflict vẫn giữ lại ngữ cảnh sản phẩm cho seller.
    const handleConfirmStatusChange = async () => {
        if (!statusTarget || !targetStatus) return;

        try {
            await statusMutation.mutateAsync({
                productId: statusTarget.id,
                status: targetStatus,
            });
            setStatusTarget(null);
            setTargetStatus(null);
        } catch {
            // Đóng modal sau lỗi để toast vẫn báo nguyên nhân nhưng lớp khóa không thể giữ toàn bộ trang.
            setStatusTarget(null);
            setTargetStatus(null);
        }
    };

    // Chỉ đóng dialog sau khi restore thành công để lỗi API vẫn giữ nguyên ngữ cảnh cho seller.
    const handleConfirmRestore = async () => {
        if (!restoreTarget) return;

        try {
            await restoreMutation.mutateAsync(restoreTarget.id);
            setRestoreTarget(null);
        } catch {
            // Mutation đã hiển thị lỗi qua toast; giữ dialog mở để seller có thể thử lại.
        }
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
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-3 rounded-md bg-zinc-50 px-4 py-3">
                        <PackageSearch className="size-5 text-zinc-500" />
                        <div>
                            <p className="text-xs text-zinc-500">
                                Đang hiển thị
                            </p>
                            <p className="text-sm font-semibold tabular-nums text-zinc-950">
                                {data?.totalItems ?? 0} sản phẩm
                            </p>
                        </div>
                    </div>
                    {canCreateProduct ? (
                        <Link
                            href="/seller/products/new"
                            className={buttonVariants({ size: 'lg' })}
                        >
                            <PackagePlus className="size-4" />
                            Thêm sản phẩm
                        </Link>
                    ) : null}
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
                <SellerProductsTable
                    products={data.items}
                    onDelete={setDeleteTarget}
                    onChangeStatus={openStatusDialog}
                    onRestore={setRestoreTarget}
                />
            ) : (
                <SellerProductsEmptyState
                    filtered={hasFilters}
                    canCreateProduct={canCreateProduct}
                    onClearFilters={clearFilters}
                />
            )}

            <SellerProductsPagination
                page={page}
                totalPages={data?.totalPages ?? 0}
                totalItems={data?.totalItems ?? 0}
                onPageChange={setPage}
            />
            <SellerProductDeleteDialog
                product={deleteTarget}
                loading={deleteMutation.isPending}
                onOpenChange={(open) => {
                    if (!open && !deleteMutation.isPending) setDeleteTarget(null);
                }}
                onConfirm={handleConfirmDelete}
            />
            <SellerProductStatusDialog
                product={statusTarget}
                targetStatus={targetStatus}
                loading={statusMutation.isPending}
                onOpenChange={(open) => {
                    if (!open && !statusMutation.isPending) {
                        setStatusTarget(null);
                        setTargetStatus(null);
                    }
                }}
                onConfirm={handleConfirmStatusChange}
            />
            <SellerProductRestoreDialog
                product={restoreTarget}
                loading={restoreMutation.isPending}
                onOpenChange={(open) => {
                    if (!open && !restoreMutation.isPending) setRestoreTarget(null);
                }}
                onConfirm={handleConfirmRestore}
            />
        </div>
    );
}
