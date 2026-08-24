import type { SellerProductStatus } from '@/services/product';

interface SellerProductStatusBadgeProps {
    status: SellerProductStatus;
}

// Hiển thị trạng thái vòng đời bằng nhãn trung tính, ưu tiên màu đen làm trạng thái đang bán.
export function SellerProductStatusBadge({
    status,
}: SellerProductStatusBadgeProps) {
    if (status === 'ACTIVE') {
        return (
            <span className="inline-flex items-center rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white">
                Đang hoạt động
            </span>
        );
    }

    if (status === 'DRAFT') {
        return (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                Bản nháp
            </span>
        );
    }

    if (status === 'DELETED') {
        return (
            <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                Đã xóa
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            Đang ẩn
        </span>
    );
}
