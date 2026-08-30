// Badge trạng thái Seller dùng chung cho list và detail, chỉ trình bày enum đã được backend xác định.

import { cn } from '@/lib/utils';
import type { SellerOrderStatus } from '@/services/order/seller-order.api';
import { getSellerOrderStatusLabel } from '../utils/seller-order-format';

interface SellerOrderStatusBadgeProps {
    status: SellerOrderStatus;
}

// Chọn màu theo trạng thái để seller quét nhanh đơn cần chú ý mà vẫn giữ tương phản tốt.
export function SellerOrderStatusBadge({
    status,
}: SellerOrderStatusBadgeProps) {
    const tone = {
        PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
        CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        FAILED: 'border-red-200 bg-red-50 text-red-700',
        CANCELLED: 'border-zinc-200 bg-zinc-100 text-zinc-600',
    }[status];

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                tone,
            )}
        >
            {getSellerOrderStatusLabel(status)}
        </span>
    );
}
