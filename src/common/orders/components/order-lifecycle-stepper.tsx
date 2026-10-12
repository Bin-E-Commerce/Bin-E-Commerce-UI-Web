// Thành phần hiển thị lộ trình xử lý đơn hàng cho Customer và Seller.
// Component chỉ trình bày trạng thái và vùng hành động được truyền vào; không gọi API,
// không tự thay đổi trạng thái và không suy đoán quyền thao tác của người dùng.

'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { OrderReturnStatus } from '@/services/order';
import type { ShipmentStatus } from '@/services/shipping';

type OrderLifecycleStage =
    | 'TO_SHIP'
    | 'SHIPPING'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DELIVERY_FAILED'
    | 'RETURN_REFUND';

type LegacyOrderStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
type OrderLifecycleMode = 'customer' | 'seller';
type LifecycleState = 'complete' | 'current' | 'upcoming';

interface OrderLifecycleStepperProps {
    mode: OrderLifecycleMode;
    currentStage?: OrderLifecycleStage | null;
    legacyStatus?: LegacyOrderStatus | string | null;
    cancelledAt?: string | null;
    cancelReason?: string | null;
    shipmentStatus?: ShipmentStatus | null;
    returnStatus?: OrderReturnStatus | null;
    actionSlot?: ReactNode;
}

interface LifecycleStep {
    key: string;
    title: string;
    description: string;
}

const CUSTOMER_STEPS: LifecycleStep[] = [
    {
        key: 'placed',
        title: 'Đặt hàng',
        description: 'Đơn hàng đã được ghi nhận',
    },
    {
        key: 'preparing',
        title: 'Shop chuẩn bị',
        description: 'Shop đang đóng gói sản phẩm',
    },
    {
        key: 'handed-over',
        title: 'Đã bàn giao',
        description: 'Đơn vị vận chuyển đã nhận hàng',
    },
    {
        key: 'delivering',
        title: 'Đang giao',
        description: 'Đơn hàng đang trên đường đến bạn',
    },
    {
        key: 'delivered',
        title: 'Đã giao',
        description: 'Chờ bạn xác nhận đã nhận hàng',
    },
    {
        key: 'completed',
        title: 'Hoàn thành',
        description: 'Đơn hàng đã giao thành công',
    },
];

const SELLER_STEPS: LifecycleStep[] = [
    {
        key: 'to-process',
        title: 'Cần xử lý',
        description: 'Kiểm tra và chuẩn bị đơn hàng',
    },
    {
        key: 'preparing',
        title: 'Chuẩn bị hàng',
        description: 'Đóng gói sản phẩm của shop',
    },
    {
        key: 'handed-over',
        title: 'Bàn giao shipper',
        description: 'Tạo vận đơn và bàn giao kiện hàng',
    },
    {
        key: 'delivering',
        title: 'Đang giao',
        description: 'Đơn vị vận chuyển đang giao hàng',
    },
    {
        key: 'completed',
        title: 'Hoàn thành',
        description: 'Đơn hàng đã giao thành công',
    },
];

const CUSTOMER_RETURN_STEPS: LifecycleStep[] = [
    {
        key: 'return-requested',
        title: 'Đã yêu cầu hoàn',
        description: 'Yêu cầu hoàn hàng đã được tiếp nhận',
    },
    {
        key: 'return-review',
        title: 'Shop xử lý',
        description: 'Shop đang kiểm tra và duyệt yêu cầu',
    },
    {
        key: 'return-shipping',
        title: 'Đang hoàn về shop',
        description: 'Kiện hàng đang được vận chuyển về shop',
    },
    {
        key: 'return-received',
        title: 'Shop đã nhận',
        description: 'Shop đã nhận được kiện hàng hoàn',
    },
    {
        key: 'return-inspected',
        title: 'Kết quả kiểm tra',
        description: 'Shop đã kiểm tra và cập nhật kết quả xử lý',
    },
];

// Chuẩn hóa status cũ về lifecycle mới để UI vẫn đọc được order được tạo trước Phase 4.
function normalizeStage(
    currentStage: OrderLifecycleStage | null | undefined,
    legacyStatus: LegacyOrderStatus | string | null | undefined,
): OrderLifecycleStage {
    if (currentStage) return currentStage;
    if (legacyStatus === 'CANCELLED') return 'CANCELLED';
    if (legacyStatus === 'FAILED') return 'DELIVERY_FAILED';
    return 'TO_SHIP';
}

