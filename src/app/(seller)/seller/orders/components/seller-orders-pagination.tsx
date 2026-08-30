// Pagination Seller order giữ control nhỏ gọn và không thay đổi các filter đang xem.

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SellerOrdersPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
}

// Khóa nút ở biên dữ liệu và ẩn footer khi shop chưa có order nào.
export function SellerOrdersPagination({
    page,
    totalPages,
    total,
    onPageChange,
}: SellerOrdersPaginationProps) {
    if (total === 0) return null;

    return (
        <footer className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 sm:px-6">
            <p className="text-xs text-zinc-500">
                Trang <strong className="text-zinc-950">{page}</strong> /{' '}
                {Math.max(totalPages, 1)} · {total} đơn hàng
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Trang trước"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Trang sau"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight />
                </Button>
            </div>
        </footer>
    );
}
