// File này dựng trang chi tiết đơn hàng Customer, chỉ trình bày snapshot order và điều khiển hủy COD.

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    CalendarDays,
    CircleAlert,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    Store,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
    useCancelCustomerOrder,
    useCustomerOrder,
    useMissingProductImages,
} from '../hooks/use-customer-orders';
import { CancelOrderDialog } from '../components/cancel-order-dialog';
import { CustomerShipmentPanel } from '@/common/shipping';
import { OrderLifecycleStepper } from '@/common/orders';
import { useCustomerTracking } from '@/hooks/shipping/use-shipment';
import type { ShipmentResponse, ShipmentStatus } from '@/services/shipping';
import {
    listOrderReturns,
    type OrderReturnStatus,
    type OrderReturnResponse,
} from '@/services/order';
import { DeliveryConfirmationCard } from './components/delivery-confirmation-card';
import { OrderReviewPanel } from './components/order-review-panel';
import { OrderReturnPanel } from './components/order-return-panel';

// Format tiền snapshot theo locale Việt Nam, không thay đổi giá trị server đã chốt.
function formatMoney(value: string): string {
    return `${Number(value).toLocaleString('vi-VN')} ₫`;
}

// Format thời gian thống nhất cho phần đầu trang, timeline và lịch sử hủy đơn.
function formatDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Ghép các phần địa chỉ có dữ liệu để snapshot cũ thiếu quận/huyện vẫn hiển thị tự nhiên.
function formatShippingAddress(address: Record<string, unknown>): string {
    return [address.street, address.ward, address.district, address.province]
        .map((value) => (typeof value === 'string' ? value : ''))
        .filter((value) => Boolean(value) && value !== 'Không áp dụng')
        .join(', ');
}

// Chọn trạng thái shipment đại diện để đơn nhiều shop vẫn tiến về bước cao nhất đang đạt được.
function getCustomerShipmentStatus(
    statuses: ShipmentStatus[],
): ShipmentStatus | null {
    const statusRank: Record<ShipmentStatus, number> = {
        READY_TO_SHIP: 1,
        PICKUP_ASSIGNED: 2,
        PICKED_UP: 3,
        IN_TRANSIT: 4,
        DELIVERED: 5,
        FAILED: 0,
        CANCELLED: 0,
        RETURNING: 0,
        RETURNED: 0,
    };
    return statuses.reduce<ShipmentStatus | null>((current, status) => {
        if (!current || statusRank[status] > statusRank[current]) return status;
        return current;
    }, null);
}

// Xếp hạng tiến độ hoàn hàng để timeline không bị lùi về bước cũ khi order có nhiều request theo từng shop.
const RETURN_PROGRESS_RANK: Record<OrderReturnResponse['status'], number> = {
    CUSTOMER_CANCELLED: 0,
    REJECTED: 0,
    REQUESTED: 1,
    APPROVED: 2,
    AWAITING_SHIPMENT: 2,
    IN_TRANSIT: 3,
    SHIPMENT_FAILED: 3,
    RECEIVED: 4,
    REFUND_PENDING: 5,
    INSPECTION_FAILED: 5,
};

// Chọn request đang hoạt động có tiến độ cao nhất; nếu cùng bước thì dùng bản cập nhật mới hơn để timeline không bị đứng/lùi.
function getLatestReturnStatus(
    returns: OrderReturnResponse[] | undefined,
): OrderReturnResponse['status'] | null {
    if (!returns?.length) return null;
    const activeReturns = returns.filter(
        (item) => !['REJECTED', 'CUSTOMER_CANCELLED'].includes(item.status),
    );
    const candidates = activeReturns.length > 0 ? activeReturns : returns;
    return candidates.reduce((current, item) => {
        if (!current) return item;
        const itemRank = RETURN_PROGRESS_RANK[item.status];
        const currentRank = RETURN_PROGRESS_RANK[current.status];
        if (itemRank !== currentRank) {
            return itemRank > currentRank ? item : current;
        }
        return item.updatedAt > current.updatedAt ? item : current;
    }).status;
}

// Quy đổi trạng thái vận đơn chiều ngược về trạng thái yêu cầu để timeline dùng cùng một ngôn ngữ tiến độ.
function getReturnStatusFromShipments(
    shipments: ShipmentResponse[] | undefined,
): OrderReturnStatus | null {
    const returnStatusMap: Partial<Record<ShipmentStatus, OrderReturnStatus>> =
        {
            RETURNING: 'IN_TRANSIT',
            RETURNED: 'RECEIVED',
            FAILED: 'SHIPMENT_FAILED',
        };
    return (
        (shipments ?? [])
            .filter((shipment) => shipment.shipmentKind === 'RETURN')
            .reduce<Pick<OrderReturnResponse, 'status' | 'updatedAt'> | null>(
                (current, shipment) => {
                    const status = returnStatusMap[shipment.status];
                    if (!status) return current;
                    const candidate: Pick<
                        OrderReturnResponse,
                        'status' | 'updatedAt'
                    > = {
                        status,
                        updatedAt: shipment.updatedAt,
                    };
                    if (!current) return candidate;
                    const candidateRank =
                        RETURN_PROGRESS_RANK[candidate.status];
                    const currentRank = RETURN_PROGRESS_RANK[current.status];
                    if (candidateRank !== currentRank) {
                        return candidateRank > currentRank
                            ? candidate
                            : current;
                    }
                    return candidate.updatedAt > current.updatedAt
                        ? candidate
                        : current;
                },
                null,
            )?.status ?? null
    );
}