// Chọn bước theo fulfillmentStatus; Customer bắt đầu từ bước shop chuẩn bị sau khi đặt hàng thành công.
function getActiveIndex(
    stage: OrderLifecycleStage,
    mode: OrderLifecycleMode,
): number {
    if (stage === 'TO_SHIP') return mode === 'seller' ? 0 : 1;
    if (stage === 'SHIPPING') return 3;
    if (stage === 'DELIVERED') return 4;
    if (stage === 'COMPLETED') return mode === 'seller' ? 4 : 5;
    return -1;
}

// Tách mapping Customer/Seller vì cùng một shipment nhưng ngữ nghĩa bước hiển thị khác nhau.
function getShipmentActiveIndex(
    status: ShipmentStatus | null | undefined,
    mode: OrderLifecycleMode,
): number {
    if (status === 'READY_TO_SHIP') return mode === 'seller' ? 2 : 1;
    if (status === 'PICKUP_ASSIGNED') return 2;
    if (status === 'PICKED_UP' || status === 'IN_TRANSIT') return 3;
    if (status === 'DELIVERED') return 4;
    return -1;
}

// Xác định bước cao nhất của quy trình hoàn hàng để customer không tiếp tục thấy timeline giao hàng cũ.
function getReturnActiveIndex(
    status: OrderReturnStatus | null | undefined,
): number {
    if (status === 'REQUESTED') return 0;
    if (status === 'REJECTED') return 1;
    if (status === 'APPROVED' || status === 'AWAITING_SHIPMENT') return 1;
    if (status === 'IN_TRANSIT') return 2;
    if (status === 'RECEIVED') return 3;
    if (status === 'REFUND_PENDING' || status === 'INSPECTION_FAILED') return 4;
    if (status === 'SHIPMENT_FAILED') return 2;
    return -1;
}

// Đổi status hoàn kỹ thuật thành tiêu đề ngắn để customer biết chính xác việc đang chờ ở đâu.
function getReturnStatusTitle(
    status: OrderReturnStatus | null | undefined,
): string {
    const labels: Partial<Record<OrderReturnStatus, string>> = {
        REQUESTED: 'Shop đang xem xét yêu cầu',
        APPROVED: 'Đã được shop duyệt',
        AWAITING_SHIPMENT: 'Chờ gửi hàng hoàn',
        IN_TRANSIT: 'Đang hoàn về shop',
        RECEIVED: 'Shop đã nhận hàng',
        REFUND_PENDING: 'Đã kiểm tra đạt · Chờ hoàn tiền',
        REJECTED: 'Yêu cầu bị từ chối',
        CUSTOMER_CANCELLED: 'Yêu cầu đã hủy',
        SHIPMENT_FAILED: 'Vận chuyển hoàn thất bại',
        INSPECTION_FAILED: 'Kiểm tra không đạt · Chờ gửi trả sản phẩm',
    };
    return (status ? labels[status] : undefined) ?? 'Đang xử lý hoàn hàng';
}

// Định dạng thời gian hủy vì mốc này vẫn cần hiển thị trong trạng thái kết thúc.
function formatLifecycleDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Hiển thị marker số gọn, đồng nhất giữa các breakpoint để timeline ít chiếm chiều cao hơn.
function LifecycleStepMarker({
    index,
    state,
}: {
    index: number;
    state: LifecycleState;
}) {
    return (
        <span className="relative flex size-8 items-center justify-center">
            {state === 'current' ? (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1 rounded-full border border-black/20 motion-safe:animate-[ping_2.4s_ease-out_infinite] motion-reduce:animate-none"
                />
            ) : null}
            <span
                className={cn(
                    'relative z-10 flex size-8 items-center justify-center rounded-full border-2 bg-white text-[11px] font-bold',
                    state === 'complete' && 'border-black bg-black text-white',
                    state === 'current' &&
                        'border-black text-black ring-4 ring-black/10',
                    state === 'upcoming' && 'border-slate-200 text-slate-400',
                )}
            >
                {index + 1}
            </span>
        </span>
    );
}

