// Queue ưu tiên gom các công việc cần xử lý và dẫn tới module mutation chính thức.

import {
    ArrowUpRight,
    ClipboardCheck,
    PackageX,
    RotateCcw,
    Truck,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { SellerDashboardSnapshot } from '@/services/seller';
import { formatDashboardNumber } from '../utils/dashboard-formatters';

interface SellerDashboardActionQueueProps {
    snapshot: SellerDashboardSnapshot;
}

export function SellerDashboardActionQueue({
    snapshot,
}: SellerDashboardActionQueueProps) {
    const { kpis } = snapshot;
    const actions = [
        {
            label: 'Đơn chờ xác nhận',
            detail: 'Xem và xác nhận đơn mới',
            count: kpis.pendingConfirmation,
            href: '/seller/orders',
            icon: ClipboardCheck,
            tone: 'text-zinc-700 bg-zinc-100',
        },
        {
            label: 'Đơn cần chuẩn bị giao',
            detail: 'Đóng gói và bàn giao vận chuyển',
            count: kpis.pendingShipment,
            href: '/seller/orders',
            icon: Truck,
            tone: 'text-zinc-700 bg-zinc-100',
        },
        {
            label: 'Yêu cầu trả hàng',
            detail: 'Kiểm tra yêu cầu từ khách hàng',
            count: kpis.pendingReturns,
            href: '/seller/returns',
            icon: RotateCcw,
            tone: 'text-zinc-700 bg-zinc-100',
        },
        {
            label: 'Sản phẩm cần bổ sung kho',
            detail: 'Cập nhật tồn kho đang cảnh báo',
            count: kpis.outOfStockProducts,
            href: '/seller/products/inventory',
            icon: PackageX,
            tone: 'text-zinc-700 bg-zinc-100',
        },
    ];

    return (
        <Card
            size="sm"
            className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
            <CardHeader className="flex-row items-start justify-between gap-3 border-b border-zinc-100 px-4 pb-3 pt-3">
                <div>
                    <CardTitle className="text-base font-semibold text-zinc-950">
                        Việc cần xử lý
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        Các đầu việc ảnh hưởng trực tiếp đến trải nghiệm khách
                        hàng.
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-1.5 px-4 pb-3 pt-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="group flex items-center gap-2.5 rounded-lg border border-transparent p-2 transition-colors hover:border-zinc-200 hover:bg-zinc-50"
                        >
                            <span
                                className={`flex size-8 shrink-0 items-center justify-center rounded-md ${action.tone}`}
                            >
                                <Icon className="size-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-xs font-medium text-zinc-800">
                                    {action.label}
                                </span>
                                <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                                    {action.detail}
                                </span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold tabular-nums text-zinc-950">
                                    {formatDashboardNumber(action.count)}
                                </span>
                                <ArrowUpRight className="size-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </span>
                        </Link>
                    );
                })}
                <Link
                    href="/seller/orders"
                    className={buttonVariants({
                        variant: 'outline',
                        className: 'mt-1 h-8 w-full gap-1.5 bg-white text-xs',
                    })}
                >
                    Mở trung tâm xử lý
                    <ArrowUpRight className="size-4" />
                </Link>
            </CardContent>
        </Card>
    );
}
