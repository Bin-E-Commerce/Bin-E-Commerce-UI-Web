// Danh sách order gần đây là read-only; mọi thao tác nghiệp vụ dẫn về Seller Order module.

import { ArrowUpRight, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { SellerDashboardSnapshot } from '@/services/seller';
import {
    formatDashboardDate,
    formatDashboardMoney,
    getDashboardOrderStatusLabel,
} from '../utils/dashboard-formatters';

interface SellerDashboardLatestOrdersProps {
    snapshot: SellerDashboardSnapshot;
}

export function SellerDashboardLatestOrders({
    snapshot,
}: SellerDashboardLatestOrdersProps) {
    return (
        <Card
            size="sm"
            className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
            <CardHeader className="flex flex-row items-center gap-2.5 border-b border-zinc-100 px-4 pb-3 pt-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                    <ClipboardList className="size-4" />
                </span>
                <div className="min-w-0">
                    <CardTitle className="text-base font-semibold text-zinc-950">
                        Đơn hàng gần đây
                    </CardTitle>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        Các đơn mới nhất của shop
                    </p>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
                {snapshot.latestOrders.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-zinc-500">
                        Chưa có đơn hàng nào.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {snapshot.latestOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/seller/orders/${order.id}`}
                                className="group flex flex-col gap-2 px-4 py-2.5 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center"
                            >
                                <span className="flex min-w-0 flex-1 items-center gap-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200">
                                        <ClipboardList className="size-3.5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-zinc-900">
                                            #{order.orderNumber}
                                        </span>
                                        <span className="mt-0.5 block text-[11px] text-zinc-500">
                                            {formatDashboardDate(
                                                order.createdAt,
                                            )}{' '}
                                            · {order.itemCount} sản phẩm
                                        </span>
                                    </span>
                                </span>
                                <span className="flex items-center justify-between gap-4 sm:justify-end">
                                    <span className="text-left sm:text-right">
                                        <span className="block text-sm font-semibold tabular-nums text-zinc-900">
                                            {formatDashboardMoney(
                                                order.grossAmount,
                                            )}
                                        </span>
                                        <span className="mt-1 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-600">
                                            {getDashboardOrderStatusLabel(
                                                order.fulfillmentStatus,
                                            )}
                                        </span>
                                    </span>
                                    <ArrowUpRight className="size-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
                <div className="mt-auto border-t border-zinc-100 p-3">
                    <Link
                        href="/seller/orders"
                        className={buttonVariants({
                            variant: 'outline',
                            size: 'sm',
                            className: 'h-8 w-full gap-2 text-xs',
                        })}
                    >
                        Xem toàn bộ đơn hàng
                        <ArrowUpRight className="size-4" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
