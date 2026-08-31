//
// Thanh điều hướng các khu vực đơn hàng của Customer.
// Component chỉ phát sự kiện đổi stage; việc cập nhật URL và gọi API thuộc page để giữ một nguồn trạng thái.
//

'use client';

import {
    ClipboardList,
    PackageCheck,
    ReceiptText,
    RotateCcw,
    Truck,
    WalletCards,
} from 'lucide-react';

import type { CustomerOrderStage } from '@/services/order/order.api';

interface CustomerOrderTabsProps {
    activeStage?: CustomerOrderStage;
    onChange: (stage: CustomerOrderStage | undefined) => void;
}

const tabs: Array<{
    label: string;
    stage?: CustomerOrderStage;
    icon: typeof ClipboardList;
}> = [
    { label: 'Tất cả', icon: ClipboardList },
    { label: 'Chờ thanh toán', stage: 'TO_SHIP', icon: WalletCards },
    { label: 'Vận chuyển', stage: 'SHIPPING', icon: Truck },
    { label: 'Chờ giao hàng', stage: 'SHIPPING', icon: PackageCheck },
    { label: 'Hoàn thành', stage: 'COMPLETED', icon: ReceiptText },
    { label: 'Đã hủy', stage: 'CANCELLED', icon: RotateCcw },
    { label: 'Trả hàng/Hoàn tiền', stage: 'RETURN_REFUND', icon: RotateCcw },
];

// Xác định tab đang chọn theo stage hiện tại, đồng thời tránh để hai nhãn cùng stage bị active cùng lúc.
function isActiveTab(
    tab: (typeof tabs)[number],
    index: number,
    activeStage?: CustomerOrderStage,
): boolean {
    if (!activeStage) return index === 0;
    return tab.stage === activeStage && index === tabs.findIndex((item) => item.stage === activeStage);
}

// Render tab dạng segmented control; scrollbar được ẩn nhưng vẫn giữ khả năng swipe/cuộn ngang trên màn hình nhỏ.
export function CustomerOrderTabs({
    activeStage,
    onChange,
}: CustomerOrderTabsProps) {
    return (
        <nav
            className="relative mb-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm"
            aria-label="Khu vực đơn hàng"
        >
            <div
                className="no-scrollbar flex snap-x gap-1 overflow-x-auto scroll-smooth"
                style={{ scrollbarWidth: 'none' }}
            >
                {tabs.map((tab, index) => {
                    const active = isActiveTab(tab, index, activeStage);
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.label}
                            type="button"
                            onClick={() => onChange(tab.stage)}
                            aria-current={active ? 'page' : undefined}
                            className={`group flex min-w-[142px] snap-start cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 sm:min-w-0 sm:flex-1 ${
                                active
                                    ? 'bg-zinc-950 text-white shadow-[0_6px_16px_-8px_rgba(0,0,0,0.7)]'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                            }`}
                        >
                            <Icon
                                className={`size-4 shrink-0 transition-transform duration-200 ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'}`}
                                aria-hidden="true"
                            />
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
            <div
                className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent sm:hidden"
                aria-hidden="true"
            />
        </nav>
    );
}
