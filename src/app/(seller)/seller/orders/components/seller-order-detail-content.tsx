// Nội dung detail Seller trình bày snapshot sản phẩm của shop, địa chỉ giao hàng và timeline read-only.

'use client';

import Link from 'next/link';
import {
    ArrowLeft,
    CalendarDays,
    CircleAlert,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    Star,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useOrderProductImages } from '@/hooks/orders/use-order-product-images';
import { useSellerShipment } from '@/hooks/shipping/use-shipment';
import { OrderLifecycleStepper } from '@/common/orders';
import { useSellerOrderDetail } from '../hooks/use-seller-order-detail';
import { SellerOrderProductImage } from './seller-order-product-image';
import { SellerShipmentPanel } from '@/common/shipping/components/seller-shipment-panel';
import { SellerShipmentQuickAction } from '@/common/shipping/components/seller-shipment-quick-action';
import {
    formatSellerMoney,
    formatSellerOrderDate,
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

// Trình bày order detail với trạng thái loading/error riêng; sau giao thành công mở lối tắt để Seller xem phản hồi sản phẩm.
export function SellerOrderDetailContent({
    orderId,
}: SellerOrderDetailContentProps) {
    const orderQuery = useSellerOrderDetail(orderId);
    const legacyImages = useOrderProductImages(orderQuery.data?.items ?? []);
    const shipmentQuery = useSellerShipment(orderId);

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
    const canPrepareShipment =
        !['CANCELLED', 'DELIVERY_FAILED'].includes(
            order.fulfillmentStatus ?? order.status,
        ) &&
        !shipmentQuery.isPending &&
        !shipmentQuery.isError &&
        !shipmentQuery.data;
    // Trạng thái giao thành công là mốc kết thúc thao tác vận chuyển của Seller;
    // CTA tiếp theo đưa Seller đến đúng sản phẩm trong Seller Center để xem các review đã được duyệt.
    const isDeliveryFinished =
        order.fulfillmentStatus === 'DELIVERED' ||
        order.fulfillmentStatus === 'COMPLETED' ||
        shipmentQuery.data?.status === 'DELIVERED';
    const reviewProductId = order.items.find((item) => Boolean(item.productId))?.productId;

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
                        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-600">
                            <ReceiptText className="size-4 text-zinc-500" />
                            Thanh toán COD
                        </span>
                    </div>
                </div>

                <OrderLifecycleStepper
                    mode="seller"
                    currentStage={order.fulfillmentStatus}
                    legacyStatus={order.status}
                    createdAt={order.createdAt}
                    cancelledAt={order.cancelledAt}
                    cancelReason={order.cancelReason}
                    shipmentStatus={shipmentQuery.data?.status ?? null}
                    actionSlot={
                        isDeliveryFinished && reviewProductId ? (
                            <Link
                                href={`/seller/products/${reviewProductId}#product-reviews`}
                                className="inline-flex h-9 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20"
                            >
                                <Star className="size-3.5" aria-hidden="true" />
                                Xem đánh giá
                            </Link>
                        ) : canPrepareShipment ? (
                            <SellerShipmentQuickAction orderId={orderId} />
                        ) : null
                    }
                />
            </header>

            <SellerShipmentPanel
                orderId={orderId}
                orderStage={order.fulfillmentStatus ?? order.status}
            />

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
