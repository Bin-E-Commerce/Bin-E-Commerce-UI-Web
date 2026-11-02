// Badge trạng thái Seller Center chỉ quyết định cách trình bày lifecycle, không thay đổi nghiệp vụ đơn hàng.
import { cn } from '@/lib/utils';
import type { SellerOrderStatus } from '@/services/order';
import { getSellerOrderStatusLabel } from '../utils/seller-order-format';

// Chọn tone đỏ cho đơn đã hủy/thất bại để seller nhận biết ngay các trạng thái kết thúc cần chú ý.
export function SellerOrderStatusBadge({
    status,
}: {
    status: SellerOrderStatus;
}) {
    const tone: Record<SellerOrderStatus, string> = {
        PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
        CONFIRMED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        FAILED: 'border-red-200 bg-red-50 text-red-700',
        CANCELLED: 'border-red-200 bg-red-50 text-red-700',
        TO_SHIP: 'border-amber-200 bg-amber-50 text-amber-700',
        SHIPPING: 'border-blue-200 bg-blue-50 text-blue-700',
        DELIVERED: 'border-black bg-black text-white',
        COMPLETED: 'border-black bg-black text-white',
        DELIVERY_FAILED: 'border-red-200 bg-red-50 text-red-700',
        RETURN_REFUND: 'border-zinc-950 bg-zinc-950 text-white',
    };
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                tone[status],
            )}
        >
            {getSellerOrderStatusLabel(status)}
        </span>
    );
}
