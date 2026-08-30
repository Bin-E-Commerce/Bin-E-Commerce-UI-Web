// Nội dung detail Seller trình bày snapshot sản phẩm của shop, địa chỉ giao hàng và timeline read-only.

'use client';

import Link from 'next/link';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CircleAlert,
    Clock3,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderProductImages } from '@/hooks/use-order-product-images';
import { cn } from '@/lib/utils';
import type { SellerOrderStatus } from '@/services/order/seller-order.api';
import { useSellerOrderDetail } from '../hooks/use-seller-order-detail';
import { SellerOrderProductImage } from './seller-order-product-image';
import {
    formatSellerMoney,
    formatSellerOrderDate,
    getSellerOrderStatusLabel,
} from '../utils/seller-order-format';

interface SellerOrderDetailContentProps {
    orderId: string;
}

// Ghép snapshot địa chỉ theo thứ tự tự nhiên và bỏ các field placeholder khỏi chuỗi hiển thị.
function formatShippingAddress(address: Record<string, string>): string {
    return [address.street, address.ward, address.district, address.province]
        .filter((value) => Boolean(value) && value !== 'Không áp dụng')
        .join(', ');
}

// Chọn icon timeline theo trạng thái để Seller nhận biết nhanh thành công, đang xử lý hoặc lỗi/hủy.
function SellerStatusIcon({ status }: { status: SellerOrderStatus }) {
    if (status === 'CANCELLED' || status === 'FAILED') {
        return <XCircle className="size-4" aria-hidden="true" />;
    }
    if (status === 'PENDING') {
        return <Clock3 className="size-4" aria-hidden="true" />;
    }
    return <Check className="size-4" aria-hidden="true" />;
}

