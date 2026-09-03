// File này trình bày nghiệp vụ hoàn hàng ở customer order detail.
// UI giữ màu hệ thống, chỉ cho chọn item cùng shop và gửi evidence theo policy backend.

'use client';

import { useEffect, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    ImagePlus,
    RotateCcw,
    SkipForward,
    Upload,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import {
    cancelOrderReturn,
    createOrderReturn,
    listOrderReturns,
    type OrderReturnReason,
    type OrderReturnResponse,
} from '@/services/order';
import { mediaService } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    ImageLightbox,
    ImageLightboxThumbnail,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';
import { uploadReturnMedia } from '../utils/return-media-upload';
import {
    useAdvanceDemoCustomerReturnShipment,
    useCustomerTracking,
} from '@/hooks/shipping/use-shipment';

const REASONS: Array<{
    value: OrderReturnReason;
    label: string;
    needsEvidence: boolean;
}> = [
    { value: 'DAMAGED', label: 'Sản phẩm bị hư hỏng', needsEvidence: true },
    { value: 'WRONG_ITEM', label: 'Giao sai sản phẩm', needsEvidence: true },
    { value: 'MISSING_ITEM', label: 'Thiếu sản phẩm', needsEvidence: true },
    {
        value: 'NOT_AS_DESCRIBED',
        label: 'Không đúng mô tả',
        needsEvidence: true,
    },
    {
        value: 'CHANGE_OF_MIND',
        label: 'Không còn nhu cầu',
        needsEvidence: false,
    },
    { value: 'OTHER', label: 'Lý do khác', needsEvidence: false },
];

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
    };
    return labels[status];
}

