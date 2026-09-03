// File này hiển thị quyết định nhận hàng sau khi carrier báo giao thành công.
// Component không tự đổi order; mọi chuyển trạng thái đều đi qua mutation Order Service để giữ ownership và idempotency.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import {
    confirmOrderDelivery,
    createOrderReturn,
    type DeliveryIssueReason,
    type OrderReturnReason,
} from '@/services/order';
import { mediaService, type ReviewMediaCleanupAsset } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    ImageLightbox,
    ImageLightboxThumbnail,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';
import { uploadReturnMedia } from '../utils/return-media-upload';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useConfirmOrderDelivery } from '../hooks/use-delivery-confirmation';

type DeliveryConfirmationCardProps = {
    order: OrderResponse;
};

const ISSUE_REASONS = [
    'NOT_RECEIVED',
    'DAMAGED',
    'WRONG_ITEM',
    'MISSING_ITEM',
    'OTHER',
] as const;

// Định dạng countdown theo ngày/giờ để khách hiểu rõ mốc auto-complete mà không cần biết timestamp kỹ thuật.
function formatRemainingTime(deadline: string | null): string | null {
    if (!deadline) return null;
    const remaining = new Date(deadline).getTime() - Date.now();
    if (remaining <= 0) return 'sẽ được xử lý ngay';
    const days = Math.floor(remaining / 86_400_000);
    const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
    return days > 0 ? `${days} ngày ${hours} giờ` : `${hours} giờ`;
}

// Kiểm tra stage và confirmation status trước khi render để card không xuất hiện cho đơn cũ hoặc đơn đã xử lý.
function shouldRenderConfirmation(order: OrderResponse): boolean {
    const confirmationStatus = order.deliveryConfirmation?.status;
    return (
        order.fulfillmentStatus === 'DELIVERED' &&
        (!confirmationStatus || confirmationStatus === 'PENDING')
    );
}

// Chuyển mã vấn đề thành nhãn trực tiếp trong form để Customer không phải đọc enum kỹ thuật.
function getIssueReasonLabel(reason: (typeof ISSUE_REASONS)[number]): string {
    if (reason === 'NOT_RECEIVED') return 'Chưa nhận được hàng';
    if (reason === 'DAMAGED') return 'Sản phẩm bị hư hỏng';
    if (reason === 'WRONG_ITEM') return 'Giao sai sản phẩm';
    if (reason === 'MISSING_ITEM') return 'Thiếu sản phẩm';
    return 'Vấn đề khác';
}

// Tạo preview media từ File local và thu hồi blob URL sau mỗi lần form thay đổi.
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