// Trình bày order detail với trạng thái loading/error riêng để layout Seller không bị màn trắng.
export function SellerOrderDetailContent({
    orderId,
}: SellerOrderDetailContentProps) {
    const orderQuery = useSellerOrderDetail(orderId);
    const legacyImages = useOrderProductImages(orderQuery.data?.items ?? []);

    if (orderQuery.isPending) {
        return (
            <div className="space-y-5">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (orderQuery.isError || !orderQuery.data) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                <CircleAlert className="mx-auto size-9 text-red-500" />
                <h1 className="mt-4 text-lg font-semibold text-zinc-950">
                    Không thể tải đơn hàng
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                    Đơn hàng không tồn tại, không thuộc shop hoặc Seller Service đang tạm thời không sẵn sàng.
                </p>
                <Link
                    href="/seller/orders"
                    className="mt-6 inline-flex h-9 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                    Quay lại đơn hàng
                </Link>
            </div>
        );
    }

    const order = orderQuery.data;
    const address = order.shippingAddress;

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                    href="/seller/orders"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
                >
                    <ArrowLeft className="size-4" />
                    Quay lại đơn hàng
                </Link>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <span>Mã đơn hàng</span>
                    <span className="font-semibold text-zinc-950">#{order.orderNumber}</span>
                </div>
            </div>

            <header className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Chi tiết đơn hàng
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h1 className="break-all text-2xl font-bold tracking-tight text-zinc-950">
                                #{order.orderNumber}
                            </h1>
                        </div>
                        <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                            <CalendarDays className="size-4" />
                            Đặt ngày {formatSellerOrderDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-4">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500">
                            <span
                                className={cn(
                                    'inline-flex size-5 items-center justify-center',
                                    order.status === 'CONFIRMED' && 'text-emerald-500',
                                    order.status === 'PENDING' && 'text-amber-500',
                                    order.status === 'CANCELLED' && 'text-zinc-400',
                                    order.status === 'FAILED' && 'text-red-500',
                                )}
                            >
                                <SellerStatusIcon status={order.status} />
                            </span>
                            {getSellerOrderStatusLabel(order.status)}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-600">
                            <ReceiptText className="size-4 text-zinc-500" />
                            Thanh toán COD
                        </span>
                    </div>
                </div>

                <section aria-labelledby="seller-order-status-title" className="pt-5">
                    <h2 id="seller-order-status-title" className="text-sm font-semibold text-zinc-950">
                        Trạng thái đơn hàng
                    </h2>
                    <div className="mt-5 flex flex-col gap-5 md:flex-row md:gap-0">
                        {order.statusHistory.map((history, index) => (
                            <div
                                key={history.id}
                                className="relative flex min-w-0 flex-1 items-start gap-3 md:block md:text-center"
                            >
                                {index < order.statusHistory.length - 1 ? (
                                    <div className="absolute left-3.5 top-8 h-[calc(100%+1.25rem)] w-px bg-zinc-200 md:left-[calc(50%+1.25rem)] md:right-[calc(-50%+1.25rem)] md:top-5 md:h-px md:w-auto" />
                                ) : null}
                                <div className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white md:mx-auto ${history.toStatus === 'CONFIRMED' ? 'bg-emerald-500 text-white' : history.toStatus === 'CANCELLED' || history.toStatus === 'FAILED' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'}`}>
                                    <SellerStatusIcon status={history.toStatus} />
                                </div>
                                <div className="min-w-0 md:mt-3">
                                    <p className="text-xs font-semibold text-zinc-900">
                                        {getSellerOrderStatusLabel(history.toStatus)}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                                        {history.reason}
                                    </p>
                                    <p className="mt-1 text-[10px] text-zinc-400">
                                        {formatSellerOrderDate(history.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                    <Package className="size-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-zinc-950">Sản phẩm của shop</h2>
                                    <p className="text-xs text-zinc-500">Các sản phẩm thuộc shop trong đơn hàng</p>
                                </div>
                            </div>
                            <span className="text-xs text-zinc-400">{order.items.length} mặt hàng</span>
                        </div>
                        <div className="divide-y divide-zinc-100 px-5 sm:px-6">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 py-5 sm:gap-5">
                                    <SellerOrderProductImage
                                        src={item.imageUrl ?? legacyImages.get(item.productId) ?? null}
                                        alt={item.productName}
                                        large
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-zinc-950">{item.productName}</h3>
                                                <p className="mt-1 text-sm text-zinc-500">{item.variantName}</p>
                                                <p className="mt-2 text-sm text-zinc-500">
                                                    {formatSellerMoney(item.unitPrice)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-base font-bold tabular-nums text-zinc-950">
                                                {formatSellerMoney(item.lineTotal)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <MapPin className="size-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-zinc-950">Địa chỉ nhận hàng</h2>
                                <p className="text-xs text-zinc-500">Snapshot tại thời điểm đặt hàng</p>
                            </div>
                        </div>
                        <div className="mt-5 rounded-lg bg-zinc-50 p-4">
                            <p className="font-semibold text-zinc-950">{address.fullName || 'Chưa có tên người nhận'}</p>
                            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                                <Phone className="size-4 shrink-0" />
                                {address.phone || 'Chưa có số điện thoại'}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-zinc-600">{formatShippingAddress(address)}</p>
                        </div>
                    </section>
                </div>

                <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <ReceiptText className="size-4" />
                        </div>
                        <h2 className="font-semibold text-zinc-950">Tổng tiền shop</h2>
                    </div>
                    <div className="mt-6 space-y-4 text-sm">
                        <div className="flex items-center justify-between gap-4 text-zinc-500">
                            <span>Tạm tính sản phẩm</span>
                            <span className="font-medium tabular-nums text-zinc-950">{formatSellerMoney(order.shopItemTotal)}</span>
                        </div>
                        <div className="border-t border-zinc-100 pt-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold text-zinc-950">Doanh thu shop</span>
                                <span className="text-xl font-bold tabular-nums text-zinc-950">{formatSellerMoney(order.shopItemTotal)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 rounded-lg bg-zinc-50 px-3 py-2.5 text-xs leading-5 text-zinc-500">
                        Số tiền trên chỉ bao gồm các sản phẩm thuộc shop của bạn.
                    </div>
                </aside>
            </div>
        </div>
    );
}
