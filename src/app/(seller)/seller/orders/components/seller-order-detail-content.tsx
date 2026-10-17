// Nội dung detail Seller làm nổi bật trạng thái và thao tác xử lý; sản phẩm, doanh thu và người nhận nằm chung một card.

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

// Trình bày chi tiết Seller; thẻ doanh thu xếp dọc để nhãn và số tiền không vỡ dòng trong cột hẹp.
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
        order.paymentMethod === 'VNPAY'
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
                        {order.paymentMethod === 'VNPAY'
                            ? order.paymentStatus === 'PAID'
                                ? order.isSandbox
                                    ? 'VNPay Sandbox · Đã thanh toán'
                                    : 'VNPay · Đã thanh toán'
                                : 'VNPay · Chờ thanh toán'
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
                className="scroll-mt-24 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                            <Package className="size-4" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-zinc-950">
                                Sản phẩm của shop
                            </h2>
                            <p className="text-xs text-zinc-500">
                                Sản phẩm, doanh thu và thông tin nhận hàng
                            </p>
                        </div>
                    </div>
                    <span className="text-xs text-zinc-400">
                        {order.items.length} mặt hàng
                    </span>
                </div>

                <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.75fr)_minmax(250px,0.9fr)]">
                    <div className="divide-y divide-zinc-100 px-5 sm:px-6 lg:border-r lg:border-zinc-100">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 py-4 first:pt-5 last:pb-5 sm:gap-5"
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
                                            <h3 className="font-semibold text-zinc-950">
                                                {item.productName}
                                            </h3>
                                            <p className="mt-1 text-sm text-zinc-500">
                                                {item.variantName}
                                            </p>
                                            <p className="mt-2 text-sm text-zinc-500">
                                                {formatSellerMoney(
                                                    item.unitPrice,
                                                )}{' '}
                                                × {item.quantity}
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

                    <div
                        id="order-payment"
                        className="scroll-mt-24 border-b border-zinc-100 px-5 py-5 sm:px-6 lg:border-b-0 lg:border-r lg:py-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <ReceiptText className="size-4" />
                            </div>
                            <h2 className="font-semibold text-zinc-950">
                                Tổng tiền shop
                            </h2>
                        </div>
                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">
                                    Tạm tính sản phẩm
                                </span>
                                <span className="font-medium tabular-nums text-zinc-950">
                                    {formatSellerMoney(order.shopItemTotal)}
                                </span>
                            </div>
                            <div className="border-t border-zinc-100 pt-4">
                                <div className="flex w-full flex-col items-start gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                                    <span className="whitespace-nowrap text-sm font-semibold text-slate-700">
                                        Doanh thu shop
                                    </span>
                                    <span className="whitespace-nowrap text-xl font-extrabold tracking-tight tabular-nums text-slate-950">
                                        {formatSellerMoney(order.shopItemTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl bg-zinc-50 px-3 py-2.5 text-xs leading-5 text-zinc-500">
                            Số tiền trên chỉ bao gồm các sản phẩm thuộc shop của
                            bạn.
                        </div>
                    </div>

                    <div
                        id="order-address"
                        className="scroll-mt-24 px-5 py-5 sm:px-6 lg:py-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <MapPin className="size-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-zinc-950">
                                    Địa chỉ nhận hàng
                                </h2>
                                <p className="text-xs text-zinc-500">
                                    Snapshot tại thời điểm đặt hàng
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                            <p className="font-semibold text-zinc-950">
                                {address.fullName || 'Chưa có tên người nhận'}
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                                <Phone className="size-4 shrink-0" />
                                {address.phone || 'Chưa có số điện thoại'}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-zinc-600">
                                {formatShippingAddress(address)}
                            </p>
                        </div>
                    </div>
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
                                    Đơn này có {orderReturns.length} yêu cầu đổi trả.
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