function isTerminal(status: OrderReturnResponse['status']): boolean {
    return [
        'CUSTOMER_CANCELLED',
        'REJECTED',
        'INSPECTION_FAILED',
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

export function OrderReturnPanel({ order }: { order: OrderResponse }) {
    const queryClient = useQueryClient();
    const returnsQuery = useQuery({
        queryKey: ['order-returns', order.id],
        queryFn: () => listOrderReturns(order.id),
        staleTime: 15_000,
    });
    const trackingQuery = useCustomerTracking(order.id);
    const advanceReturnDemoMutation = useAdvanceDemoCustomerReturnShipment(order.id);
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

    // Tạo lại preview khi danh sách file đổi và thu hồi blob URL để không giữ file local trong bộ nhớ.
    useEffect(() => {
        const nextMedia = createLocalMediaPreviews(images, videos);
        // State này phản ánh resource URL được tạo từ File API, không phải derived state thuần từ props.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalMedia(nextMedia);

        return () => {
            nextMedia.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [images, videos]);

    const createMutation = useMutation({
        mutationFn: async () => {
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

    const activeRequest = returnsQuery.data?.find(
        (item) => !isTerminal(item.status),
    );
    // Giữ màn hình ở chế độ chỉ đọc sau khi Seller từ chối để customer không tạo lại form trên cùng yêu cầu.
    const hasRejectedRequest = returnsQuery.data?.some(
        (item) => item.status === 'REJECTED',
    ) ?? false;
    // Khi Customer đã gửi issue ở card xác nhận, form này không được xuất hiện lại để tránh nhập trùng dữ liệu.
    const deliveryIssueReported = order.deliveryConfirmation?.status === 'ISSUE_REPORTED';
    const selectedShopIds = new Set(
        order.items
            .filter((item) => selectedItemIds.includes(item.id))
            .map((item) => item.sellerShopId)
            .filter(Boolean),
    );
    const selectedReason = REASONS.find((item) => item.value === reason)!;
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
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-zinc-100 px-5 py-5 sm:px-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                    <RotateCcw className="size-5" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Đổi trả & hoàn tiền
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-zinc-950">
                        Yêu cầu hoàn hàng
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                        Chọn sản phẩm cần hoàn. Mỗi yêu cầu chỉ áp dụng cho một
                        shop.
                    </p>
                </div>
            </div>
            {returnsQuery.data?.length ? (
                <div className="space-y-3 border-b border-zinc-100 px-5 py-4 sm:px-6">
                    {returnsQuery.data.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl bg-zinc-50 px-4 py-3"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-950">
                                        {statusLabel(item.status)}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Hoàn dự kiến{' '}
                                        {Number(
                                            item.refundAmount,
                                        ).toLocaleString('vi-VN')}{' '}
                                        đ
                                    </p>
                                </div>
                                {item.status === 'REQUESTED' ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-8 rounded-lg bg-white text-xs"
                                        disabled={cancelMutation.isPending}
                                        onClick={() =>
                                            cancelMutation.mutate(item.id)
                                        }
                                    >
                                        Hủy yêu cầu
                                    </Button>
                                ) : (
                                    <span className="text-xs text-zinc-500">
                                        {new Date(
                                            item.updatedAt,
                                        ).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>
                            {(() => {
                                const returnShipment = returnShipments.find(
                                    (shipment) =>
                                        shipment.returnRequestId === item.id,
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
                                                Vận đơn hoàn · {returnShipment.trackingCode}
                                            </p>
                                            <p className="mt-1">
                                                {returnShipment.statusLabel}
                                            </p>
                                        </div>
                                        {!shipmentFinished ? (
                                            <Button
                                                type="button"
                                                className="h-8 rounded-lg bg-zinc-950 px-3 text-xs text-white hover:bg-zinc-800"
                                                disabled={advanceReturnDemoMutation.isPending}
                                                onClick={() =>
                                                    advanceReturnDemoMutation.mutate(item.id)
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
                                    <p className="font-semibold text-red-900">Shop đã từ chối yêu cầu hoàn hàng</p>
                                    <p className="mt-1 leading-5">
                                        {item.reviewNote?.trim() || 'Shop chưa bổ sung lý do từ chối.'}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : null}
            {canCreate && canShowStandaloneForm && !activeRequest && !hasRejectedRequest && !deliveryIssueReported ? (
                <div className="space-y-5 px-5 py-5 sm:px-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {order.items.map((item) => {
                            const selected = selectedItemIds.includes(item.id);
                            const locked =
                                selectedShopIds.size > 0 &&
                                !selectedShopIds.has(item.sellerShopId ?? '');
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleItem(item.id)}
                                    disabled={locked}
                                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${selected ? 'border-zinc-950 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-400'} ${locked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
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
                                </button>
                            );
                        })}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                        <label className="text-sm font-medium text-zinc-700">
                            Lý do hoàn
                            <select
                                value={reason}
                                onChange={(event) =>
                                    setReason(
                                        event.target.value as OrderReturnReason,
                                    )
                                }
                                className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                            >
                                {REASONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div>
                            <p className="text-sm font-medium text-zinc-700">
                                Bằng chứng{' '}
                                {selectedReason.needsEvidence ? (
                                    <span className="text-red-500">
                                        (bắt buộc ảnh)
                                    </span>
                                ) : (
                                    <span className="font-normal text-zinc-400">
                                        (không bắt buộc)
                                    </span>
                                )}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-medium hover:border-zinc-950">
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
                                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-medium hover:border-zinc-950">
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
                                Tối đa 5 ảnh và 1 video.
                            </p>
                        </div>
                    </div>
                    <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        maxLength={1000}
                        placeholder="Mô tả thêm tình trạng sản phẩm (không bắt buộc)"
                        className="min-h-24 resize-none rounded-xl border-zinc-200"
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
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-xs text-zinc-500">
                            <AlertCircle className="size-4" /> Shop sẽ duyệt
                            trước khi tạo vận đơn hoàn.
                        </p>
                        <Button
                            type="button"
                            disabled={
                                !selectedItemIds.length ||
                                (selectedReason.needsEvidence &&
                                    !images.length) ||
                                submitting ||
                                createMutation.isPending
                            }
                            onClick={() => createMutation.mutate()}
                            className="h-10 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
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
        </section>
    );
}
