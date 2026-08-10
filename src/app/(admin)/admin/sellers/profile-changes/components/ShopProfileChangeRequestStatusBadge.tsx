import type { ShopProfileChangeRequestStatus } from '@/services/seller';
import { cn } from '@/lib/utils';

interface ShopProfileChangeRequestStatusBadgeProps {
    status: ShopProfileChangeRequestStatus;
}

const STATUS_CONFIG: Record<
    ShopProfileChangeRequestStatus,
    { label: string; className: string }
> = {
    pending_review: {
        label: 'Chờ duyệt',
        className: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    approved: {
        label: 'Đã duyệt',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    rejected: {
        label: 'Từ chối',
        className: 'border-red-200 bg-red-50 text-red-700',
    },
    cancelled: {
        label: 'Đã hủy',
        className: 'border-zinc-200 bg-zinc-50 text-zinc-600',
    },
};

// Chuẩn hóa badge trạng thái cho cả list và trang chi tiết.
export function ShopProfileChangeRequestStatusBadge({
    status,
}: ShopProfileChangeRequestStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            className={cn(
                'inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium',
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}