// Chọn nội dung theo mốc nghiệp vụ đã xác nhận, không suy diễn trạng thái hoàn từ tiến trình giao.
// Customer ở DELIVERED cần được nhắc xác nhận hoặc báo vấn đề; Seller chỉ cần biết đơn đang chờ phản hồi.
function getProgressMessage(
    mode: OrderLifecycleMode,
    stage: OrderLifecycleStage,
    shipmentStatus: ShipmentStatus | null | undefined,
): string {
    if (stage === 'COMPLETED') {
        return mode === 'seller'
            ? 'Đơn hàng đã hoàn thành. Bạn có thể xem lại đánh giá của khách hàng về sản phẩm.'
            : 'Đơn hàng đã hoàn tất. Cảm ơn bạn đã mua sắm cùng chúng tôi.';
    }
    if (
        mode === 'seller' &&
        (stage === 'DELIVERED' || shipmentStatus === 'DELIVERED')
    ) {
        return 'Đơn hàng đã giao thành công. Đang chờ khách hàng xác nhận và chia sẻ đánh giá về sản phẩm.';
    }
    if (mode === 'seller')
        return 'Hoàn tất thao tác ở khu vực vận chuyển bên dưới để chuyển sang bước kế tiếp.';
    if (stage === 'DELIVERED' || shipmentStatus === 'DELIVERED')
        return 'Shipper báo đã giao hàng. Hãy xác nhận đã nhận; nếu chưa nhận hoặc có vấn đề, chọn “Chưa nhận / Có vấn đề” để gửi yêu cầu hỗ trợ hoặc hoàn hàng.';
    return 'Shop sẽ cập nhật hành trình và mã vận đơn khi đơn được bàn giao cho đơn vị vận chuyển.';
}