// Đồng bộ request và vận đơn hoàn, tránh timeline hiển thị bước cũ khi hai API cập nhật lệch thời điểm.
function getCustomerReturnStatus(
    returns: OrderReturnResponse[] | undefined,
    shipments: ShipmentResponse[] | undefined,
): OrderReturnStatus | null {
    const requestStatus = getLatestReturnStatus(returns);
    const shipmentStatus = getReturnStatusFromShipments(shipments);
    if (!requestStatus) return shipmentStatus;
    if (!shipmentStatus) return requestStatus;
    return RETURN_PROGRESS_RANK[shipmentStatus] >
        RETURN_PROGRESS_RANK[requestStatus]
        ? shipmentStatus
        : requestStatus;
}

// Trang chi tiết ưu tiên tiến trình, tiếp đến là sản phẩm/chi phí đơn hàng rồi mới đến vận chuyển và hỗ trợ.
// Order vẫn được tải theo id trên URL; bố cục mới không đổi quyền hay hành vi của các thao tác hiện có.
export default function ProfileOrderDetailPage() {
    const params = useParams<{ orderId: string }>();
    const orderId = params.orderId;
    const orderQuery = useCustomerOrder(orderId);
    const cancelMutation = useCancelCustomerOrder(orderId);
    const trackingStage =
        orderQuery.data?.fulfillmentStatus ?? orderQuery.data?.status;
    const trackingEnabled =
        Boolean(orderQuery.data) &&
        !['CANCELLED', 'DELIVERY_FAILED'].includes(trackingStage ?? '');
    const trackingQuery = useCustomerTracking(orderId, trackingEnabled);
    const returnsQuery = useQuery({
        queryKey: ['order-returns', orderId],
        queryFn: () => listOrderReturns(orderId),
        staleTime: 15_000,
        refetchOnMount: 'always',
    });
    const legacyItemImages = useMissingProductImages(
        orderQuery.data?.items ?? [],
    );

    if (orderQuery.isPending) return <OrderDetailSkeleton />;

    if (orderQuery.isError || !orderQuery.data) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
                <CircleAlert
                    className="mx-auto size-10 text-red-500"
                    aria-hidden="true"
                />
                <h1 className="mt-4 text-xl font-bold text-zinc-950">
                    Không thể tải đơn hàng
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Đơn hàng không tồn tại hoặc không thuộc tài khoản của bạn.
                </p>
                <Link
                    href="/profile/orders"
                    className="mt-6 inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                    Quay lại đơn hàng
                </Link>
            </div>
        );
    }

    const order = orderQuery.data;
    const customerReturnStatus = getCustomerReturnStatus(
        returnsQuery.data,
        trackingQuery.data?.shipments,
    );
    const shipmentStatus = getCustomerShipmentStatus(
        trackingQuery.data?.shipments.map((shipment) => shipment.status) ?? [],
    );
    // Customer chỉ được hủy khi đơn còn ở bước shop xử lý; sau khi bàn giao vận chuyển, UI không gợi ý thao tác trái nghiệp vụ.
    const canCancel =
        order.status === 'CONFIRMED' &&
        (!order.fulfillmentStatus || order.fulfillmentStatus === 'TO_SHIP');

    return (
        <div className="min-h-full bg-zinc-50/60">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-0">
                <div>
                    <Link
                        href="/profile/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Quay lại đơn hàng
                    </Link>
                </div>

                <header className="mt-5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                        <div className="min-w-0">
                            <h1 className="break-all text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">
                                Đơn hàng #{order.orderNumber}
                            </h1>
                            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                                <CalendarDays
                                    className="size-3.5 shrink-0"
                                    aria-hidden="true"
                                />
                                Đặt ngày {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                            {canCancel ? (
                                <CancelOrderDialog
                                    loading={cancelMutation.isPending}
                                    onConfirm={async (reason) => {
                                        await cancelMutation.mutateAsync(reason);
                                    }}
                                />
                            ) : null}
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                                <ReceiptText
                                    className="size-3.5 text-zinc-500"
                                    aria-hidden="true"
                                />
                                Thanh toán COD
                            </span>
                        </div>
                    </div>
                    <OrderLifecycleStepper
                        mode="customer"
                        currentStage={order.fulfillmentStatus}
                        legacyStatus={order.status}
                        cancelledAt={order.cancelledAt}
                        cancelReason={order.cancelReason}
                        shipmentStatus={shipmentStatus}
                        returnStatus={customerReturnStatus}
                    />
                </header>

                <div className="mt-5">
                    <DeliveryConfirmationCard order={order} />
                </div>

                <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                <Store className="size-4" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-zinc-950">
                                    Sản phẩm đã đặt
                                </h2>
                                <p className="text-xs text-zinc-500">
                                    Sản phẩm, thanh toán và thông tin nhận hàng
                                </p>
                            </div>
                        </div>
                        <span className="shrink-0 text-xs text-zinc-400">
                            {order.items.length} mặt hàng
                        </span>
                    </div>

                    <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.75fr)_minmax(250px,0.9fr)]">
                        <div className="divide-y divide-zinc-100 px-4 sm:px-5 lg:border-r lg:border-zinc-100">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3 py-4 first:pt-4 sm:gap-4"
                                >
                                    <Link
                                        href={`/products/${item.productId}`}
                                        aria-label={`Xem ${item.productName}`}
                                        className="block size-20 shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 sm:size-24"
                                    >
                                        <div className="size-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 transition-colors hover:border-zinc-400">
                                            {item.imageUrl ||
                                            legacyItemImages.get(
                                                item.productId,
                                            ) ? (
                                                <img
                                                    src={
                                                        item.imageUrl ??
                                                        legacyItemImages.get(
                                                            item.productId,
                                                        ) ??
                                                        undefined
                                                    }
                                                    alt={item.productName}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-zinc-400">
                                                    <Package
                                                        className="size-7"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/products/${item.productId}`}
                                            className="block text-sm font-semibold leading-5 text-zinc-950 underline-offset-4 hover:text-zinc-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                                        >
                                            {item.productName}
                                        </Link>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {item.variantName !== item.productName
                                                ? item.variantName
                                                : 'Sản phẩm tiêu chuẩn'}
                                        </p>
                                        <p className="mt-1.5 text-xs text-zinc-500">
                                            {formatMoney(item.unitPrice)} ×{' '}
                                            {item.quantity}
                                        </p>
                                    </div>
                                    <p className="shrink-0 pt-0.5 text-right text-sm font-semibold text-zinc-950">
                                        {formatMoney(item.lineTotal)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-y border-zinc-100 px-4 py-4 sm:px-5 lg:border-y-0 lg:border-r lg:border-zinc-100 lg:py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                    <ReceiptText
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h2 className="font-semibold text-zinc-950">
                                    Tổng thanh toán
                                </h2>
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between gap-3 text-zinc-500">
                                    <span>Tạm tính</span>
                                    <span className="shrink-0 tabular-nums">
                                        {formatMoney(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3 text-zinc-500">
                                    <span>Phí vận chuyển</span>
                                    <span className="shrink-0 tabular-nums">
                                        {Number(order.shippingFee) === 0
                                            ? 'Miễn phí'
                                            : formatMoney(order.shippingFee)}
                                    </span>
                                </div>
                                <div className="border-t border-zinc-100 pt-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-semibold text-zinc-950">
                                            Thành tiền
                                        </span>
                                        <span className="shrink-0 text-lg font-bold tabular-nums text-zinc-950">
                                            {formatMoney(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
                                    <span className="text-zinc-500">
                                        Phương thức
                                    </span>
                                    <span className="font-semibold text-zinc-900">
                                        COD
                                    </span>
                                </div>
                            </div>
                            {order.cancelledAt ? (
                                <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                                    <p className="font-semibold text-zinc-950">
                                        Đơn hàng đã hủy
                                    </p>
                                    <p className="mt-1">
                                        Đã hủy lúc{' '}
                                        {formatDate(order.cancelledAt)}
                                    </p>
                                    <div className="mt-2 border-t border-zinc-200 pt-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                            Lý do hủy đơn hàng
                                        </p>
                                        <p className="mt-1 text-sm leading-5 text-zinc-700">
                                            {order.cancelReason?.trim() ||
                                                'Chưa có lý do hủy được cung cấp.'}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="px-4 py-4 sm:px-5 lg:py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                    <MapPin
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-zinc-950">
                                        Địa chỉ nhận hàng
                                    </h2>
                                    <p className="text-xs text-zinc-500">
                                        Thông tin tại thời điểm đặt hàng
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 rounded-xl bg-zinc-50 p-3.5">
                                <p className="font-semibold text-zinc-950">
                                    {order.shippingAddress.fullName}
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                                    <Phone
                                        className="size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    {order.shippingAddress.phone}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-zinc-600">
                                    {formatShippingAddress(
                                        order.shippingAddress,
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-5">
                    <CustomerShipmentPanel
                        orderId={orderId}
                        orderStage={order.fulfillmentStatus ?? order.status}
                    />
                </div>

                <div className="mt-5 space-y-5">
                    <OrderReviewPanel order={order} />
                    <OrderReturnPanel order={order} />
                </div>
            </div>
        </div>
    );
}

// Skeleton giữ đúng nhịp bố cục mới để lúc refresh không xuất hiện khoảng trống hoặc layout nhảy mạnh.
function OrderDetailSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-0">
            <Skeleton className="h-5 w-36" />
            <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-6">
                <Skeleton className="h-9 w-72" />
                <Skeleton className="mt-3 h-5 w-48" />
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Skeleton className="h-[360px] rounded-3xl" />
                <Skeleton className="h-72 rounded-3xl" />
            </div>
        </div>
    );
}
