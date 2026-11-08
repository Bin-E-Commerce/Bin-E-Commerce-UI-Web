// File này hiển thị quyết định nhận hàng sau khi carrier báo giao thành công.
// Component không tự đổi order; mọi chuyển trạng thái đều đi qua mutation Order Service để giữ ownership và idempotency.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Check,
    CheckCircle2,
    CircleAlert,
    Clock3,
    ImagePlus,
    Package,
    PackageCheck,
    Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import {
    confirmOrderDelivery,
    createOrderReturn,
    type DeliveryIssueReason,
    type CustomerOrderReturnReason,
} from '@/services/order';
import { mediaService, type ReviewMediaCleanupAsset } from '@/services/media';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    ImageLightbox,
    ImageLightboxThumbnail,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';
import { uploadReturnMedia } from '../utils/return-media-upload';
import { ReturnRefundBankAccountPicker } from './return-refund-bank-account-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useConfirmOrderDelivery } from '../hooks/use-delivery-confirmation';
import type { DeliveryConfirmationCardProps } from '../types/delivery-confirmation-card.type';

// Form này chỉ nhận lý do hoàn hàng sau giao; mã OTHER chỉ nối tương thích với issue legacy.
const ISSUE_REASONS = [
    'DAMAGED',
    'WRONG_ITEM',
    'MISSING_ITEM',
    'NOT_AS_DESCRIBED',
    'CHANGE_OF_MIND',
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

// Fulfillment DELIVERED là điều kiện backend kiểm tra cho cả hai quyết định; confirmation status có thể cũ sau khi hủy return.
function shouldRenderConfirmation(order: OrderResponse): boolean {
    return order.fulfillmentStatus === 'DELIVERED';
}

// Chuyển mã vấn đề thành nhãn trực tiếp trong form để Customer không phải đọc enum kỹ thuật.
function getIssueReasonLabel(reason: (typeof ISSUE_REASONS)[number]): string {
    const labels: Record<(typeof ISSUE_REASONS)[number], string> = {
        DAMAGED: 'Sản phẩm bị hư hỏng',
        WRONG_ITEM: 'Giao sai sản phẩm',
        MISSING_ITEM: 'Thiếu sản phẩm',
        NOT_AS_DESCRIBED: 'Sản phẩm không đúng mô tả',
        CHANGE_OF_MIND: 'Không còn nhu cầu',
    };
    return labels[reason];
}

// Mã issue legacy chỉ có OTHER cho các lý do return chi tiết mới được thêm; return request vẫn lưu reason chính xác.
function toDeliveryIssueReason(
    reason: (typeof ISSUE_REASONS)[number],
): DeliveryIssueReason {
    if (reason === 'NOT_AS_DESCRIBED' || reason === 'CHANGE_OF_MIND')
        return 'OTHER';
    return reason;
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

// Render xác nhận giao hàng và form hoàn sản phẩm, chuyển kết quả hoàn tất lên trang cha để popup review không bị unmount.
// Form chỉ tạo return sau khi khách đã nhận đơn; lỗi sản phẩm cần bằng chứng, còn đổi ý được gửi không kèm ảnh/video.
// Return được tạo trước rồi mới liên kết vào delivery issue để backend giữ một lịch sử xử lý thống nhất cho order.
export function DeliveryConfirmationCard({
    order,
    onOrderCompleted,
}: DeliveryConfirmationCardProps) {
    const queryClient = useQueryClient();
    const [issueOpen, setIssueOpen] = useState(false);
    const [reason, setReason] = useState<(typeof ISSUE_REASONS)[number] | ''>(
        '',
    );
    const [note, setNote] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [savedRefundBankAccountId, setSavedRefundBankAccountId] =
        useState('');
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [activeMedia, setActiveMedia] = useState<number | null>(null);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);
    const mutation = useConfirmOrderDelivery(order.id, onOrderCompleted);
    const [remainingTime, setRemainingTime] = useState(() =>
        formatRemainingTime(order.deliveryConfirmation.deadline),
    );
    const selectedShopIds = new Set(
        order.items
            .filter((item) => selectedItemIds.includes(item.id))
            .map((item) => item.sellerShopId)
            .filter(Boolean),
    );
    const isReturnRequest = Boolean(reason);
    // Chỉ các lý do lỗi sản phẩm cần attachment; khách đổi ý vẫn phải chọn item và tài khoản nhận hoàn.
    const evidenceRequired = Boolean(reason && reason !== 'CHANGE_OF_MIND');
    const hasEvidence = images.length > 0 || videos.length > 0;
    const canSubmitIssue =
        Boolean(reason) &&
        (!isReturnRequest || selectedItemIds.length > 0) &&
        (!isReturnRequest || Boolean(savedRefundBankAccountId)) &&
        (!evidenceRequired || hasEvidence);
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

    // Upload bằng chứng nếu có rồi tạo return trước, sau đó gắn ID return vào issue để hai lịch sử không bị tách rời.
    // Chỉ lỗi sản phẩm bắt buộc có file; lý do đổi ý vẫn cần item và tài khoản nhưng gửi evidence rỗng hợp lệ.
    // Nếu bước liên kết issue lỗi sau khi return đã lưu, giữ asset để không làm hỏng bằng chứng đang được request tham chiếu.
    const issueMutation = useMutation({
        mutationFn: async () => {
            if (!reason) throw new Error('Vui lòng chọn vấn đề của đơn hàng.');

            if (selectedItemIds.length === 0) {
                throw new Error('Vui lòng chọn sản phẩm bị ảnh hưởng.');
            }
            // Mọi lý do còn lại đều là return sau giao nên phải có nơi nhận tiền hoàn đã xác minh.
            if (!savedRefundBankAccountId) {
                throw new Error('Vui lòng chọn tài khoản nhận tiền hoàn.');
            }
            // Chặn trước upload và tạo request với lỗi sản phẩm; khách đổi ý được gửi mà không tạo attachment.
            if (evidenceRequired && !hasEvidence) {
                throw new Error(
                    'Vui lòng thêm ít nhất một ảnh hoặc video bằng chứng.',
                );
            }

            let uploadedAssets: ReviewMediaCleanupAsset[] = [];
            let returnCreated = false;
            let returnRequestId: string | undefined;
            try {
                const media =
                    images.length || videos.length
                        ? await uploadReturnMedia(images, videos)
                        : {
                              evidence: [],
                              uploadedAssets: [] as ReviewMediaCleanupAsset[],
                          };
                uploadedAssets = media.uploadedAssets;

                const returnRequest = await createOrderReturn(order.id, {
                    itemIds: selectedItemIds,
                    reason: reason as CustomerOrderReturnReason,
                    savedRefundBankAccountId,
                    description: note.trim() || undefined,
                    evidence: media.evidence,
                });
                returnCreated = true;
                returnRequestId = returnRequest.id;

                const updatedOrder = await confirmOrderDelivery(order.id, {
                    decision: 'ISSUE',
                    reason: toDeliveryIssueReason(reason),
                    itemIds: selectedItemIds,
                    returnRequestId,
                    note: note.trim() || undefined,
                    evidence: media.evidence,
                });
                return updatedOrder;
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
        onSuccess: async (updatedOrder) => {
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
            toast.success('Đã gửi yêu cầu hoàn hàng.');
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
        setSavedRefundBankAccountId('');
        setImages([]);
        setVideos([]);
        setActiveMedia(null);
    }

    // Gửi yêu cầu sau khi người dùng hoàn tất return; validation trong mutation vẫn bảo vệ mọi đường submit.
    function handleIssueSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        issueMutation.mutate();
    }

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                            <PackageCheck
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">
                                    Bạn đã nhận được đơn hàng chưa?
                                </h2>
                            </div>
                            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-zinc-500">
                                Xác nhận để cập nhật trạng thái đơn hàng. Bạn có
                                thể quay lại đánh giá sản phẩm sau.
                            </p>
                            {remainingTime ? (
                                <div className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                                    <Clock3
                                        className="size-4 shrink-0 text-zinc-500"
                                        aria-hidden="true"
                                    />
                                    <span>Thời hạn xác nhận còn</span>
                                    <span className="font-semibold text-zinc-950">
                                        {remainingTime}
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:w-60 lg:grid-cols-1">
                        <Button
                            type="button"
                            id="confirm-order-received"
                            onClick={handleReceived}
                            disabled={mutation.isPending}
                            className="h-11 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
                        >
                            {mutation.isPending
                                ? 'Đang cập nhật...'
                                : 'Xác nhận đã nhận hàng'}
                        </Button>
                        <Button
                            type="button"
                            id="report-order-issue"
                            variant="outline"
                            onClick={() => setIssueOpen(true)}
                            disabled={mutation.isPending}
                            className="h-11 rounded-xl border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
                        >
                            Yêu cầu hoàn hàng
                        </Button>
                    </div>
                </div>
            </section>

            {issueOpen ? (
                <section
                    id="delivery-issue-form"
                    className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                >
                    <header className="flex items-start gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-5 py-4 text-left sm:px-7">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                            <CircleAlert
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight text-zinc-950">
                                Yêu cầu hoàn hàng
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-zinc-500">
                                Chọn sản phẩm và tài khoản nhận tiền hoàn. Lý do
                                lỗi sản phẩm cần ảnh/video; đổi ý không bắt buộc
                                có bằng chứng.
                            </p>
                        </div>
                    </header>
                    <form onSubmit={handleIssueSubmit}>
                        <div className="space-y-5 px-4 py-5 sm:px-7 sm:py-6">
                            <fieldset>
                                <legend className="text-sm font-semibold text-zinc-950">
                                    Bạn muốn hoàn hàng vì lý do nào?
                                </legend>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                    {ISSUE_REASONS.map((value) => (
                                        <Button
                                            key={value}
                                            type="button"
                                            variant="outline"
                                            aria-pressed={reason === value}
                                            onClick={() => setReason(value)}
                                            className={`h-auto min-h-12 justify-start gap-3 whitespace-normal rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors ${reason === value ? 'border-zinc-950 bg-zinc-50 text-zinc-950 shadow-sm hover:bg-zinc-100' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'}`}
                                        >
                                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white">
                                                {reason === value ? (
                                                    <Check className="size-3.5" />
                                                ) : null}
                                            </span>
                                            <span className="min-w-0">
                                                {getIssueReasonLabel(value)}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            </fieldset>

                            {isReturnRequest ? (
                                <div className="space-y-4">
                                    <fieldset>
                                        <legend className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                                            <Package
                                                className="size-4 text-zinc-500"
                                                aria-hidden="true"
                                            />
                                            Sản phẩm cần hoàn
                                            <span className="font-normal text-zinc-500">
                                                · mỗi yêu cầu thuộc một shop
                                            </span>
                                        </legend>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            {order.items.map((item) => {
                                                // Khóa lựa chọn khác shop sau khi khách chọn sản phẩm đầu tiên.
                                                const selected =
                                                    selectedItemIds.includes(
                                                        item.id,
                                                    );
                                                const locked =
                                                    selectedShopIds.size > 0 &&
                                                    !selectedShopIds.has(
                                                        item.sellerShopId ?? '',
                                                    );

                                                return (
                                                    <Button
                                                        key={item.id}
                                                        type="button"
                                                        variant="outline"
                                                        aria-pressed={selected}
                                                        disabled={locked}
                                                        onClick={() =>
                                                            toggleItem(item.id)
                                                        }
                                                        className={`h-auto min-h-14 min-w-0 justify-start gap-3 whitespace-normal rounded-xl px-3 py-2.5 text-left transition-colors ${selected ? 'border-zinc-950 bg-zinc-50 hover:bg-zinc-100' : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'} ${locked ? 'cursor-not-allowed opacity-45' : ''}`}
                                                    >
                                                        <span
                                                            className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white'}`}
                                                        >
                                                            {selected ? (
                                                                <CheckCircle2 className="size-4" />
                                                            ) : null}
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block truncate text-sm font-semibold text-zinc-950">
                                                                {
                                                                    item.productName
                                                                }
                                                            </span>
                                                            <span className="mt-1 block truncate text-xs font-normal text-zinc-500">
                                                                {
                                                                    item.variantName
                                                                }{' '}
                                                                · SL{' '}
                                                                {item.quantity}
                                                            </span>
                                                        </span>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </fieldset>

                                    <ReturnRefundBankAccountPicker
                                        selectedAccountId={
                                            savedRefundBankAccountId
                                        }
                                        onAccountChange={
                                            setSavedRefundBankAccountId
                                        }
                                    />
                                </div>
                            ) : null}

                            {reason ? (
                                <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                                    <div className="flex h-full min-h-48 flex-col rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-zinc-950">
                                                Bằng chứng{' '}
                                                {evidenceRequired ? (
                                                    <span className="text-red-600">
                                                        · bắt buộc
                                                    </span>
                                                ) : (
                                                    <span className="font-normal text-zinc-500">
                                                        · không bắt buộc
                                                    </span>
                                                )}
                                            </p>
                                            <span className="text-xs text-zinc-500">
                                                Tối đa 5 ảnh, 1 video
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    imageInputRef.current?.click()
                                                }
                                                className="h-9 rounded-lg bg-white px-3 text-xs"
                                            >
                                                <ImagePlus
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                                Thêm ảnh
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    videoInputRef.current?.click()
                                                }
                                                className="h-9 rounded-lg bg-white px-3 text-xs"
                                            >
                                                <Upload
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                                Thêm video
                                            </Button>
                                        </div>
                                        {/* Input gốc là điểm mở bộ chọn tệp của hệ điều hành; thao tác hiển thị dùng Button của design system. */}
                                        <input
                                            ref={imageInputRef}
                                            hidden
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={(event) =>
                                                handleFiles(event, 'image')
                                            }
                                        />
                                        <input
                                            ref={videoInputRef}
                                            hidden
                                            type="file"
                                            accept="video/mp4,video/webm"
                                            onChange={(event) =>
                                                handleFiles(event, 'video')
                                            }
                                        />
                                        {localMedia.length > 0 ? (
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {localMedia.map(
                                                    (media, index) => (
                                                        <ImageLightboxThumbnail
                                                            key={media.url}
                                                            item={media}
                                                            onClick={() =>
                                                                setActiveMedia(
                                                                    index,
                                                                )
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
                                                    ),
                                                )}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex h-full min-h-48 flex-col rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                                        <label
                                            htmlFor="delivery-issue-note"
                                            className="text-sm font-semibold text-zinc-950"
                                        >
                                            Mô tả thêm{' '}
                                            <span className="font-normal text-zinc-500">
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
                                            className="mt-2 min-h-28 flex-1 resize-none rounded-xl border-zinc-200 bg-white"
                                            maxLength={1000}
                                        />
                                        <p className="mt-1.5 text-right text-[11px] text-zinc-400">
                                            {note.length}/1000
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                            <p className="text-xs leading-5 text-zinc-500">
                                {reason === 'CHANGE_OF_MIND'
                                    ? 'Tài khoản nhận tiền là bắt buộc; ảnh/video có thể gửi thêm nếu bạn muốn.'
                                    : reason
                                      ? 'Gửi sản phẩm, tài khoản nhận tiền và bằng chứng để Seller xử lý yêu cầu.'
                                      : 'Chọn lý do, sản phẩm và tài khoản nhận tiền để tiếp tục.'}
                            </p>
                            <div className="flex shrink-0 justify-end gap-2">
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
                                        !canSubmitIssue ||
                                        issueMutation.isPending
                                    }
                                    className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                                >
                                    {issueMutation.isPending
                                        ? 'Đang gửi...'
                                        : 'Gửi yêu cầu hoàn hàng'}
                                </Button>
                            </div>
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
