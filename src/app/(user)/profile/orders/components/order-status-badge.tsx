import { cn } from '@/lib/utils';
import type { CustomerOrderStatus } from '@/services/order';

const STATUS_LABELS: Record<CustomerOrderStatus, string> = {
    PENDING: 'Đang xử lý',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy',
    FAILED: 'Thất bại',
};

const STATUS_STYLES: Record<CustomerOrderStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    CANCELLED: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
    FAILED: 'bg-red-50 text-red-700 ring-red-200',
};

// Hiển thị trạng thái nhất quán giữa card danh sách và trang detail.
export function OrderStatusBadge({ status }: { status: CustomerOrderStatus }) {
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
