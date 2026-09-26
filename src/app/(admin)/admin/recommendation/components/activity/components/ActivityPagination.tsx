// Điều khiển phân trang activity và mô tả khoảng record hiện tại trong kết quả đã lọc.

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}

// Chỉ hiện nút điều hướng khi có nhiều hơn một trang và khóa nút ở hai biên phân trang.
export function ActivityPagination({
    page,
    pageSize,
    total,
    onPageChange,
}: Props) {
    const pageCount = Math.ceil(total / pageSize);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
            <span>
                Hiển thị {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, total)} trong tổng số {total}{' '}
                activity
            </span>
            {pageCount > 1 ? (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        type="button"
                        aria-label="Trang trước"
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <span className="min-w-20 text-center font-medium text-zinc-700">
                        Trang {page}/{pageCount}
                    </span>
                    <Button
                        variant="ghost"
                        type="button"
                        aria-label="Trang sau"
                        disabled={page >= pageCount}
                        onClick={() => onPageChange(page + 1)}
                        className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
