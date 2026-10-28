// Điều khiển phân trang dùng chung cho bảng finance; component chỉ hiển thị metadata và phát trang mới.
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FinanceTablePaginationProps } from '../../types/shared/finance-table-pagination.types';

// Tính khoảng bản ghi an toàn ở trang rỗng và khóa điều hướng khi đang tải hoặc ở hai biên.
export function FinanceTablePagination({
    page,
    pageSize,
    total,
    isFetching,
    itemLabel,
    onPageChange,
}: FinanceTablePaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3 text-xs text-zinc-500 sm:px-6">
            <p>
                Hiển thị{' '}
                <span className="font-semibold text-zinc-800">
                    {firstItem}–{lastItem}
                </span>{' '}
                trên {total} {itemLabel}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label="Trang trước"
                    disabled={page <= 1 || isFetching}
                    onClick={() => onPageChange(page - 1)}
                    className="h-8 rounded-lg border-zinc-200 bg-white px-2.5 text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="size-3.5" aria-hidden="true" />
                    Trước
                </Button>
                <span
                    aria-live="polite"
                    className="min-w-16 text-center font-medium text-zinc-700"
                >
                    {page} / {totalPages}
                </span>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-label="Trang sau"
                    disabled={page >= totalPages || isFetching}
                    onClick={() => onPageChange(page + 1)}
                    className="h-8 rounded-lg border-zinc-200 bg-white px-2.5 text-xs shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Sau
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}
