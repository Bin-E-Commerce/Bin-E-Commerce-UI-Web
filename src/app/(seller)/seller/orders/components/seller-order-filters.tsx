// Bộ lọc Seller dùng chung mapping stage với Customer để mỗi tab phản ánh đúng một bước nghiệp vụ.

import {
    ClipboardList,
    PackageCheck,
    ReceiptText,
    RefreshCw,
    RotateCcw,
    Search,
    Truck,
    type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    SellerOrderStatus,
    SellerOrderTabCounts,
} from '@/services/order/seller-order.api';

interface SellerOrderFiltersProps {
    status: SellerOrderStatus | undefined;
    counts?: SellerOrderTabCounts;
    search: string;
    refreshing: boolean;
    onStatusChange: (status: SellerOrderStatus | undefined) => void;
    onSearchChange: (search: string) => void;
    onRefresh: () => void;
}

const tabs: Array<{
    label: string;
    value: SellerOrderStatus | undefined;
    icon: LucideIcon;
    countKey?: keyof Omit<SellerOrderTabCounts, 'all'>;
}> = [
    { label: 'Tất cả', value: undefined, icon: ClipboardList },
    {
        label: 'Cần xử lý',
        value: 'TO_SHIP',
        icon: PackageCheck,
        countKey: 'toShip',
    },
    {
        label: 'Đang giao',
        value: 'SHIPPING',
        icon: Truck,
    },
    {
        label: 'Chờ xác nhận',
        value: 'DELIVERED',
        icon: PackageCheck,
    },
    {
        label: 'Hoàn thành',
        value: 'COMPLETED',
        icon: ReceiptText,
    },
    {
        label: 'Đã hủy',
        value: 'CANCELLED',
        icon: RotateCcw,
    },
    {
        label: 'Trả hàng / hoàn tiền',
        value: 'RETURN_REFUND',
        icon: RotateCcw,
        countKey: 'returnRefund',
    },
];

// Hiển thị tab, badge số lượng và ô tìm kiếm trong một vùng cuộn ngang phù hợp với màn hình nhỏ.
export function SellerOrderFilters({
    status,
    counts,
    search,
    refreshing,
    onStatusChange,
    onSearchChange,
    onRefresh,
}: SellerOrderFiltersProps) {
    return (
        <section className="border-y border-zinc-200 bg-white">
            <nav
                className="overflow-x-auto px-4 sm:px-6"
                aria-label="Bộ lọc đơn hàng của Seller"
            >
                <div className="flex min-w-max gap-5">
                    {tabs.map((tab, index) => {
                        const active =
                            status === tab.value || (index === 0 && !status);
                        const count = tab.countKey
                            ? (counts?.[tab.countKey] ?? 0)
                            : 0;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.label}
                                type="button"
                                aria-current={active ? 'page' : undefined}
                                className={`group flex h-14 shrink-0 cursor-pointer items-center gap-2 border-b-2 px-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 ${
                                    active
                                        ? 'border-zinc-950 font-semibold text-zinc-950'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-950'
                                }`}
                                onClick={() => onStatusChange(tab.value)}
                            >
                                <Icon
                                    className={`size-4 shrink-0 ${active ? 'text-zinc-950' : 'text-zinc-400 group-hover:text-zinc-700'}`}
                                    aria-hidden="true"
                                />
                                <span className="whitespace-nowrap">
                                    {tab.label}
                                </span>
                                {count > 0 ? (
                                    <span
                                        className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
                                        aria-label={`${count} đơn hàng`}
                                    >
                                        {count > 99 ? '99+' : count}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            </nav>

            <div className="flex flex-col gap-3 border-t border-zinc-100 p-4 sm:flex-row sm:items-center sm:px-6">
                <div className="relative min-w-0 flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                        aria-hidden="true"
                    />
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
                    className="size-10 shrink-0 cursor-pointer self-end sm:self-auto"
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
