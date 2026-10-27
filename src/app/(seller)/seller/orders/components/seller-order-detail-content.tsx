// Nội dung detail Seller làm nổi bật trạng thái và thao tác xử lý; sản phẩm, doanh thu và người nhận được tách thành ba card có header đồng nhất.

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    CalendarDays,
    CircleAlert,
    MapPin,
    MessageSquareText,
    Package,
    Phone,
    ReceiptText,
    RotateCcw,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useOrderProductImages } from '@/hooks/orders/use-order-product-images';
import { useSellerShipment } from '@/hooks/shipping/use-shipment';
import { OrderLifecycleStepper } from '@/common/orders';
import { useSellerOrderDetail } from '../hooks/use-seller-order-detail';
import { SellerOrderProductImage } from './seller-order-product-image';
import { SellerOrderDetailSectionNav } from './seller-order-detail-section-nav';
import { SellerShipmentPanel } from '@/common/shipping/components/seller-shipment-panel';
import { SellerShipmentQuickAction } from '@/common/shipping/components/seller-shipment-quick-action';
import {
    formatSellerMoney,
    formatSellerOrderDate,
} from '../utils/seller-order-format';
import { listSellerReturns } from '@/services/order';

interface SellerOrderDetailContentProps {
    orderId: string;
}

// Ghép snapshot địa chỉ theo thứ tự tự nhiên và bỏ các field placeholder khỏi chuỗi hiển thị.
function formatShippingAddress(address: Record<string, string>): string {
    return [address.street, address.ward, address.district, address.province]
        .filter((value) => Boolean(value) && value !== 'Không áp dụng')
        .join(', ');
}

