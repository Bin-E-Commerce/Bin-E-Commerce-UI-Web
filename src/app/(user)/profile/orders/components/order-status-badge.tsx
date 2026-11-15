// Hiển thị nhãn trạng thái dùng chung cho danh sách và chi tiết đơn; màu sắc chỉ phản ánh trạng thái, không quyết định nghiệp vụ.
import { cn } from '@/lib/utils';
import type { CustomerOrderStage, CustomerOrderStatus } from '@/services/order';

// Stage vận chuyển là nhãn ưu tiên sau khi đơn được xác nhận; status gốc vẫn dùng cho đơn chưa xử lý xong.
const STATUS_LABELS: Record<CustomerOrderStatus | CustomerOrderStage, string> =
    {
        PENDING: 'Chờ thanh toán',
        CONFIRMED: 'Đã xác nhận',
        CANCELLED: 'Đã hủy',
        FAILED: 'Thất bại',
        TO_SHIP: 'Chờ lấy hàng',
        SHIPPING: 'Đang giao',
        DELIVERED: 'Chờ xác nhận',
        COMPLETED: 'Hoàn thành',
        DELIVERY_FAILED: 'Giao hàng thất bại',
        RETURN_REFUND: 'Trả hàng/Hoàn tiền',
    };

const STATUS_STYLES: Record<CustomerOrderStatus | CustomerOrderStage, string> =
    {
        PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
        CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
        FAILED: 'bg-red-50 text-red-700 ring-red-200',
        TO_SHIP: 'bg-sky-50 text-sky-700 ring-sky-200',
        SHIPPING: 'bg-blue-50 text-blue-700 ring-blue-200',
        DELIVERED: 'bg-violet-50 text-violet-700 ring-violet-200',
        COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        DELIVERY_FAILED: 'bg-red-50 text-red-700 ring-red-200',
        RETURN_REFUND: 'bg-orange-50 text-orange-700 ring-orange-200',
    };

// Hiển thị trạng thái checkout hoặc vận chuyển bằng cùng một nhãn, không suy diễn từ trạng thái thanh toán.
export function OrderStatusBadge({
    status,
}: {
    status: CustomerOrderStatus | CustomerOrderStage;
}) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                STATUS_STYLES[status],
            )}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}

export function getOrderStatusLabel(status: CustomerOrderStatus): string {
    return STATUS_LABELS[status];
}
