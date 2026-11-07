// File này trình bày nghiệp vụ hoàn hàng ở customer order detail.
// UI giữ màu hệ thống, chỉ cho chọn item cùng shop và gửi evidence theo policy backend.

'use client';

import { useEffect, useState } from 'react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    ImagePlus,
    Pencil,
    RotateCcw,
    SkipForward,
    Truck,
    Upload,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import {
    cancelOrderReturn,
    createOrderReturn,
    listOrderReturns,
    updateOrderReturn,
    type OrderReturnReason,
    type OrderReturnResponse,
    type UpdateOrderReturnInput,
} from '@/services/order';
import { mediaService } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    ImageLightbox,
    ImageLightboxThumbnail,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';
import { uploadReturnMedia } from '../utils/return-media-upload';
import { EditOrderReturnDialog } from './edit-order-return-dialog';
import { RETURN_REASONS } from '../constants/return-reason.constant';
import {
    useAdvanceDemoCustomerReturnShipment,
    useCustomerTracking,
} from '@/hooks/shipping/use-shipment';

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

// Tạo preview blob cho file local và giữ thứ tự ảnh trước video giống payload upload.
function createLocalMediaPreviews(
    images: File[],
    videos: File[],
): ImageLightboxMedia[] {
    return [
        ...images.map((file, index) => ({
            url: URL.createObjectURL(file),
            type: 'image' as const,
            label: `Ảnh ${index + 1}`,
        })),
        ...videos.map((file, index) => ({
            url: URL.createObjectURL(file),
            type: 'video' as const,
            label: `Video ${index + 1}`,
        })),
    ];
}