// Render card xác nhận với hai lựa chọn rõ ràng, ưu tiên thao tác tích cực và giữ lựa chọn báo lỗi dễ tìm.
export function DeliveryConfirmationCard({
    order,
}: DeliveryConfirmationCardProps) {
    const queryClient = useQueryClient();
    const [issueOpen, setIssueOpen] = useState(false);
    const [reason, setReason] = useState<DeliveryIssueReason | ''>('');
    const [note, setNote] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [activeMedia, setActiveMedia] = useState<number | null>(null);
    const firstIssueInputRef = useRef<HTMLInputElement | null>(null);
    const mutation = useConfirmOrderDelivery(order.id);
    const [remainingTime, setRemainingTime] = useState(() =>
        formatRemainingTime(order.deliveryConfirmation.deadline),
    );
    const selectedShopIds = new Set(
        order.items
            .filter((item) => selectedItemIds.includes(item.id))
            .map((item) => item.sellerShopId)
            .filter(Boolean),
    );
    const isReturnRequest = Boolean(reason && reason !== 'NOT_RECEIVED');
    const evidenceRequired = ['DAMAGED', 'WRONG_ITEM', 'MISSING_ITEM'].includes(
        reason,
    );
    const canSubmitIssue =
        Boolean(reason) &&
        (!isReturnRequest || selectedItemIds.length > 0) &&
        (!evidenceRequired || images.length > 0);
    const localMedia = useMemo(
        () => createLocalMediaPreviews(images, videos),
        [images, videos],
    );

    // Chỉ dùng effect để thu hồi blob URL sau khi preview bị thay thế hoặc component bị tháo khỏi cây.
    // Danh sách preview được dẫn xuất bằng useMemo nên không tạo thêm vòng render do setState trong effect.
    useEffect(() => {
        return () =>
            localMedia.forEach((item) => URL.revokeObjectURL(item.url));
    }, [localMedia]);

    // Khi mở form, đưa người dùng tới lựa chọn đầu tiên và cuộn vừa đủ để vùng cần thao tác nằm trong tầm nhìn.
    // requestAnimationFrame bảo đảm radio đã được mount sau khi issueOpen đổi sang true trước khi gọi focus.
    useEffect(() => {
        if (!issueOpen) return;
        const frame = window.requestAnimationFrame(() => {
            firstIssueInputRef.current?.focus();
            firstIssueInputRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [issueOpen]);

    const issueMutation = useMutation({
        mutationFn: async () => {
            if (!reason) throw new Error('Vui lòng chọn vấn đề của đơn hàng.');

            const isReturnRequest = reason !== 'NOT_RECEIVED';
            if (isReturnRequest && selectedItemIds.length === 0) {
                throw new Error('Vui lòng chọn sản phẩm bị ảnh hưởng.');
            }
            if (
                isReturnRequest &&
                ['DAMAGED', 'WRONG_ITEM', 'MISSING_ITEM'].includes(reason) &&
                images.length === 0
            ) {
                throw new Error('Vui lòng thêm ít nhất một ảnh bằng chứng.');
            }

            let uploadedAssets: ReviewMediaCleanupAsset[] = [];
            let returnCreated = false;
            try {
                const media =
                    images.length || videos.length
                        ? await uploadReturnMedia(images, videos)
                        : {
                              evidence: [],
                              uploadedAssets: [] as ReviewMediaCleanupAsset[],
                          };
                uploadedAssets = media.uploadedAssets;

                if (isReturnRequest) {
                    await createOrderReturn(order.id, {
                        itemIds: selectedItemIds,
                        reason: reason as OrderReturnReason,
                        description: note.trim() || undefined,
                        evidence: media.evidence,
                    });
                    returnCreated = true;
                }

                const updatedOrder = await confirmOrderDelivery(order.id, {
                    decision: 'ISSUE',
                    reason,
                    itemIds: selectedItemIds,
                    note: note.trim() || undefined,
                    evidence: media.evidence,
                });
                return { updatedOrder, returnCreated };
            } catch (error) {
                // Chỉ cleanup asset khi tạo return thất bại; nếu return đã lưu thì evidence là dữ liệu lịch sử cần giữ lại.
                if (!returnCreated && uploadedAssets.length > 0) {
                    await mediaService
                        .cleanupUploadedReviewAssets(uploadedAssets)
                        .catch(() => undefined);
                }
                throw error;
            }
        },
        onSuccess: async ({ updatedOrder, returnCreated }) => {
            queryClient.setQueryData(
                ['customer-order', order.id],
                updatedOrder,
            );
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['customer-orders'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['order-review-status', order.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['order-returns', order.id],
                }),
            ]);
            resetIssueForm();
            toast.success(
                returnCreated
                    ? 'Đã gửi yêu cầu hoàn hàng.'
                    : 'Đã ghi nhận vấn đề của bạn.',
            );
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    // Cập nhật countdown theo phút bằng subscription timer để customer luôn thấy đúng thời gian auto-complete.
    useEffect(() => {
        const timer = window.setInterval(() => {
            setRemainingTime(
                formatRemainingTime(order.deliveryConfirmation.deadline),
            );
        }, 60_000);
        return () => window.clearInterval(timer);
    }, [order.deliveryConfirmation.deadline]);

    if (!shouldRenderConfirmation(order)) return null;

    // Gửi xác nhận thành công ngay trong click handler để không tạo side effect lặp lại qua useEffect.
    function handleReceived(): void {
        mutation.mutate({ decision: 'RECEIVED' });
    }

    // Chọn item bị ảnh hưởng để yêu cầu hoàn hàng chỉ áp dụng đúng sản phẩm customer báo lỗi.
    function toggleItem(itemId: string): void {
        const item = order.items.find((entry) => entry.id === itemId);
        if (!item?.sellerShopId) return;
        if (
            selectedShopIds.size > 0 &&
            !selectedShopIds.has(item.sellerShopId)
        ) {
            toast.error('Mỗi yêu cầu chỉ được hoàn sản phẩm của một shop.');
            return;
        }
        setSelectedItemIds((current) =>
            current.includes(itemId)
                ? current.filter((id) => id !== itemId)
                : [...current, itemId],
        );
    }

    // Nhận file evidence một lần trong cùng form với lý do để tránh customer phải nhập lại ở panel bên dưới.
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

    // Xóa file local khỏi form trước khi upload mà không tác động đến evidence đã lưu trên server.
    function handleRemoveMedia(index: number, type: 'image' | 'video'): void {
        if (type === 'image')
            setImages((current) =>
                current.filter((_, itemIndex) => itemIndex !== index),
            );
        else
            setVideos((current) =>
                current.filter((_, itemIndex) => itemIndex !== index),
            );
    }

    // Đặt lại toàn bộ form sau khi server đã ghi nhận để lần mở tiếp theo không dùng dữ liệu cũ.
    function resetIssueForm(): void {
        setIssueOpen(false);
        setReason('');
        setNote('');
        setSelectedItemIds([]);
        setImages([]);
        setVideos([]);
        setActiveMedia(null);
    }

    // Gửi một request duy nhất; vấn đề chưa nhận chỉ ghi nhận issue, còn lỗi sản phẩm tự tạo return request kèm evidence.
    function handleIssueSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        issueMutation.mutate();
    }

    return (
        <>
            <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.45)] sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-xl">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                            Xác nhận đơn hàng
                        </p>
                        <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950">
                            Bạn đã nhận được đơn hàng chưa?
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Xác nhận để chúng tôi cập nhật hành trình chính xác.
                            Bạn có thể bỏ qua phần đánh giá và quay lại sau.
                        </p>
                        {remainingTime ? (
                            <p className="mt-3 text-xs font-medium text-zinc-700">
                                Bạn có 3 ngày để xác nhận. Thời gian còn lại:{' '}
                                {remainingTime}.
                            </p>
                        ) : null}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[330px] lg:grid-cols-1">
                        <Button
                            type="button"
                            onClick={handleReceived}
                            disabled={mutation.isPending}
                            className="h-11 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
                        >
                            {mutation.isPending
                                ? 'Đang cập nhật...'
                                : 'Hoàn thành đơn hàng'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIssueOpen(true)}
                            disabled={mutation.isPending}
                            className="h-11 rounded-xl border-zinc-300 px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                        >
                            Chưa nhận / Có vấn đề
                        </Button>
                    </div>
                </div>
            </section>

            {issueOpen ? (
                <section className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                    <header className="border-b border-zinc-100 bg-zinc-50/70 px-5 py-5 text-left sm:px-7">
                        <h3 className="text-xl font-bold tracking-tight text-zinc-950">
                            Xử lý chưa nhận / có vấn đề
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Nhập thông tin một lần. Nếu sản phẩm có vấn đề, hệ
                            thống sẽ đồng thời tạo yêu cầu hoàn hàng và ghi nhận
                            vấn đề của đơn.
                        </p>
                    </header>
                    <form onSubmit={handleIssueSubmit}>
                        <div className="space-y-5 px-6 py-6 sm:px-7">
                            <fieldset>
                                <legend className="text-sm font-semibold text-zinc-950">
                                    Vấn đề của bạn là gì?
                                </legend>
                                <div className="mt-3 grid gap-2">
                                    {ISSUE_REASONS.map((value) => (
                                        <label
                                            key={value}
                                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 text-sm transition-colors hover:border-zinc-400 has-[:checked]:border-zinc-950 has-[:checked]:bg-zinc-50"
                                        >
                                            <input
                                                ref={
                                                    value === ISSUE_REASONS[0]
                                                        ? firstIssueInputRef
                                                        : undefined
                                                }
                                                type="radio"
                                                name="issue-reason"
                                                value={value}
                                                checked={reason === value}
                                                onChange={() =>
                                                    setReason(value)
                                                }
                                                className="size-4 accent-black"
                                            />
                                            <span>
                                                {getIssueReasonLabel(value)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            {isReturnRequest ? (
                                <fieldset>
                                    <legend className="text-sm font-semibold text-zinc-950">
                                        Sản phẩm bị ảnh hưởng
                                    </legend>
                                    <div className="mt-3 space-y-2">
                                        {order.items.map((item) => (
                                            <label
                                                key={item.id}
                                                className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 text-sm hover:border-zinc-400"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItemIds.includes(
                                                        item.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleItem(item.id)
                                                    }
                                                    className="size-4 accent-black"
                                                />
                                                <span className="min-w-0 truncate">
                                                    {item.productName}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ) : null}

                            {reason ? (
                                <div>
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Bằng chứng{' '}
                                        {evidenceRequired ? (
                                            <span className="font-normal text-red-500">
                                                (bắt buộc ảnh)
                                            </span>
                                        ) : (
                                            <span className="font-normal text-zinc-400">
                                                (không bắt buộc)
                                            </span>
                                        )}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs font-medium hover:border-zinc-950">
                                            <ImagePlus className="size-4" />{' '}
                                            Thêm ảnh
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
                                            <Upload className="size-4" /> Thêm
                                            video
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
                                    <p className="mt-1.5 text-xs text-zinc-400">
                                        Tối đa 5 ảnh và 1 video.
                                    </p>
                                    {localMedia.length > 0 ? (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {localMedia.map((media, index) => (
                                                <ImageLightboxThumbnail
                                                    key={media.url}
                                                    item={media}
                                                    onClick={() =>
                                                        setActiveMedia(index)
                                                    }
                                                    onRemove={() =>
                                                        handleRemoveMedia(
                                                            media.type ===
                                                                'image'
                                                                ? index
                                                                : index -
                                                                      images.length,
                                                            media.type,
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            <div>
                                <label
                                    htmlFor="delivery-issue-note"
                                    className="text-sm font-semibold text-zinc-950"
                                >
                                    Mô tả thêm{' '}
                                    <span className="font-normal text-zinc-400">
                                        (không bắt buộc)
                                    </span>
                                </label>
                                <Textarea
                                    id="delivery-issue-note"
                                    value={note}
                                    onChange={(event) =>
                                        setNote(event.target.value)
                                    }
                                    placeholder="Mô tả ngắn tình trạng đơn hàng hoặc sản phẩm..."
                                    className="mt-3 min-h-24 resize-none rounded-xl border-zinc-200"
                                    maxLength={1000}
                                />
                                <p className="mt-1.5 text-right text-[11px] text-zinc-400">
                                    {note.length}/1000
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIssueOpen(false)}
                                disabled={issueMutation.isPending}
                                className="h-10 rounded-xl"
                            >
                                Thu gọn
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !canSubmitIssue || issueMutation.isPending
                                }
                                className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                            >
                                {issueMutation.isPending
                                    ? 'Đang gửi...'
                                    : isReturnRequest
                                      ? 'Gửi yêu cầu hoàn hàng'
                                      : 'Gửi thông tin'}
                            </Button>
                        </div>
                    </form>
                </section>
            ) : null}
            {activeMedia !== null ? (
                <ImageLightbox
                    media={localMedia}
                    initialIndex={activeMedia}
                    title="Xem bằng chứng"
                    altPrefix="Bằng chứng"
                    onClose={() => setActiveMedia(null)}
                />
            ) : null}
        </>
    );
}
