// KPI cards tập trung vào những chỉ số seller cần quét nhanh trong ngày.

import {
    ArrowUpRight,
    PackageCheck,
    ShoppingCart,
    Truck,
    WalletCards,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { SellerDashboardSnapshot } from '@/services/seller';
import {
    formatDashboardMoney,
    formatDashboardNumber,
} from '../utils/dashboard-formatters';

interface SellerDashboardKpiGridProps {
    snapshot: SellerDashboardSnapshot;
}

export function SellerDashboardKpiGrid({
    snapshot,
}: SellerDashboardKpiGridProps) {
    const { kpis } = snapshot;
    const items = [
        {
            label: 'Doanh thu gộp',
            value: formatDashboardMoney(kpis.grossRevenue),
            icon: WalletCards,
            href: '/seller/finance',
            tone: 'bg-zinc-950 text-white',
        },
        {
            label: 'Tổng đơn hàng',
            value: formatDashboardNumber(kpis.orderCount),
            icon: ShoppingCart,
            href: '/seller/orders',
            tone: 'bg-zinc-100 text-zinc-950',
        },
        {
            label: 'Đơn cần giao',
            value: formatDashboardNumber(kpis.pendingShipment),
            icon: Truck,
            href: '/seller/orders',
            tone: 'bg-zinc-100 text-zinc-700',
        },
        {
            label: 'Sản phẩm đang bán',
            value: formatDashboardNumber(kpis.activeProducts),
            icon: PackageCheck,
            href: '/seller/products',
            tone: 'bg-zinc-100 text-zinc-700',
        },
    ];

    return (
        <section className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <Card
                        key={item.label}
                        size="sm"
                        className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-sm"
                    >
                        <CardContent className="flex min-h-24 flex-col p-3.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${item.tone}`}
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <p className="truncate text-xs font-medium text-zinc-600">
                                        {item.label}
                                    </p>
                                </div>
                                <Link
                                    href={item.href}
                                    className={buttonVariants({
                                        variant: 'outline',
                                        size: 'sm',
                                        className:
                                            'h-7 shrink-0 gap-1 rounded-md px-2 text-[11px] text-zinc-700',
                                    })}
                                >
                                    Xem
                                    <ArrowUpRight className="size-3" />
                                </Link>
                            </div>
                            <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums text-zinc-950">
                                {item.value}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}