// Hiển thị tiến trình trong card gọn; actionSlot vẫn nằm cạnh thông điệp để CTA không bị tách khỏi trạng thái.
// Component chỉ nhận snapshot trạng thái, không gọi API hay tự thay đổi đơn hàng.
export function OrderLifecycleStepper({
    mode,
    currentStage,
    legacyStatus,
    cancelledAt,
    cancelReason,
    shipmentStatus,
    returnStatus,
    actionSlot,
}: OrderLifecycleStepperProps) {
    const stage = normalizeStage(currentStage, legacyStatus);
    const returnActiveIndex = getReturnActiveIndex(returnStatus);
    const isCustomerReturnFlow =
        mode === 'customer' &&
        Boolean(returnStatus) &&
        returnStatus !== 'CUSTOMER_CANCELLED';
    // Chỉ đơn đang ở DELIVERED mới chờ phản hồi customer; RETURN_REFUND đã có báo cáo và không được mở lại tại đây.
    const isAwaitingCustomerConfirmation =
        mode === 'customer' && stage === 'DELIVERED' && !isCustomerReturnFlow;
    const steps = isCustomerReturnFlow
        ? CUSTOMER_RETURN_STEPS
        : mode === 'seller'
          ? SELLER_STEPS
          : CUSTOMER_STEPS;
    const shipmentActiveIndex =
        stage === 'COMPLETED'
            ? -1
            : getShipmentActiveIndex(shipmentStatus, mode);
    const activeIndex = isCustomerReturnFlow
        ? Math.max(returnActiveIndex, 0)
        : shipmentActiveIndex >= 0
          ? shipmentActiveIndex
          : getActiveIndex(stage, mode);
    const isCancelled = stage === 'CANCELLED';
    const isFailed = stage === 'DELIVERY_FAILED';
    const isReturn = stage === 'RETURN_REFUND';
    const isCompleted = stage === 'COMPLETED';
    const isReturnFailed =
        isCustomerReturnFlow &&
        ['REJECTED', 'INSPECTION_FAILED', 'SHIPMENT_FAILED'].includes(
            returnStatus ?? '',
        );
    // Bước 5 đã hoàn tất ngay khi Seller có kết quả kiểm tra; REFUND_PENDING chỉ còn chờ phase hoàn tiền.
    const isReturnOutcomeComplete =
        isCustomerReturnFlow &&
        ['REFUND_PENDING', 'INSPECTION_FAILED'].includes(returnStatus ?? '');
    // RETURN_REFUND là trạng thái tổng của order, không phải kết thúc timeline khi request hoàn vẫn đang chạy.
    const isTerminal =
        isCancelled ||
        isFailed ||
        (isReturn && !isCustomerReturnFlow) ||
        isReturnFailed;
    // Shipment DELIVERED là mốc cuối của Seller dù Order Service có thể đang chờ đồng bộ stage nội bộ.
    const sellerDeliveryFinished =
        stage === 'DELIVERED' ||
        stage === 'COMPLETED' ||
        shipmentStatus === 'DELIVERED';
    const activeStep = steps[activeIndex];
    const terminalTitle = isReturnFailed
        ? getReturnStatusTitle(returnStatus)
        : isCancelled
          ? 'Đơn hàng đã hủy'
          : isFailed
            ? 'Giao hàng không thành công'
            : 'Đang xử lý trả hàng / hoàn tiền';
    const terminalDescription =
        returnStatus === 'INSPECTION_FAILED'
            ? 'Shop chưa chấp nhận hoàn tiền sau khi kiểm tra. Sản phẩm sẽ được gửi trả lại cho bạn.'
            : isReturnFailed
              ? 'Yêu cầu hoàn hàng đã dừng theo kết quả xử lý của shop.'
              : isCancelled
                ? 'Đơn hàng đã dừng xử lý và không còn thao tác vận chuyển.'
                : isFailed
                  ? 'Đơn hàng đã kết thúc do không thể giao thành công.'
                  : 'Yêu cầu của bạn đang được xử lý theo quy trình hậu mãi.';

    return (
        <section
            aria-labelledby={`${mode}-order-lifecycle-title`}
            className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm"
        >
            <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2
                            id={`${mode}-order-lifecycle-title`}
                            className="text-base font-bold tracking-tight text-black sm:text-lg"
                        >
                            {isCustomerReturnFlow
                                ? 'Lộ trình hoàn hàng'
                                : 'Lộ trình đơn hàng'}
                        </h2>
                        <p className="mt-0.5 max-w-xl text-xs leading-4 text-slate-500">
                            {isCustomerReturnFlow
                                ? 'Theo dõi yêu cầu hoàn hàng từ lúc gửi đến khi hoàn tiền.'
                                : mode === 'seller'
                                  ? 'Theo dõi từng bước xử lý đơn của shop.'
                                  : 'Theo dõi đơn hàng từ lúc đặt đến khi nhận hàng.'}
                        </p>
                    </div>
                    <div className="shrink-0 rounded-full border border-black bg-black px-3 py-1.5 text-[11px] font-semibold text-white">
                        {isAwaitingCustomerConfirmation
                            ? 'Chờ bạn xác nhận'
                            : isCustomerReturnFlow || isReturnFailed
                              ? getReturnStatusTitle(returnStatus)
                              : isTerminal
                                ? terminalTitle
                                : isCompleted
                                  ? 'Đã hoàn thành'
                                  : (activeStep?.title ?? 'Đang cập nhật')}
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <ol
                    className={cn(
                        'grid gap-4 md:gap-0',
                        steps.length === 6
                            ? 'md:grid-cols-6'
                            : 'md:grid-cols-5',
                    )}
                    aria-label="Các bước xử lý đơn hàng"
                >
                    {steps.map((step, index) => {
                        const state: LifecycleState = isReturnOutcomeComplete
                            ? index <= activeIndex
                                ? 'complete'
                                : 'upcoming'
                            : isReturnFailed
                              ? index < activeIndex
                                  ? 'complete'
                                  : index === activeIndex
                                    ? 'current'
                                    : 'upcoming'
                              : isTerminal
                                ? index === 0
                                    ? 'complete'
                                    : 'upcoming'
                                : isCompleted
                                  ? 'complete'
                                  : index < activeIndex
                                    ? 'complete'
                                    : index === activeIndex
                                      ? 'current'
                                      : 'upcoming';

                        return (
                            <li
                                key={step.key}
                                aria-current={
                                    state === 'current' ? 'step' : undefined
                                }
                                className="relative flex items-start gap-2.5 md:block md:text-center"
                            >
                                {index < steps.length - 1 ? (
                                    <span
                                        className={cn(
                                            'absolute left-1/2 top-4 hidden h-px w-full transition-colors duration-700 ease-out md:block',
                                            (isReturnOutcomeComplete ||
                                                !isTerminal) &&
                                                index < activeIndex
                                                ? 'bg-black/55'
                                                : 'bg-slate-200',
                                        )}
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex shrink-0 md:justify-center">
                                    <LifecycleStepMarker
                                        index={index}
                                        state={state}
                                    />
                                </div>
                                <div className="min-w-0 md:mt-2 md:px-1.5">
                                    <p
                                        className={cn(
                                            'text-xs font-semibold tracking-tight sm:text-sm',
                                            state === 'current'
                                                ? 'text-black'
                                                : state === 'complete'
                                                  ? 'text-slate-700'
                                                  : 'text-slate-400',
                                        )}
                                    >
                                        {step.key === 'return-review' &&
                                        returnStatus === 'REJECTED'
                                            ? 'Shop từ chối yêu cầu'
                                            : step.key === 'return-inspected' &&
                                                returnStatus ===
                                                    'REFUND_PENDING'
                                              ? 'Đã kiểm tra đạt'
                                              : step.key ===
                                                      'return-inspected' &&
                                                  returnStatus ===
                                                      'INSPECTION_FAILED'
                                                ? 'Kiểm tra không đạt'
                                                : step.title}
                                    </p>
                                    <p
                                        className={cn(
                                            'mt-0.5 text-[11px] leading-4',
                                            state === 'upcoming'
                                                ? 'text-slate-400'
                                                : 'text-slate-500',
                                        )}
                                    >
                                        {step.key === 'return-review' &&
                                        returnStatus === 'REJECTED'
                                            ? 'Shop đã từ chối yêu cầu hoàn hàng'
                                            : step.key === 'return-inspected' &&
                                                returnStatus ===
                                                    'REFUND_PENDING'
                                              ? 'Shop đã duyệt hoàn tiền cho bạn'
                                              : step.key ===
                                                      'return-inspected' &&
                                                  returnStatus ===
                                                      'INSPECTION_FAILED'
                                                ? 'Shop đã từ chối sau khi kiểm tra hàng'
                                                : step.description}
                                    </p>
                                    {state === 'current' ? (
                                        <span className="mt-1.5 inline-flex rounded-full bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-white">
                                            Đang thực hiện
                                        </span>
                                    ) : null}
                                </div>
                            </li>
                        );
                    })}
                </ol>

                {isTerminal ? (
                    <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                        <div>
                            <p className="text-sm font-semibold text-black">
                                {terminalTitle}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                {terminalDescription}
                            </p>
                            {isCancelled ? (
                                <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Lý do hủy đơn hàng
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-700">
                                        {cancelReason?.trim() ||
                                            'Chưa có lý do hủy được cung cấp.'}
                                    </p>
                                </div>
                            ) : null}
                            {cancelledAt ? (
                                <p className="mt-2 text-[11px] text-slate-400">
                                    Đã hủy lúc{' '}
                                    {formatLifecycleDate(cancelledAt)}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-black sm:text-sm">
                                {isCustomerReturnFlow
                                    ? isCompleted
                                        ? 'Yêu cầu hoàn hàng đã hoàn tất'
                                        : getReturnStatusTitle(returnStatus)
                                    : mode === 'seller'
                                      ? isCompleted
                                          ? 'Đơn hàng đã hoàn thành'
                                          : sellerDeliveryFinished
                                            ? 'Đang chờ khách hàng đánh giá'
                                            : 'Việc cần làm tiếp theo'
                                      : isAwaitingCustomerConfirmation
                                        ? 'Shipper báo giao thành công'
                                        : isCompleted
                                          ? 'Đơn hàng đã hoàn tất'
                                          : shipmentStatus === 'DELIVERED'
                                            ? 'Giao hàng thành công'
                                            : 'Bạn chưa cần thao tác'}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                {isCustomerReturnFlow
                                    ? returnStatus === 'REFUND_PENDING'
                                        ? 'Shop đã kiểm tra đạt. Khoản hoàn đang chờ được xử lý ở phase thanh toán sau.'
                                        : 'Bạn có thể theo dõi từng bước xử lý yêu cầu hoàn hàng tại đây.'
                                    : isAwaitingCustomerConfirmation
                                      ? 'Vui lòng xác nhận đã nhận hàng. Nếu chưa nhận hoặc sản phẩm có vấn đề, bạn có thể gửi yêu cầu hỗ trợ/hoàn hàng bên dưới.'
                                      : getProgressMessage(
                                            mode,
                                            stage,
                                            shipmentStatus,
                                        )}
                            </p>
                        </div>
                        {actionSlot ? (
                            <div className="shrink-0">{actionSlot}</div>
                        ) : null}
                    </div>
                )}
            </div>
        </section>
    );
}
