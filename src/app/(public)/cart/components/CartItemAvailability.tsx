// Hiển thị nhãn tồn kho cạnh tên sản phẩm; quyền chọn thanh toán do hook của giỏ hàng quản lý.

import { CircleHelp, PackageX } from 'lucide-react';

import type { CartItemAvailabilityProps } from '../types/cart-selection.types';

// Dùng nhãn ngắn để phân biệt hết hàng, ngừng bán và thiếu số lượng; lỗi kiểm tra tồn kho có màu trung tính.
export function CartItemAvailability({ item }: CartItemAvailabilityProps) {
    const { availabilityStatus, availableQuantity } = item;

    if (!availabilityStatus || availabilityStatus === 'AVAILABLE') return null;

    // Chưa nhận được dữ liệu tồn kho nên chỉ báo trạng thái kiểm tra, tránh nhầm với hết hàng.
    if (availabilityStatus === 'UNKNOWN') {
        return (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <CircleHelp className="size-3.5 shrink-0" aria-hidden="true" />
                Chưa cập nhật được giá và tồn kho
            </span>
        );
    }

    // Báo số lượng còn lại để người mua biết cần giảm số lượng đã chọn khi hàng chưa hết hẳn.
    return (
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-destructive/15 bg-destructive/5 px-2.5 py-1 text-xs font-medium text-destructive">
            <PackageX className="size-3.5 shrink-0" aria-hidden="true" />
            {availabilityStatus === 'OUT_OF_STOCK' && 'Hết hàng'}
            {availabilityStatus === 'UNAVAILABLE' && 'Ngừng bán'}
            {availabilityStatus === 'INSUFFICIENT_STOCK' && (
                <span>
                    {availableQuantity == null ? (
                        <>Không đủ số lượng</>
                    ) : (
                        <>Chỉ còn {availableQuantity} sản phẩm</>
                    )}
                </span>
            )}
        </span>
    );
}
