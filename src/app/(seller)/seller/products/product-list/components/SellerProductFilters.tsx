'use client';

import { RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    SellerProductSortBy,
    SellerProductSortOrder,
    SellerProductStatus,
    SellerProductSummary,
} from '@/services/product';
import { SellerProductSortCombobox } from './SellerProductSortCombobox';

interface SellerProductFiltersProps {
    search: string;
    status: SellerProductStatus | undefined;
    sortBy: SellerProductSortBy;
    sortOrder: SellerProductSortOrder;
    summary: SellerProductSummary;
    refreshing: boolean;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: SellerProductStatus | undefined) => void;
    onSortChange: (
        sortBy: SellerProductSortBy,
        sortOrder: SellerProductSortOrder,
    ) => void;
    onRefresh: () => void;
}

interface StatusTabProps {
    active: boolean;
    label: string;
    count: number;
    onClick: () => void;
}

// Render một tab trạng thái có kích thước ổn định để số lượng thay đổi không làm lệch bố cục.
function StatusTab({
    active,
    label,
    count,
    onClick,
}: StatusTabProps) {
    return (
        <button
            type="button"
            className={
                active
                    ? 'h-11 shrink-0 border-b-2 border-zinc-950 px-1 text-sm font-semibold text-zinc-950'
                    : 'h-11 shrink-0 border-b-2 border-transparent px-1 text-sm text-zinc-500 transition-colors hover:text-zinc-950'
            }
            onClick={onClick}
        >
            {label} <span className="tabular-nums">({count})</span>
        </button>
    );
}

// Gom tab trạng thái, tìm kiếm, sắp xếp và refresh thành một thanh công cụ responsive.
export function SellerProductFilters({
    search,
    status,
    sortBy,
    sortOrder,
    summary,
    refreshing,
    onSearchChange,
    onStatusChange,
    onSortChange,
    onRefresh,
}: SellerProductFiltersProps) {
    return (
        <section className="border-y border-zinc-200 bg-white">
            <div className="overflow-x-auto px-4 sm:px-6">
                <div className="flex min-w-max gap-6">
                    <StatusTab
                        active={status === undefined}
                        label="Tất cả"
                        count={summary.total}
                        onClick={() => onStatusChange(undefined)}
                    />
                    <StatusTab
                        active={status === 'ACTIVE'}
                        label="Đang hoạt động"
                        count={summary.active}
                        onClick={() => onStatusChange('ACTIVE')}
                    />
                    <StatusTab
                        active={status === 'DRAFT'}
                        label="Bản nháp"
                        count={summary.draft}
                        onClick={() => onStatusChange('DRAFT')}
                    />
                    <StatusTab
                        active={status === 'INACTIVE'}
                        label="Đang ẩn"
                        count={summary.inactive}
                        onClick={() => onStatusChange('INACTIVE')}
                    />
                    <StatusTab
                        active={status === 'DELETED'}
                        label="Đã xóa"
                        count={summary.deleted}
                        onClick={() => onStatusChange('DELETED')}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-100 p-4 sm:flex-row sm:items-center sm:px-6">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        className="h-10 pl-9"
                        placeholder="Tìm theo tên sản phẩm, slug hoặc SKU"
                        aria-label="Tìm sản phẩm"
                    />
                </div>
                <SellerProductSortCombobox
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onChange={onSortChange}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 self-end sm:self-auto"
                    title="Làm mới danh sách"
                    aria-label="Làm mới danh sách sản phẩm"
                    onClick={onRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw
                        className={
                            refreshing
                                ? 'size-4 animate-spin'
                                : 'size-4'
                        }
                    />
                </Button>
            </div>
        </section>
    );
}
