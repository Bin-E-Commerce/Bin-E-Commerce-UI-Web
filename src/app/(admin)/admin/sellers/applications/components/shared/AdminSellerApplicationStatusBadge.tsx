import type { SellerApplicationStatus } from '@/services/seller';
import { cn } from '@/lib/utils';

import { formatSellerApplicationStatus } from '../../utils/seller-application-admin-formatters';

interface AdminSellerApplicationStatusBadgeProps {
    status: SellerApplicationStatus;
}

// Badge trạng thái dùng màu nhẹ để admin scan bảng nhanh mà không làm giao diện quá sặc sỡ.
export function AdminSellerApplicationStatusBadge({
    status,
}: AdminSellerApplicationStatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                status === 'pending_review' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
                status === 'approved' && 'bg-zinc-950 text-white',
                status === 'rejected' && 'bg-red-50 text-red-700 ring-1 ring-red-200',
                status === 'draft' && 'bg-zinc-100 text-zinc-600',
            )}
        >
            {formatSellerApplicationStatus(status)}
        </span>
    );
}
