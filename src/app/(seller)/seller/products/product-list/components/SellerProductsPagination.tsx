import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SellerProductsPaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

// Điều hướng trang bằng hai nút icon quen thuộc và khóa nút khi đã ở biên dữ liệu.
export function SellerProductsPagination({
    page,
    totalPages,
    totalItems,
    onPageChange,
}: SellerProductsPaginationProps) {
    if (totalItems === 0) return null;

    return (
        <footer className="flex items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3 sm:px-6">
            <p className="text-xs text-zinc-500">
                Trang <strong className="text-zinc-950">{page}</strong> /{' '}
                {Math.max(totalPages, 1)} · {totalItems} sản phẩm
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Trang trước"
                    aria-label="Đi đến trang trước"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Trang sau"
                    aria-label="Đi đến trang sau"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </footer>
    );
}
