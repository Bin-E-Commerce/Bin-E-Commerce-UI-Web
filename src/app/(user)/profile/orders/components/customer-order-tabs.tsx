// Thanh điều hướng các nhóm trạng thái đơn hàng của Customer.
// Mỗi tab gửi đúng bộ lọc status/stage của backend để trạng thái hiển thị nhất quán với nghiệp vụ.

'use client';

import {
    ClipboardList,
    PackageCheck,
    ReceiptText,
    RotateCcw,
    Truck,
    WalletCards,
} from 'lucide-react';

import type {
    CustomerOrderFilter,
    CustomerOrderTabCounts,
} from '@/services/order/order.api';

interface CustomerOrderTabsProps {
    activeFilter: CustomerOrderFilter;
    onChange: (filter: CustomerOrderFilter) => void;
    counts?: CustomerOrderTabCounts;
}

const tabs: Array<{
    label: string;
    filter: CustomerOrderFilter;
    icon: typeof ClipboardList;
    countKey?: keyof Omit<CustomerOrderTabCounts, 'all'>;
}> = [
    { label: 'Tất cả', filter: {}, icon: ClipboardList },
    {
        label: 'Chờ thanh toán',
        filter: { status: 'PENDING' },
        icon: WalletCards,
        countKey: 'pendingPayment',
    },
    {
        label: 'Chờ lấy hàng',
        filter: { stage: 'TO_SHIP' },
        icon: PackageCheck,
        countKey: 'toShip',
    },
    {
        label: 'Đang giao',
        filter: { stage: 'SHIPPING' },
        icon: Truck,
        countKey: 'shipping',
    },
    {
        label: 'Chờ xác nhận',
        filter: { stage: 'DELIVERED' },
        icon: PackageCheck,
        countKey: 'delivered',
    },
    {
        label: 'Hoàn thành',
        filter: { stage: 'COMPLETED' },
        icon: ReceiptText,
        countKey: 'completed',
    },
    {
        label: 'Đã hủy',
        filter: { stage: 'CANCELLED' },
        icon: RotateCcw,
        countKey: 'cancelled',
    },
    {
        label: 'Trả hàng/Hoàn tiền',
        filter: { stage: 'RETURN_REFUND' },
        icon: RotateCcw,
        countKey: 'returnRefund',
    },
];

// So sánh cả status và stage để URL chỉ active đúng một tab tại một thời điểm.
function isActiveTab(
    tab: (typeof tabs)[number],
    activeFilter: CustomerOrderFilter,
): boolean {
    return (
        tab.filter.status === activeFilter.status &&
        tab.filter.stage === activeFilter.stage
    );
}

// Render segmented control có thể cuộn ngang, giữ nguyên toàn bộ nhãn trên mọi kích thước màn hình.
export function CustomerOrderTabs({
    activeFilter,
    onChange,
    counts,
}: CustomerOrderTabsProps) {
    return (
        <nav
            className="relative mb-5 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm"
            aria-label="Khu vực đơn hàng"
        >
            <div className="flex gap-1 overflow-x-auto overscroll-x-contain pb-3 pr-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:bg-transparent">
                {tabs.map((tab) => {
                    const active = isActiveTab(tab, activeFilter);
                    const Icon = tab.icon;
                    const count = tab.countKey
                        ? (counts?.[tab.countKey] ?? 0)
                        : 0;

                    return (
                        <button
                            key={tab.label}
                            type="button"
                            onClick={() => onChange(tab.filter)}
                            aria-current={active ? 'page' : undefined}
                            className={`group flex min-w-max shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 ${
                                active
                                    ? 'bg-zinc-950 text-white shadow-[0_6px_16px_-8px_rgba(0,0,0,0.7)]'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                            }`}
                        >
                            <Icon
                                className={`size-4 shrink-0 transition-transform duration-200 ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'}`}
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
            <div
                className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-2xl bg-gradient-to-l from-white via-white/80 to-transparent"
                aria-hidden="true"
            />
        </nav>
    );
}
