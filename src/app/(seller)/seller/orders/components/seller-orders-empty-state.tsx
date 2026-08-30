// Empty state Seller order phân biệt shop chưa có đơn và filter không có kết quả để hướng dẫn hành động đúng.

import { ClipboardList, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SellerOrdersEmptyStateProps {
    filtered: boolean;
    onClear: () => void;
}

// Hiển thị CTA phù hợp với nguyên nhân rỗng thay vì để Seller gặp một khoảng trắng khó hiểu.
export function SellerOrdersEmptyState({
    filtered,
    onClear,
}: SellerOrdersEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                {filtered ? <Search className="size-6" /> : <ClipboardList className="size-6" />}
            </div>
            <h2 className="mt-4 text-base font-semibold text-zinc-950">
                {filtered ? 'Không tìm thấy đơn phù hợp' : 'Shop chưa có đơn hàng'}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                {filtered
                    ? 'Thử đổi trạng thái hoặc kiểm tra lại mã đơn hàng bạn đang tìm.'
                    : 'Các đơn có sản phẩm thuộc shop sẽ xuất hiện tại đây.'}
            </p>
            {filtered ? (
                <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={onClear}
                >
                    Xóa bộ lọc
                </Button>
            ) : null}
        </div>
    );
}
