// File này dựng trang chi tiết đơn hàng Customer, trình bày snapshot order và thao tác theo trạng thái hợp lệ.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    CircleAlert,
    MapPin,
    Package,
    PackageCheck,
    Phone,
    ReceiptText,
    Star,
    Store,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useCancelCustomerOrder,
    useCustomerOrder,
    useMissingProductImages,
    useUpdateCustomerCancellation,
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
import { OrderDetailSectionNav } from './components/order-detail-section-nav';
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
    REFUND_FAILED: 5,
    REFUNDED: 6,
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

// Chỉ xét vận đơn hoàn; IN_TRANSIT/RETURNING cùng là kiện đang đi về shop, RETURNED là shop đã nhận và FAILED là lỗi.
// Trạng thái carrier chưa ánh xạ không đẩy timeline tiến; nếu có nhiều vận đơn thì giữ rank cao nhất, đồng hạng lấy bản mới hơn.
function getReturnStatusFromShipments(
    shipments: ShipmentResponse[] | undefined,
): OrderReturnStatus | null {
    const returnStatusMap: Partial<Record<ShipmentStatus, OrderReturnStatus>> =
        {
            IN_TRANSIT: 'IN_TRANSIT',
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

// Trang chi tiết đơn cho Customer theo dõi hoàn tiền, xem xác nhận đã chuyển và sửa yêu cầu khi khoản hoàn còn chờ.
// Trạng thái hoàn lấy từ payment snapshot hoặc return đã chốt; số tiền hiển thị đúng nguồn đã hoàn gần nhất.
// Bố cục co từ một cột sang hai rồi ba cột để thông tin vẫn dễ quét ở màn hình nhỏ.
// Phương thức ở phần thanh toán chỉ nêu Pay2S/COD, tránh lặp trạng thái đã hiển thị trên đầu trang.
export default function ProfileOrderDetailPage() {
    const [reviewPromptOpen, setReviewPromptOpen] = useState(false);
    const params = useParams<{ orderId: string }>();
    const orderId = params.orderId;
    const orderQuery = useCustomerOrder(orderId);
    const cancelMutation = useCancelCustomerOrder(orderId);
    const updateCancellationMutation = useUpdateCustomerCancellation(orderId);
    const trackingStage =
        orderQuery.data?.fulfillmentStatus ?? orderQuery.data?.status;
    const trackingEnabled =
        Boolean(orderQuery.data) &&
        !['CANCELLED', 'DELIVERY_FAILED'].includes(trackingStage ?? '');
    const trackingQuery = useCustomerTracking(orderId, trackingEnabled);
    const hasDeliveredShipment =
        trackingQuery.data?.shipments.some(
            (shipment) =>
                shipment.shipmentKind !== 'RETURN' &&
                shipment.status === 'DELIVERED',
        ) ?? false;
    const returnsQuery = useQuery({
        queryKey: ['order-returns', orderId],
        queryFn: () => listOrderReturns(orderId),
        staleTime: 15_000,
        refetchOnMount: 'always',
        refetchInterval: (query) => {
            // Return đang chờ hoặc cần thử lại vẫn được theo dõi; dừng nền khi mọi khoản hoàn đã có kết quả.
            return query.state.data?.some((item) =>
                ['REFUND_PENDING', 'REFUND_FAILED'].includes(item.status),
            )
                ? 15_000
                : false;
        },
    });
    const legacyItemImages = useMissingProductImages(
        orderQuery.data?.items ?? [],
    );
    const orderIdFromQuery = orderQuery.data?.id;
    const orderFulfillmentStatus = orderQuery.data?.fulfillmentStatus;
    const deliveryConfirmationStatus =
        orderQuery.data?.deliveryConfirmation?.status;
    const refetchOrder = orderQuery.refetch;

    // Shipping có thể báo giao trước khi event Kafka cập nhật Order Service.
    // Chỉ poll khi vận đơn giao đi thành công nhưng snapshot order chưa ở trạng thái cuối.
    useEffect(() => {
        const orderIsResolved =
            [
                'COMPLETED',
                'RETURN_REFUND',
                'CANCELLED',
                'DELIVERY_FAILED',
            ].includes(orderFulfillmentStatus ?? '') ||
            ['CONFIRMED', 'AUTO_CONFIRMED', 'ISSUE_REPORTED'].includes(
                deliveryConfirmationStatus ?? '',
            );

        if (
            !hasDeliveredShipment ||
            !orderIdFromQuery ||
            orderFulfillmentStatus === 'DELIVERED' ||
            orderIsResolved
        ) {
            return;
        }

        // Refetch ngay, rồi chờ Kafka đồng bộ bằng nhịp thưa để tránh request nền dày.
        void refetchOrder();
        const intervalId = window.setInterval(() => {
            void refetchOrder();
        }, 5_000);

        return () => window.clearInterval(intervalId);
    }, [
        hasDeliveredShipment,
        orderIdFromQuery,
        orderFulfillmentStatus,
        deliveryConfirmationStatus,
        refetchOrder,
    ]);

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
    const latestCompletedReturn = returnsQuery.data
        ?.filter((item) => item.status === 'REFUNDED')
        .sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
        )[0];
    const isRefundCompleted =
        order.paymentStatus === 'REFUNDED' || Boolean(latestCompletedReturn);
    const completedRefundAmount =
        order.paymentStatus === 'REFUNDED'
            ? order.totalAmount
            : latestCompletedReturn?.refundAmount;
    const shipmentStatus = getCustomerShipmentStatus(
        trackingQuery.data?.shipments.map((shipment) => shipment.status) ?? [],
    );
    // Customer chỉ được hủy khi đơn còn ở bước shop xử lý; sau khi bàn giao vận chuyển, UI không gợi ý thao tác trái nghiệp vụ.
    const canCancel =
        order.status === 'CONFIRMED' &&
        (!order.fulfillmentStatus || order.fulfillmentStatus === 'TO_SHIP');
    // Chỉ yêu cầu thông tin nhận hoàn khi Pay2S đã xác nhận thu tiền; đơn COD hoặc chưa thanh toán không cần nhập.
    const requiresRefundBankAccount =
        order.paymentMethod === 'PAY2S' && order.paymentStatus === 'PAID';
    const canEditCancellation =
        order.status === 'CANCELLED' && order.paymentStatus !== 'REFUNDED';
    const requiresRefundBankAccountForEdit =
        order.paymentMethod === 'PAY2S' &&
        (order.paymentStatus === 'PAID' ||
            order.paymentStatus === 'REFUND_PENDING');
    // Chỉ hiện lối tắt xác nhận khi card nghiệp vụ có thể xuất hiện cho đơn vừa được giao.
    const showDeliveryConfirmation =
        order.fulfillmentStatus === 'DELIVERED' &&
        (!order.deliveryConfirmation?.status ||
            order.deliveryConfirmation.status === 'PENDING');
    // Chỉ mở mục review sau khi khách xác nhận hoàn tất; đơn còn ở DELIVERED chưa đủ điều kiện.
    const showReview =
        order.fulfillmentStatus === 'COMPLETED' &&
        order.deliveryConfirmation.status !== 'ISSUE_REPORTED';
    const paymentLabel =
        order.paymentStatus === 'REFUNDED'
            ? 'Đã hoàn tiền'
            : order.paymentStatus === 'REFUND_PENDING'
              ? 'Đang hoàn tiền'
              : order.paymentMethod === 'PAY2S'
                ? order.paymentStatus === 'PAID'
                    ? 'Đã thanh toán'
                    : 'Chờ xác nhận'
                : 'COD';
    const paymentStatusLabel =
        order.paymentStatus === 'REFUNDED'
            ? `${order.paymentMethod === 'PAY2S' ? 'Pay2S' : 'COD'} · Đã hoàn tiền`
            : order.paymentStatus === 'REFUND_PENDING'
              ? `${order.paymentMethod === 'PAY2S' ? 'Pay2S' : 'COD'} · Đang hoàn tiền`
              : order.paymentMethod === 'PAY2S'
                ? order.paymentStatus === 'PAID'
                    ? 'Pay2S'
                    : 'Pay2S · Chờ xác nhận'
                : 'COD';
    // Chỉ thêm lối tắt hoàn hàng khi card thật sự có thể xuất hiện hoặc đang có yêu cầu cần theo dõi.
    const showReturns =
        (returnsQuery.data?.length ?? 0) > 0 ||
        (order.fulfillmentStatus === 'COMPLETED' &&
            order.deliveryConfirmation.status !== 'ISSUE_REPORTED');

    // Đóng popup trước khi cuộn; delay ngắn để Dialog nhả focus trap và khóa cuộn nền.
    function handleReviewNow(): void {
        setReviewPromptOpen(false);
        window.setTimeout(() => {
            document
                .getElementById('order-review')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }

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

                <OrderDetailSectionNav
                    itemCount={order.items.length}
                    paymentLabel={paymentLabel}
                    showDeliveryConfirmation={showDeliveryConfirmation}
                    showReview={showReview}
                    showReturns={showReturns}
                />

                <header
                    id="order-progress"
                    className="mt-5 scroll-mt-20 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                        <div className="min-w-0">
                            <h1 className="break-all text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">
                                Đơn hàng
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
                                    requiresRefundBankAccount={
                                        requiresRefundBankAccount
                                    }
                                    onConfirm={async (input) => {
                                        await cancelMutation.mutateAsync(input);
                                    }}
                                />
                            ) : null}
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                                <ReceiptText
                                    className="size-3.5 text-zinc-500"
                                    aria-hidden="true"
                                />
                                {order.paymentMethod === 'PAY2S'
                                    ? 'Pay2S'
                                    : 'Thanh toán COD'}
                            </span>
                        </div>
                    </div>
                    <OrderLifecycleStepper
                        mode="customer"
                        currentStage={order.fulfillmentStatus}
                        legacyStatus={order.status}
                        cancelledAt={order.cancelledAt}
                        cancelReason={order.cancelReason}
                        cancelRefundBankAccount={order.refundBankAccount}
                        cancelActionSlot={
                            canEditCancellation ? (
                                <CancelOrderDialog
                                    loading={
                                        updateCancellationMutation.isPending
                                    }
                                    mode="edit"
                                    initialReason={order.cancelReason}
                                    initialRefundBankAccount={
                                        order.refundBankAccount
                                    }
                                    requiresRefundBankAccount={
                                        requiresRefundBankAccountForEdit
                                    }
                                    onConfirm={async (input) => {
                                        await updateCancellationMutation.mutateAsync(
                                            input,
                                        );
                                    }}
                                />
                            ) : undefined
                        }
                        shipmentStatus={shipmentStatus}
                        returnStatus={customerReturnStatus}
                    />
                    {isRefundCompleted ? (
                        <section
                            role="status"
                            aria-live="polite"
                            className="mt-4 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-teal-50 shadow-sm"
                        >
                            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-900/10">
                                        <BadgeCheck
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-sm font-bold text-emerald-950 sm:text-base">
                                                {order.paymentStatus ===
                                                'REFUNDED'
                                                    ? 'Đã hoàn tiền'
                                                    : 'Khoản hoàn đã hoàn tất'}
                                            </h2>
                                            <span className="rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                                                Đã xác nhận hoàn
                                            </span>
                                        </div>
                                        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-emerald-900/80 sm:text-sm">
                                            Khoản tiền hoàn đã được xác nhận
                                            chuyển khoản. Vui lòng kiểm tra tài
                                            khoản ngân hàng nhận hoàn đã đăng
                                            ký.
                                        </p>
                                        <p className="mt-1 text-xs font-medium text-emerald-800/70">
                                            Đơn hàng #{order.orderNumber}
                                        </p>
                                    </div>
                                </div>
                                {completedRefundAmount ? (
                                    <div className="shrink-0 rounded-xl border border-emerald-200/80 bg-white/80 px-4 py-3 sm:min-w-40 sm:text-right">
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800/70">
                                            Số tiền hoàn
                                        </p>
                                        <p className="mt-1 text-lg font-bold tabular-nums text-emerald-900">
                                            {formatMoney(completedRefundAmount)}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </section>
                    ) : null}
                </header>

                <div
                    id="order-delivery-confirmation"
                    className="mt-5 scroll-mt-20"
                >
                    <DeliveryConfirmationCard
                        order={order}
                        onOrderCompleted={() => setReviewPromptOpen(true)}
                    />
                </div>

                <section
                    id="order-products"
                    aria-label="Chi tiết sản phẩm, thanh toán và địa chỉ đơn hàng"
                    className="mt-5 scroll-mt-20"
                >
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(245px,0.75fr)_minmax(260px,0.82fr)]">
                        <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-2 xl:col-span-1">
                            <div className="flex min-h-[76px] items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 sm:px-5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                        <Store
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold text-zinc-950">
                                            Danh sách sản phẩm
                                        </h2>
                                        <p className="mt-0.5 text-xs text-zinc-500">
                                            Snapshot tại thời điểm đặt hàng
                                        </p>
                                    </div>
                                </div>
                                <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600">
                                    {order.items.length} mặt hàng
                                </span>
                            </div>
                            <div className="divide-y divide-zinc-100 px-4 sm:px-5">
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
                                                {item.variantName !==
                                                item.productName
                                                    ? item.variantName
                                                    : 'Sản phẩm tiêu chuẩn'}
                                            </p>
                                            <p className="mt-1.5 text-xs text-zinc-500">
                                                {formatMoney(item.unitPrice)} ×{' '}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="shrink-0 rounded-lg bg-zinc-50 px-2.5 py-1 text-right text-sm font-semibold tabular-nums text-zinc-950">
                                            {formatMoney(item.lineTotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section
                            id="order-payment"
                            className="scroll-mt-20 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                        >
                            <div className="flex min-h-[76px] items-center gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 sm:px-5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                    <ReceiptText
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-950">
                                        Tổng thanh toán
                                    </h2>
                                    <p className="mt-0.5 text-xs text-zinc-500">
                                        Chi tiết các khoản của đơn hàng
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-4 text-sm sm:p-5">
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
                                <div className="rounded-xl bg-zinc-950 px-3.5 py-3 text-white">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm font-medium text-zinc-300">
                                            Thành tiền
                                        </span>
                                        <span className="shrink-0 text-lg font-bold tabular-nums">
                                            {formatMoney(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                        Thanh toán
                                    </span>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm">
                                        {paymentStatusLabel}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section
                            id="order-address"
                            className="scroll-mt-20 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                        >
                            <div className="flex min-h-[76px] items-center gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 sm:px-5">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                    <MapPin
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-950">
                                        Địa chỉ nhận hàng
                                    </h2>
                                    <p className="mt-0.5 text-xs text-zinc-500">
                                        Thông tin tại thời điểm đặt hàng
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                        Người nhận
                                    </p>
                                    <p className="mt-1.5 font-semibold text-zinc-950">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <div className="my-3 border-t border-zinc-200" />
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                        Số điện thoại
                                    </p>
                                    <p className="mt-1.5 flex items-center gap-2 text-sm text-zinc-700">
                                        <Phone
                                            className="size-4 shrink-0 text-zinc-500"
                                            aria-hidden="true"
                                        />
                                        {order.shippingAddress.phone}
                                    </p>
                                    <div className="my-3 border-t border-zinc-200" />
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                        Địa chỉ giao hàng
                                    </p>
                                    <p className="mt-1.5 text-sm leading-6 text-zinc-700">
                                        {formatShippingAddress(
                                            order.shippingAddress,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>

                <div id="order-shipment" className="mt-5 scroll-mt-20">
                    <CustomerShipmentPanel
                        orderId={orderId}
                        orderStage={order.fulfillmentStatus ?? order.status}
                    />
                </div>

                <div className="mt-5 space-y-5">
                    <div id="order-review" className="scroll-mt-20">
                        <OrderReviewPanel order={order} />
                    </div>
                    <div id="order-returns" className="scroll-mt-20">
                        <OrderReturnPanel order={order} />
                    </div>
                </div>
            </div>
            <Dialog open={reviewPromptOpen} onOpenChange={setReviewPromptOpen}>
                <DialogContent className="max-w-md overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl">
                    <div className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-slate-100 px-5 pb-5 pt-7 sm:px-7">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-zinc-200/60 blur-3xl"
                        />
                        <div className="relative">
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
                                <PackageCheck
                                    className="size-6"
                                    aria-hidden="true"
                                />
                            </span>
                            <DialogHeader className="mt-4">
                                <DialogTitle className="text-xl font-bold tracking-tight text-zinc-950">
                                    Đơn hàng đã hoàn tất!
                                </DialogTitle>
                                <DialogDescription className="text-sm leading-6 text-zinc-600">
                                    Cảm ơn bạn đã mua sắm. Bạn có thể chia sẻ
                                    trải nghiệm về sản phẩm trong đơn hàng này.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 space-y-2">
                                {order.items.slice(0, 3).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-200/80 bg-white/90 px-3 py-2.5"
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                                            <Package
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800">
                                            {item.productName}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-0.5 text-amber-500">
                                            {Array.from({ length: 5 }).map(
                                                (_, index) => (
                                                    <Star
                                                        key={index}
                                                        className="size-3"
                                                        aria-hidden="true"
                                                    />
                                                ),
                                            )}
                                        </span>
                                    </div>
                                ))}
                                {order.items.length > 3 ? (
                                    <p className="px-1 text-xs text-zinc-500">
                                        Và {order.items.length - 3} sản phẩm
                                        khác
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mx-0 mb-0 gap-2 border-t border-zinc-100 bg-white px-5 py-4 sm:flex-row sm:px-7">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setReviewPromptOpen(false)}
                            className="h-10 rounded-xl border-zinc-200 px-4"
                        >
                            Để sau
                        </Button>
                        <Button
                            type="button"
                            onClick={handleReviewNow}
                            className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                        >
                            <Star className="mr-2 size-4" aria-hidden="true" />
                            Đánh giá ngay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
