// File này chỉ theo dõi lịch sử và trạng thái hoàn hàng trong chi tiết đơn.
// Form tạo yêu cầu tập trung ở DeliveryConfirmationCard để Customer không nhập trùng dữ liệu.

'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    CalendarDays,
    CircleDollarSign,
    Pencil,
    RotateCcw,
    SkipForward,
    Truck,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    cancelOrderReturn,
    getOrder,
    listOrderReturns,
    updateOrderReturn,
    type OrderReturnResponse,
} from '@/services/order';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    ImageLightbox,
    ImageLightboxThumbnail,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';
import { EditOrderReturnDialog } from './edit-order-return-dialog';
import {
    useAdvanceDemoCustomerReturnShipment,
    useCustomerTracking,
} from '@/hooks/shipping/use-shipment';
import { useConfirmOrderDelivery } from '../hooks/use-delivery-confirmation';
import type {
    OrderReturnPanelProps,
    UpdateOrderReturnMutationVariables,
} from '../types/returns/order-return-panel.type';

const RETURN_SHIPPING_LIMIT_REJECTION_PREFIX =
    'Phí hoàn GHN vượt giá trị hàng hoàn.';

// Chuyển state return thành nội dung khách hiểu được, bao gồm lỗi vận chuyển và kết quả hoàn tiền.
function statusLabel(status: OrderReturnResponse['status']): string {
    const labels: Record<OrderReturnResponse['status'], string> = {
        REQUESTED: 'Chờ shop xử lý',
        CUSTOMER_CANCELLED: 'Đã hủy',
        APPROVED: 'Đã duyệt',
        REJECTED: 'Bị từ chối',
        AWAITING_SHIPMENT: 'Chờ gửi hàng hoàn',
        IN_TRANSIT: 'Đang vận chuyển về shop',
        SHIPMENT_FAILED: 'Vận chuyển lỗi',
        RECEIVED: 'Shop đã nhận hàng',
        INSPECTION_FAILED: 'Kiểm tra không đạt · Chờ gửi trả sản phẩm',
        REFUND_PENDING: 'Đã kiểm tra đạt · Chờ hoàn tiền',
        REFUND_FAILED: 'Chuyển khoản hoàn lỗi · đang được xử lý lại',
        REFUNDED: 'Đã hoàn tiền',
    };
    return labels[status];
}

// Giữ request failed trong activeRequest để khách không tạo yêu cầu trùng khi shop/admin còn phải xử lý.
function isTerminal(status: OrderReturnResponse['status']): boolean {
    return [
        'CUSTOMER_CANCELLED',
        'REJECTED',
        'INSPECTION_FAILED',
        'REFUNDED',
    ].includes(status);
}

// Chuẩn hóa evidence từ API thành media item để modal dùng chung được cả ảnh và video.
function mapReturnEvidenceToMedia(
    item: OrderReturnResponse,
): ImageLightboxMedia[] {
    return (item.evidence ?? []).map((evidence, index) => ({
        url: evidence.url,
        type: evidence.type,
        label:
            evidence.type === 'image'
                ? `Ảnh bằng chứng ${index + 1}`
                : `Video bằng chứng ${index + 1}`,
    }));
}

