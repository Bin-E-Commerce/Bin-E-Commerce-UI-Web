// Thanh công cụ Seller order gom tab trạng thái, tìm mã đơn và refresh trong một vùng responsive.

import { RefreshCw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SellerOrderStatus } from '@/services/order/seller-order.api';

interface SellerOrderFiltersProps {
    status: SellerOrderStatus | undefined;
    search: string;
    refreshing: boolean;
    onStatusChange: (status: SellerOrderStatus | undefined) => void;
    onSearchChange: (search: string) => void;
    onRefresh: () => void;
}

interface SellerOrderTabProps {
    active: boolean;
    label: string;
    onClick: () => void;
}

// Tab có chiều cao cố định để số lượng kết quả thay đổi không làm nhảy layout.
function SellerOrderTab({
    active,
    label,
    onClick,
}: SellerOrderTabProps) {
    return (
        <button
            type="button"
            className={
                active
                    ? 'h-11 shrink-0 border-b-2 border-zinc-950 px-1 text-sm font-semibold text-zinc-950'
                    : 'h-11 shrink-0 border-b-2 border-transparent px-1 text-sm text-zinc-500 transition-colors hover:text-zinc-950'
            }
            onClick={onClick}
        >
            {label}
        </button>
    );
}

// Giữ search controlled và đẩy việc debounce/defer sang hook để ô tìm không bị lag khi seller gõ nhanh.
export function SellerOrderFilters({
    status,
    search,
    refreshing,
    onStatusChange,
    onSearchChange,
    onRefresh,
}: SellerOrderFiltersProps) {
    return (
        <section className="border-y border-zinc-200 bg-white">
            <div className="overflow-x-auto px-4 sm:px-6">
                <div className="flex min-w-max gap-6">
                    <SellerOrderTab
                        active={status === undefined}
                        label="Tất cả"
                        onClick={() => onStatusChange(undefined)}
                    />
                    <SellerOrderTab
                        active={status === 'PENDING'}
                        label="Đang xử lý"
                        onClick={() => onStatusChange('PENDING')}
                    />
                    <SellerOrderTab
                        active={status === 'CONFIRMED'}
                        label="Đã xác nhận"
                        onClick={() => onStatusChange('CONFIRMED')}
                    />
                    <SellerOrderTab
                        active={status === 'CANCELLED'}
                        label="Đã hủy"
                        onClick={() => onStatusChange('CANCELLED')}
                    />
                    <SellerOrderTab
                        active={status === 'FAILED'}
                        label="Thất bại"
                        onClick={() => onStatusChange('FAILED')}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-100 p-4 sm:flex-row sm:items-center sm:px-6">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="h-10 pl-9"
                        placeholder="Tìm theo mã đơn hàng"
                        aria-label="Tìm đơn hàng theo mã"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 self-end sm:self-auto"
                    aria-label="Làm mới danh sách đơn hàng"
                    onClick={onRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw className={refreshing ? 'animate-spin' : ''} />
                </Button>
            </div>
        </section>
    );
}