// Trình bày ba khu vực chi tiết Seller với kiểu chữ và khoảng cách gọn để dễ quét mà không đổi dữ liệu đơn.
export function SellerOrderDetailContent({
    orderId,
}: SellerOrderDetailContentProps) {
    const orderQuery = useSellerOrderDetail(orderId);
    const legacyImages = useOrderProductImages(orderQuery.data?.items ?? []);
    const shipmentQuery = useSellerShipment(orderId);
    const returnsQuery = useQuery({
        queryKey: ['seller-returns'],
        queryFn: () => listSellerReturns(),
        enabled: Boolean(orderQuery.data),
        staleTime: 15_000,
        refetchOnMount: 'always',
    });

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
                    Đơn hàng không tồn tại, không thuộc shop hoặc Seller Service
                    đang tạm thời không sẵn sàng.
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
    // Chỉ coi yêu cầu có orderId trùng khớp là nội dung thuộc card của đơn hiện tại;
    // khi danh sách đang tải hoặc lỗi, ẩn cả lối tắt lẫn card để không tạo điểm đến giả.
    const orderReturns = (returnsQuery.data ?? []).filter(
        (returnRequest) => returnRequest.orderId === order.id,
    );
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
    // Chỉ có vận đơn thực tế mới tạo card tracking và mục lục tương ứng; trạng thái đang tải hoặc 404 đều không phải vận chuyển đã khởi tạo.
    const hasShipment = Boolean(shipmentQuery.data);
    // Tóm tắt phương thức và trạng thái để Seller nhận biết thanh toán ngay trên mục lục.
    const paymentLabel =
        order.paymentMethod === 'PAY2S'
            ? order.paymentStatus === 'PAID'
                ? 'Đã thanh toán'
                : 'Chờ thanh toán'
            : 'COD';
    const reviewProductId = order.items.find((item) =>
        Boolean(item.productId),
    )?.productId;

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
            </div>

            <SellerOrderDetailSectionNav
                itemCount={order.items.length}
                paymentLabel={paymentLabel}
                showShipment={hasShipment}
                showReview={isDeliveryFinished && Boolean(reviewProductId)}
                showReturns={orderReturns.length > 0}
            />

            <header
                id="order-progress"
                className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                    <div className="min-w-0">
                        <h1 className="break-all text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">
                            Đơn hàng #{order.orderNumber}
                        </h1>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                            <CalendarDays className="size-3.5 shrink-0" />
                            Đặt ngày {formatSellerOrderDate(order.createdAt)}
                        </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                        <ReceiptText className="size-3.5 text-zinc-500" />
                        {order.paymentMethod === 'PAY2S'
                            ? order.paymentStatus === 'PAID'
                                ? order.isSandbox
                                    ? 'Pay2S Sandbox · Đã thanh toán'
                                    : 'Pay2S · Đã thanh toán'
                                : 'Pay2S · Chờ thanh toán'
                            : 'Thanh toán COD'}
                    </span>
                </div>

                <OrderLifecycleStepper
                    mode="seller"
                    currentStage={order.fulfillmentStatus}
                    legacyStatus={order.status}
                    cancelledAt={order.cancelledAt}
                    cancelReason={order.cancelReason}
                    shipmentStatus={shipmentQuery.data?.status ?? null}
                    actionSlot={
                        isDeliveryFinished && reviewProductId ? (
                            <Link
                                id="order-review"
                                href={`/seller/products/${reviewProductId}#product-reviews`}
                                className="scroll-mt-24 inline-flex h-9 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20"
                            >
                                <MessageSquareText
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                Xem đánh giá
                            </Link>
                        ) : canPrepareShipment ? (
                            <SellerShipmentQuickAction orderId={orderId} />
                        ) : null
                    }
                />
            </header>

            <section
                id="order-products"
                aria-label="Chi tiết sản phẩm, doanh thu và địa chỉ đơn hàng"
                className="scroll-mt-24"
            >
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(245px,0.75fr)_minmax(260px,0.82fr)]">
                    <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 xl:col-span-1">
                        <div className="flex min-h-[76px] items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 sm:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                    <Package className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-[13px] font-semibold text-zinc-950">
                                        Danh sách sản phẩm
                                    </h2>
                                    <p className="mt-0.5 text-[11px] text-zinc-500">
                                        Snapshot tại thời điểm đặt hàng
                                    </p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                                {order.items.length} mặt hàng
                            </span>
                        </div>
                        <div className="divide-y divide-zinc-100 px-4 sm:px-5">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3 py-3 first:pt-4 sm:gap-4"
                                >
                                    <SellerOrderProductImage
                                        src={
                                            item.imageUrl ??
                                            legacyImages.get(item.productId) ??
                                            null
                                        }
                                        alt={item.productName}
                                        large
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold leading-5 text-zinc-950">
                                                    {item.productName}
                                                </h3>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {item.variantName}
                                                </p>
                                                <p className="mt-1.5 text-xs text-zinc-500">
                                                    {formatSellerMoney(
                                                        item.unitPrice,
                                                    )}{' '}
                                                    × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-bold tabular-nums text-zinc-950">
                                                {formatSellerMoney(
                                                    item.lineTotal,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        id="order-payment"
                        className="scroll-mt-24 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                    >
                        <div className="flex min-h-[76px] items-center gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 sm:px-5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <ReceiptText className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-[13px] font-semibold text-zinc-950">
                                    Tổng tiền shop
                                </h2>
                                <p className="mt-0.5 text-[11px] text-zinc-500">
                                    Chi tiết doanh thu đơn hàng
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 p-4 text-xs sm:p-5">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">
                                    Tạm tính sản phẩm
                                </span>
                                <span className="font-medium tabular-nums text-zinc-950">
                                    {formatSellerMoney(order.shopItemTotal)}
                                </span>
                            </div>
                            <div className="rounded-xl bg-zinc-950 px-3.5 py-3 text-white">
                                <div className="flex flex-col items-start gap-1.5">
                                    <span className="text-xs font-medium text-zinc-300">
                                        Doanh thu shop
                                    </span>
                                    <span className="text-lg font-extrabold tracking-tight tabular-nums">
                                        {formatSellerMoney(order.shopItemTotal)}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] leading-5 text-zinc-500">
                                Số tiền trên chỉ bao gồm các sản phẩm thuộc shop
                                của bạn.
                            </div>
                        </div>
                    </section>

                    <section
                        id="order-address"
                        className="scroll-mt-24 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                    >
                        <div className="flex min-h-[76px] items-center gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 sm:px-5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <MapPin className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-[13px] font-semibold text-zinc-950">
                                    Địa chỉ nhận hàng
                                </h2>
                                <p className="mt-0.5 text-[11px] text-zinc-500">
                                    Snapshot tại thời điểm đặt hàng
                                </p>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3.5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Người nhận
                                </p>
                                <p className="mt-1 text-sm font-semibold text-zinc-950">
                                    {address.fullName ||
                                        'Chưa có tên người nhận'}
                                </p>
                                <div className="my-3 border-t border-zinc-200" />
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Số điện thoại
                                </p>
                                <p className="mt-1 flex items-center gap-2 text-xs text-zinc-700">
                                    <Phone className="size-4 shrink-0 text-zinc-500" />
                                    {address.phone || 'Chưa có số điện thoại'}
                                </p>
                                <div className="my-3 border-t border-zinc-200" />
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Địa chỉ giao hàng
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-700">
                                    {formatShippingAddress(address)}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </section>

            {hasShipment && (
                <div id="order-shipment" className="scroll-mt-24">
                    <SellerShipmentPanel
                        orderId={orderId}
                        orderStage={order.fulfillmentStatus ?? order.status}
                    />
                </div>
            )}

            {orderReturns.length > 0 && (
                <section
                    id="order-returns"
                    className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <RotateCcw
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </div>
                            <div>
                                <h2 className="font-semibold text-zinc-950">
                                    Đổi trả / hoàn tiền
                                </h2>
                                <p className="text-xs text-zinc-500">
                                    Đơn này có {orderReturns.length} yêu cầu đổi
                                    trả.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/seller/returns"
                            className="inline-flex h-9 items-center rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20"
                        >
                            Xem yêu cầu
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
}