// Quản lý yêu cầu hoàn và cập nhật danh sách sau các thao tác của khách hàng.
// Phần tóm tắt giữ nguyên số tiền/ai chịu phí từ API, đồng thời phân biệt rõ ước tính với số đã chốt.
// UI dùng tông trung tính và màu trạng thái tiết chế để thông tin tài chính dễ quét trên desktop lẫn mobile.
export function OrderReturnPanel({ order }: { order: OrderResponse }) {
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
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [reason, setReason] = useState<OrderReturnReason>('DAMAGED');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [localMedia, setLocalMedia] = useState<ImageLightboxMedia[]>([]);
    const [activeMedia, setActiveMedia] = useState<{
        items: ImageLightboxMedia[];
        index: number;
    } | null>(null);
    const [editingRequest, setEditingRequest] =
        useState<OrderReturnResponse | null>(null);

    // Tạo lại preview khi danh sách file đổi và thu hồi blob URL để không giữ file local trong bộ nhớ.
    useEffect(() => {
        const nextMedia = createLocalMediaPreviews(images, videos);
        // State này phản ánh resource URL được tạo từ File API, không phải derived state thuần từ props.
        setLocalMedia(nextMedia);

        return () => {
            nextMedia.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [images, videos]);

    const createMutation = useMutation({
        mutationFn: async () => {
            // Chặn trước upload để không tạo asset rác khi form chưa có bằng chứng bắt buộc.
            if (images.length + videos.length === 0)
                throw new Error(
                    'Vui lòng thêm ít nhất một ảnh hoặc video bằng chứng.',
                );
            setSubmitting(true);
            const media = await uploadReturnMedia(images, videos);
            try {
                return await createOrderReturn(order.id, {
                    itemIds: selectedItemIds,
                    reason,
                    description: description.trim() || undefined,
                    evidence: media.evidence,
                });
            } catch (error) {
                await mediaService
                    .cleanupUploadedReviewAssets(media.uploadedAssets)
                    .catch(() => undefined);
                throw error;
            }
        },
        onSuccess: async () => {
            toast.success('Đã gửi yêu cầu hoàn hàng.');
            setSelectedItemIds([]);
            setDescription('');
            setImages([]);
            setVideos([]);
            await queryClient.invalidateQueries({
                queryKey: ['order-returns', order.id],
            });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
        onSettled: () => setSubmitting(false),
    });

    const cancelMutation = useMutation({
        mutationFn: cancelOrderReturn,
        onSuccess: async () => {
            toast.success('Đã hủy yêu cầu hoàn hàng.');
            await queryClient.invalidateQueries({
                queryKey: ['order-returns', order.id],
            });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    // Tải lại danh sách để thẻ yêu cầu dùng snapshot mới từ server.
    const updateMutation = useMutation({
        mutationFn: (variables: {
            returnId: string;
            input: UpdateOrderReturnInput;
        }) => updateOrderReturn(variables.returnId, variables.input),
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
    // Khi Customer đã gửi issue ở card xác nhận, form này không được xuất hiện lại để tránh nhập trùng dữ liệu.
    const deliveryIssueReported =
        order.deliveryConfirmation?.status === 'ISSUE_REPORTED';
    const selectedShopIds = new Set(
        order.items
            .filter((item) => selectedItemIds.includes(item.id))
            .map((item) => item.sellerShopId)
            .filter(Boolean),
    );
    const selectedReason = RETURN_REASONS.find(
        (item) => item.value === reason,
    )!;
    const canCreate =
        order.fulfillmentStatus === 'DELIVERED' ||
        order.fulfillmentStatus === 'COMPLETED';
    // Ở trạng thái DELIVERED, Customer nhập issue trực tiếp tại card xác nhận; chỉ mở form độc lập sau khi đơn đã COMPLETED.
    const canShowStandaloneForm = order.fulfillmentStatus === 'COMPLETED';
    const returnShipments =
        trackingQuery.data?.shipments.filter(
            (shipment) => shipment.shipmentKind === 'RETURN',
        ) ?? [];

    function toggleItem(itemId: string): void {
        const item = order.items.find((entry) => entry.id === itemId);
        if (!item?.sellerShopId) return;
        if (selectedItemIds.includes(itemId)) {
            setSelectedItemIds((current) =>
                current.filter((id) => id !== itemId),
            );
            return;
        }
        if (
            selectedShopIds.size > 0 &&
            !selectedShopIds.has(item.sellerShopId)
        ) {
            toast.error('Mỗi yêu cầu chỉ được hoàn sản phẩm của một shop.');
            return;
        }
        setSelectedItemIds((current) => [...current, itemId]);
    }

    function handleFiles(
        event: React.ChangeEvent<HTMLInputElement>,
        type: 'image' | 'video',
    ): void {
        const files = Array.from(event.target.files ?? []);
        if (type === 'image')
            setImages((current) => [...current, ...files].slice(0, 5));
        else setVideos((current) => [...current, ...files].slice(0, 1));
        event.target.value = '';
    }

    // Xóa đúng file local theo định danh thumbnail, không ảnh hưởng evidence đã gửi lên server.
    function handleRemoveLocalMedia(id: string): void {
        if (id.startsWith('image-')) {
            const index = Number(id.replace('image-', ''));
            setImages((current) =>
                current.filter((_, fileIndex) => fileIndex !== index),
            );
            return;
        }

        const index = Number(id.replace('video-', ''));
        setVideos((current) =>
            current.filter((_, fileIndex) => fileIndex !== index),
        );
    }

    if (
        (!canCreate && !returnsQuery.data?.length) ||
        ((deliveryIssueReported || order.fulfillmentStatus === 'DELIVERED') &&
            !returnsQuery.data?.length)
    ) {
        return null;
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <RotateCcw className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-zinc-950">
                        Yêu cầu hoàn hàng
                    </h2>
                    <p className="mt-0.5 text-xs leading-5 text-zinc-500 sm:text-sm">
                        Chọn sản phẩm cần hoàn. Mỗi yêu cầu chỉ áp dụng cho một
                        shop.
                    </p>
                </div>
            </div>
            <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-700 sm:px-5">
                Gửi yêu cầu trong vòng 7 ngày kể từ khi đơn hoàn tất. Phí GHN
                đang hiển thị là ước tính, chưa bị thu; phí thực tế chỉ chốt khi
                hãng vận chuyển nhận kiện. Lỗi hàng shop chịu phí, đổi ý khách
                chịu phí; với lý do khác, shop chọn bên chịu khi duyệt.
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

                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
                                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                            <CircleDollarSign
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            {isRejected
                                                ? 'Không phát sinh hoàn tiền'
                                                : isShippingFinalized
                                                  ? 'Hoàn thực tế'
                                                  : 'Hoàn dự kiến'}
                                        </p>
                                        <p className="mt-1 text-lg font-bold leading-6 tracking-tight text-zinc-950">
                                            {refundAmount.toLocaleString(
                                                'vi-VN',
                                            )}{' '}
                                            đ
                                        </p>
                                    </div>

                                    <div className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
                                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                            <Truck
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            {isRejected
                                                ? 'Phí hoàn hàng dự kiến (không thu)'
                                                : `Phí hoàn hàng ${isShippingFinalized ? 'thực tế' : 'dự kiến'}`}
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
            {canCreate &&
            canShowStandaloneForm &&
            !activeRequest &&
            !hasRejectedRequest &&
            !deliveryIssueReported ? (
                <div className="space-y-4 px-4 py-4 sm:px-5">
                    <div className="grid gap-2">
                        {order.items.map((item) => {
                            const selected = selectedItemIds.includes(item.id);
                            const locked =
                                selectedShopIds.size > 0 &&
                                !selectedShopIds.has(item.sellerShopId ?? '');
                            return (
                                <Button
                                    variant="ghost"
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleItem(item.id)}
                                    disabled={locked}
                                    aria-pressed={selected}
                                    className={`h-auto w-full min-w-0 justify-start whitespace-normal overflow-hidden rounded-lg border px-3 py-2.5 text-left transition ${selected ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-400'} ${locked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`flex size-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300'}`}
                                    >
                                        {selected ? (
                                            <CheckCircle2 className="size-4" />
                                        ) : null}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-zinc-950">
                                            {item.productName}
                                        </span>
                                        <span className="mt-1 block text-xs text-zinc-500">
                                            {item.variantName} · SL{' '}
                                            {item.quantity}
                                        </span>
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                        <label className="text-sm font-medium text-zinc-700">
                            Lý do hoàn
                            <Select
                                value={reason}
                                onValueChange={(value) => {
                                    if (value)
                                        setReason(value as OrderReturnReason);
                                }}
                            >
                                <SelectTrigger className="mt-1.5 h-9 w-full bg-white text-sm">
                                    <SelectValue>
                                        {selectedReason.label}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {RETURN_REASONS.map((item) => (
                                        <SelectItem
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>
                        <div>
                            <p className="text-sm font-medium text-zinc-700">
                                Bằng chứng{' '}
                                <span className="text-red-500">
                                    (bắt buộc ảnh hoặc video)
                                </span>
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-medium hover:border-zinc-950">
                                    <ImagePlus className="size-4" /> Thêm ảnh
                                    <input
                                        hidden
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={(event) =>
                                            handleFiles(event, 'image')
                                        }
                                    />
                                </label>
                                <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-medium hover:border-zinc-950">
                                    <Upload className="size-4" /> Thêm video
                                    <input
                                        hidden
                                        type="file"
                                        accept="video/mp4,video/webm"
                                        onChange={(event) =>
                                            handleFiles(event, 'video')
                                        }
                                    />
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">
                                Tối đa 5 ảnh và 1 video; cần đính kèm ít nhất
                                một bằng chứng.
                            </p>
                        </div>
                    </div>
                    <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={1000}
                        placeholder="Mô tả thêm tình trạng sản phẩm (không bắt buộc)"
                        className="min-h-20 resize-none rounded-lg border-zinc-200"
                    />
                    {images.length || videos.length ? (
                        <div>
                            <p className="mb-2 text-xs font-medium text-zinc-500">
                                Media đã chọn · bấm vào để xem trước
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {localMedia.map((media, index) => (
                                    <ImageLightboxThumbnail
                                        key={media.url}
                                        item={media}
                                        onClick={() =>
                                            setActiveMedia({
                                                items: localMedia,
                                                index,
                                            })
                                        }
                                        onRemove={() =>
                                            handleRemoveLocalMedia(
                                                media.type === 'image'
                                                    ? `image-${index}`
                                                    : `video-${index - images.length}`,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-2 text-xs text-zinc-500">
                            <AlertCircle className="size-4" /> Phí GHN hiển thị
                            là ước tính; chỉ chốt khi hãng vận chuyển nhận kiện.
                        </p>
                        <Button
                            type="button"
                            disabled={
                                !selectedItemIds.length ||
                                (!images.length && !videos.length) ||
                                submitting ||
                                createMutation.isPending
                            }
                            onClick={() => createMutation.mutate()}
                            className="h-9 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi yêu cầu hoàn'}
                        </Button>
                    </div>
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