// Hiển thị lịch sử hoàn và cho phép xử lý các thao tác còn hợp lệ trên từng request.
// Form tạo request được giữ duy nhất tại thẻ giao nhận; component này chỉ đọc lịch sử,
// cập nhật/hủy request và theo dõi vận đơn để tránh hai form tạo cùng một yêu cầu.
export function OrderReturnPanel({ order }: OrderReturnPanelProps) {
    const queryClient = useQueryClient();
    const returnsQuery = useQuery({
        queryKey: ['order-returns', order.id],
        queryFn: () => listOrderReturns(order.id),
        staleTime: 15_000,
    });
    const trackingQuery = useCustomerTracking(order.id);
    const advanceReturnDemoMutation = useAdvanceDemoCustomerReturnShipment(
        order.id,
    );
    const [activeMedia, setActiveMedia] = useState<{
        items: ImageLightboxMedia[];
        index: number;
    } | null>(null);
    const [editingRequest, setEditingRequest] =
        useState<OrderReturnResponse | null>(null);

    const cancelMutation = useMutation({
        mutationFn: cancelOrderReturn,
        onSuccess: async () => {
            toast.success('Đã hủy yêu cầu hoàn hàng.');
            // Hủy request có thể mở lại bước xác nhận giao hàng; đồng bộ cả lịch sử return và order snapshot.
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['order-returns', order.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['customer-order', order.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['customer-orders'],
                }),
            ]);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const reconcileCancelledRequestMutation = useMutation({
        mutationFn: async (returnId: string) => {
            // Endpoint hủy idempotent; gọi lại chỉ để server khôi phục order cũ bị kẹt sau khi request đã hủy.
            await cancelOrderReturn(returnId);
            return getOrder(order.id);
        },
        onSuccess: async (updatedOrder) => {
            queryClient.setQueryData(
                ['customer-order', order.id],
                updatedOrder,
            );
            toast.success('Đã khôi phục trạng thái đơn hàng.');
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['order-returns', order.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['customer-orders'],
                }),
            ]);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const confirmDeliveryMutation = useConfirmOrderDelivery(order.id);

    // Tải lại danh sách để thẻ yêu cầu dùng snapshot mới từ server.
    const updateMutation = useMutation({
        mutationFn: (variables: UpdateOrderReturnMutationVariables) =>
            updateOrderReturn(variables.returnId, variables.input),
        onSuccess: () => {
            toast.success('Đã cập nhật yêu cầu hoàn hàng.');
            void queryClient
                .invalidateQueries({
                    queryKey: ['order-returns', order.id],
                })
                .catch(() => undefined);
        },
    });

    const activeRequest = returnsQuery.data?.find(
        (item) => !isTerminal(item.status),
    );
    // Chỉ khóa form sau khi shop tự từ chối; lỗi giới hạn phí do GHN cho phép khách gửi yêu cầu mới theo phương án khác.
    const hasRejectedRequest =
        returnsQuery.data?.some(
            (item) =>
                item.status === 'REJECTED' &&
                !item.reviewNote?.startsWith(
                    RETURN_SHIPPING_LIMIT_REJECTION_PREFIX,
                ),
        ) ?? false;
    const isOrderCompleted = order.fulfillmentStatus === 'COMPLETED';
    // Danh sách được sắp theo ngày tạo, nhưng request cũ có thể vừa bị hủy nên chọn theo updatedAt để gắn lối tắt đúng thẻ.
    const latestCancelledRequestId = returnsQuery.data
        ?.filter((item) => item.status === 'CUSTOMER_CANCELLED')
        .sort(
            (first, second) =>
                new Date(second.updatedAt).getTime() -
                new Date(first.updatedAt).getTime(),
        )[0]?.id;
    // Trước khi khách xác nhận hoàn tất, chỉ mở thao tác nếu không có return khác đang xử lý hoặc bị từ chối.
    const canOfferDeliveryChoices =
        order.fulfillmentStatus === 'DELIVERED' &&
        !activeRequest &&
        !hasRejectedRequest;
    // Một số request cũ đã hủy nhưng order còn RETURN_REFUND; chỉ mở đường phục hồi khi issue cũng đã đóng về cùng trạng thái cũ.
    const canRepairCancelledOrder =
        order.fulfillmentStatus === 'RETURN_REFUND' &&
        order.deliveryConfirmation?.status === 'ISSUE_REPORTED' &&
        !activeRequest &&
        !hasRejectedRequest;
    const returnShipments =
        trackingQuery.data?.shipments.filter(
            (shipment) => shipment.shipmentKind === 'RETURN',
        ) ?? [];

    // Gọi lại cancel idempotent để phục hồi order cũ, sau đó cuộn tới nút mở form thống nhất.
    async function handleResubmitCancelledRequest(
        returnId: string,
    ): Promise<void> {
        try {
            const updatedOrder =
                await reconcileCancelledRequestMutation.mutateAsync(returnId);
            const targetId =
                updatedOrder.fulfillmentStatus === 'DELIVERED'
                    ? 'report-order-issue'
                    : null;
            if (!targetId) return;

            // Đợi order chuyển lại DELIVERED và nút báo vấn đề được render rồi mới cuộn tới form duy nhất.
            window.requestAnimationFrame(() => {
                document
                    .getElementById(targetId)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        } catch {
            // Mutation đã chuyển lỗi thành toast; không nuốt hay ghi đè thông báo lỗi của getErrorMessage.
        }
    }

    // Khôi phục order rồi xác nhận nhận hàng trong cùng thao tác để customer không cần bấm qua trạng thái trung gian.
    async function handleConfirmAfterCancelledRequest(
        returnId: string,
    ): Promise<void> {
        try {
            const updatedOrder =
                await reconcileCancelledRequestMutation.mutateAsync(returnId);
            // Chỉ xác nhận ở trạng thái đã giao; COMPLETED nghĩa là khách đã xác nhận trước đó.
            if (updatedOrder.fulfillmentStatus !== 'DELIVERED') {
                toast.error('Đơn chưa thể xác nhận đã nhận hàng.');
                return;
            }
            await confirmDeliveryMutation.mutateAsync({ decision: 'RECEIVED' });
        } catch {
            // Hai mutation đã hiển thị lỗi qua toast riêng; giữ nguyên lỗi gốc từ API.
        }
    }

    // Chỉ hiển thị lịch sử sau khi có request; form tạo mới nằm ở DeliveryConfirmationCard.
    if (!returnsQuery.data?.length) return null;

    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <RotateCcw className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-zinc-950">
                        Lịch sử hoàn hàng
                    </h2>
                    <p className="mt-0.5 text-xs leading-5 text-zinc-500 sm:text-sm">
                        Theo dõi trạng thái và các bước xử lý yêu cầu đã gửi.
                    </p>
                </div>
            </div>
            {returnsQuery.data?.length ? (
                <div className="space-y-3 border-b border-zinc-100 px-5 py-4 sm:px-6">
                    {returnsQuery.data.map((item) => {
                        // Chỉ dùng số hoàn cuối cùng khi vận chuyển đã chốt;
                        // trước thời điểm đó luôn ghi nhãn dự kiến.
                        const isRejected = item.status === 'REJECTED';
                        const isShippingFinalized = Boolean(
                            item.returnShippingFinalizedAt,
                        );
                        const isFailure = [
                            'SHIPMENT_FAILED',
                            'REFUND_FAILED',
                            'INSPECTION_FAILED',
                        ].includes(item.status);
                        const refundAmount = Number(
                            isRejected
                                ? 0
                                : isShippingFinalized
                                  ? item.refundAmount
                                  : item.estimatedRefundAmount,
                        );
                        // Các khoản thành phần lấy nguyên snapshot backend; chỉ tổng refund đổi từ estimate sang thực tế sau khi GHN chốt phí.
                        const itemRefundAmount = Number(
                            isRejected ? 0 : (item.refundItemAmount ?? 0),
                        );
                        const outboundShippingRefundAmount = Number(
                            isRejected ? 0 : (item.refundShippingAmount ?? 0),
                        );
                        const shippingAmount = Number(
                            isShippingFinalized
                                ? item.returnShippingCost
                                : item.returnShippingEstimatedCost,
                        );
                        // Yêu cầu bị từ chối không thu phí; các yêu cầu còn lại
                        // thể hiện người chịu phí theo quyết định hiện tại.
                        const shippingPayerLabel = isRejected
                            ? 'Không thu phí'
                            : item.returnShippingPayer === 'CUSTOMER'
                              ? isShippingFinalized
                                  ? 'Khách chịu phí'
                                  : 'Khách dự kiến chịu phí'
                              : item.returnShippingPayer === 'SELLER'
                                ? 'Shop chịu phí'
                                : 'Shop đang phân loại';
                        const statusTone =
                            isRejected || isFailure
                                ? 'border-red-200 bg-red-50 text-red-700'
                                : item.status === 'REQUESTED'
                                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                                  : item.status === 'REFUNDED'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-zinc-200 bg-zinc-50 text-zinc-700';

                        return (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm sm:p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span
                                            className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold ${statusTone}`}
                                        >
                                            {statusLabel(item.status)}
                                        </span>
                                    </div>
                                    {item.status === 'REQUESTED' ? (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-8 rounded-lg border-zinc-200 bg-white px-3 text-xs text-zinc-700 hover:bg-zinc-50"
                                                disabled={
                                                    updateMutation.isPending
                                                }
                                                onClick={() =>
                                                    setEditingRequest(item)
                                                }
                                            >
                                                <Pencil
                                                    className="mr-1.5 size-3.5"
                                                    aria-hidden="true"
                                                />
                                                Chỉnh sửa
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-8 rounded-lg border-zinc-200 bg-white px-3 text-xs text-zinc-700 hover:bg-zinc-50"
                                                disabled={
                                                    cancelMutation.isPending ||
                                                    updateMutation.isPending
                                                }
                                                onClick={() =>
                                                    cancelMutation.mutate(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                Hủy yêu cầu
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                                            <CalendarDays
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            <time dateTime={item.updatedAt}>
                                                {new Date(
                                                    item.updatedAt,
                                                ).toLocaleDateString('vi-VN')}
                                            </time>
                                        </span>
                                    )}
                                </div>

                                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
                                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                            <CircleDollarSign
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            Tiền hàng hoàn
                                        </p>
                                        <p className="mt-1 text-base font-bold leading-6 tracking-tight text-zinc-950">
                                            {itemRefundAmount.toLocaleString(
                                                'vi-VN',
                                            )}{' '}
                                            đ
                                        </p>
                                    </div>

                                    <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
                                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                            <CircleDollarSign
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            Hoàn phí giao ban đầu
                                        </p>
                                        <p className="mt-1 text-base font-bold leading-6 tracking-tight text-zinc-950">
                                            {outboundShippingRefundAmount.toLocaleString(
                                                'vi-VN',
                                            )}{' '}
                                            đ
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-zinc-500">
                                            Phí shop → khách được hoàn
                                        </p>
                                    </div>

                                    <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
                                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                            <Truck
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            Phí gửi hàng về shop{' '}
                                            {isShippingFinalized
                                                ? '(thực tế)'
                                                : '(dự kiến)'}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                                            <p className="text-base font-semibold leading-6 text-zinc-900">
                                                {shippingAmount.toLocaleString(
                                                    'vi-VN',
                                                )}{' '}
                                                đ
                                            </p>
                                            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                                                {shippingPayerLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-3">
                                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                            <CircleDollarSign
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            {isRejected
                                                ? 'Không phát sinh hoàn tiền'
                                                : isShippingFinalized
                                                  ? 'Tổng khách nhận thực tế'
                                                  : 'Tổng khách nhận dự kiến'}
                                        </p>
                                        <p className="mt-1 text-base font-bold leading-6 tracking-tight text-zinc-950">
                                            {refundAmount.toLocaleString(
                                                'vi-VN',
                                            )}{' '}
                                            đ
                                        </p>
                                    </div>
                                </div>

                                {Number(
                                    item.customerReturnShippingReceivableAmount ??
                                        0,
                                ) > 0 ? (
                                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                                        Phí khách còn phải trả (chưa thu):{' '}
                                        {Number(
                                            item.customerReturnShippingReceivableAmount,
                                        ).toLocaleString('vi-VN')}{' '}
                                        đ
                                    </p>
                                ) : null}
                                {item.status === 'CUSTOMER_CANCELLED' &&
                                item.id === latestCancelledRequestId ? (
                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm">
                                                    <RotateCcw
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-amber-950">
                                                        {isOrderCompleted
                                                            ? 'Đơn hàng đã hoàn thành'
                                                            : 'Bạn muốn tiếp tục thế nào?'}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-amber-900/80">
                                                        {isOrderCompleted
                                                            ? 'Yêu cầu đã hủy. Vì bạn đã xác nhận hoàn thành đơn, không thể gửi yêu cầu hoàn hàng mới.'
                                                            : canOfferDeliveryChoices
                                                              ? 'Yêu cầu đã hủy. Bạn có thể gửi yêu cầu hoàn mới nếu vẫn có vấn đề, hoặc xác nhận đã nhận hàng.'
                                                              : canRepairCancelledOrder
                                                                ? 'Yêu cầu đã hủy. Đơn cần khôi phục bước xác nhận trước khi bạn chọn thao tác tiếp theo.'
                                                                : 'Yêu cầu đã hủy. Trạng thái đơn hiện chưa cho phép tiếp tục thao tác.'}
                                                    </p>
                                                </div>
                                            </div>
                                            {!isOrderCompleted ? (
                                                <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto sm:shrink-0">
                                                    {canOfferDeliveryChoices ? (
                                                        <>
                                                            <Button
                                                                render={
                                                                    <Link href="#report-order-issue" />
                                                                }
                                                                className="h-9 rounded-lg bg-zinc-950 px-3 text-xs text-white hover:bg-zinc-800"
                                                            >
                                                                Gửi yêu cầu hoàn
                                                                hàng lại
                                                            </Button>
                                                            <Button
                                                                render={
                                                                    <Link href="#confirm-order-received" />
                                                                }
                                                                variant="outline"
                                                                className="h-9 rounded-lg border-amber-300 bg-white px-3 text-xs text-amber-950 hover:bg-amber-100"
                                                            >
                                                                Xác nhận đã nhận
                                                                hàng
                                                            </Button>
                                                        </>
                                                    ) : canRepairCancelledOrder ? (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                disabled={
                                                                    reconcileCancelledRequestMutation.isPending
                                                                }
                                                                onClick={() =>
                                                                    void handleResubmitCancelledRequest(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="h-9 rounded-lg bg-zinc-950 px-3 text-xs text-white hover:bg-zinc-800"
                                                            >
                                                                {reconcileCancelledRequestMutation.isPending
                                                                    ? 'Đang khôi phục...'
                                                                    : 'Gửi yêu cầu hoàn hàng lại'}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                disabled={
                                                                    reconcileCancelledRequestMutation.isPending ||
                                                                    confirmDeliveryMutation.isPending
                                                                }
                                                                onClick={() =>
                                                                    void handleConfirmAfterCancelledRequest(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="h-9 rounded-lg border-amber-300 bg-white px-3 text-xs text-amber-950 hover:bg-amber-100"
                                                            >
                                                                {confirmDeliveryMutation.isPending
                                                                    ? 'Đang xác nhận...'
                                                                    : 'Xác nhận đã nhận hàng'}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                disabled
                                                                className="h-9 rounded-lg bg-zinc-950 px-3 text-xs text-white"
                                                            >
                                                                Gửi yêu cầu hoàn
                                                                hàng lại
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                disabled
                                                                className="h-9 rounded-lg border-amber-300 bg-white px-3 text-xs text-amber-950"
                                                            >
                                                                Xác nhận đã nhận
                                                                hàng
                                                            </Button>
                                                            <p className="basis-full text-xs leading-5 text-amber-900/80">
                                                                {activeRequest
                                                                    ? 'Đơn đang có yêu cầu hoàn khác chờ xử lý.'
                                                                    : hasRejectedRequest
                                                                      ? 'Shop đã từ chối yêu cầu hoàn trước đó; vui lòng xem lại kết quả xử lý.'
                                                                      : 'Trạng thái đơn chưa cho phép gửi lại yêu cầu hoặc xác nhận đã nhận hàng.'}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}
                                {(() => {
                                    const returnShipment = returnShipments.find(
                                        (shipment) =>
                                            shipment.returnRequestId ===
                                            item.id,
                                    );
                                    if (!returnShipment) return null;
                                    const shipmentFinished = [
                                        'RETURNED',
                                        'CANCELLED',
                                        'FAILED',
                                    ].includes(returnShipment.status);
                                    return (
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2">
                                            <div className="min-w-0 text-xs text-zinc-600">
                                                <p className="font-semibold text-zinc-900">
                                                    Vận đơn hoàn
                                                </p>
                                                <p className="mt-1">
                                                    {returnShipment.statusLabel}
                                                </p>
                                            </div>
                                            {!shipmentFinished &&
                                            returnShipment.demoAdvancementEnabled ? (
                                                <Button
                                                    type="button"
                                                    className="h-8 rounded-lg bg-zinc-950 px-3 text-xs text-white hover:bg-zinc-800"
                                                    disabled={
                                                        advanceReturnDemoMutation.isPending
                                                    }
                                                    onClick={() =>
                                                        advanceReturnDemoMutation.mutate(
                                                            item.id,
                                                        )
                                                    }
                                                >
                                                    <SkipForward className="size-3.5" />
                                                    Bỏ qua bước demo
                                                </Button>
                                            ) : null}
                                        </div>
                                    );
                                })()}
                                {item.evidence?.length ? (
                                    <div className="mt-3 border-t border-zinc-200/70 pt-3">
                                        <p className="mb-2 text-xs font-medium text-zinc-500">
                                            Media đã gửi
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {mapReturnEvidenceToMedia(item).map(
                                                (media, index) => (
                                                    <ImageLightboxThumbnail
                                                        key={`${item.id}-evidence-${index}`}
                                                        item={media}
                                                        onClick={() =>
                                                            setActiveMedia({
                                                                items: mapReturnEvidenceToMedia(
                                                                    item,
                                                                ),
                                                                index,
                                                            })
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                                {item.status === 'REJECTED' ? (
                                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50/45 px-3 py-3 text-sm text-zinc-700">
                                        <p className="font-semibold text-red-900">
                                            {item.reviewNote?.startsWith(
                                                RETURN_SHIPPING_LIMIT_REJECTION_PREFIX,
                                            )
                                                ? 'Yêu cầu hoàn bị từ chối do phí GHN'
                                                : 'Shop đã từ chối yêu cầu hoàn hàng'}
                                        </p>
                                        <p className="mt-1 leading-5">
                                            {item.reviewNote?.trim() ||
                                                'Shop chưa bổ sung lý do từ chối.'}
                                        </p>
                                    </div>
                                ) : null}
                                {item.shipmentFailureNote ? (
                                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
                                        Vận chuyển hoàn gặp lỗi:{' '}
                                        {item.shipmentFailureNote}
                                    </p>
                                ) : null}
                                {item.refundFailureNote ? (
                                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800">
                                        Chuyển khoản hoàn gặp lỗi:{' '}
                                        {item.refundFailureNote}
                                    </p>
                                ) : null}
                            </article>
                        );
                    })}
                </div>
            ) : null}
            {activeMedia ? (
                <ImageLightbox
                    media={activeMedia.items}
                    initialIndex={activeMedia.index}
                    title="Xem bằng chứng hoàn hàng"
                    altPrefix="Bằng chứng"
                    onClose={() => setActiveMedia(null)}
                />
            ) : null}
            <EditOrderReturnDialog
                open={Boolean(editingRequest)}
                request={editingRequest}
                order={order}
                isSubmitting={updateMutation.isPending}
                onOpenChange={(open) => {
                    if (!open) setEditingRequest(null);
                }}
                onSave={async (returnId, input) => {
                    await updateMutation.mutateAsync({ returnId, input });
                }}
            />
        </section>
    );
}
