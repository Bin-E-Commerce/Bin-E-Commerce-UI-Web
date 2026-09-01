// File này hiển thị review tùy chọn theo từng sản phẩm sau khi đơn đã giao.
// Customer bắt buộc chọn sao; tiêu đề, nội dung và ảnh là phần mở rộng, chỉ upload khi submit để tránh asset rác.
// Component cho phép bỏ qua hoàn toàn; chỉ khi khách bấm gửi mới yêu cầu rating, còn comment là nội dung tùy chọn.

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pencil, Star } from 'lucide-react';
import { toast } from 'sonner';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { mediaService, type ReviewMediaCleanupAsset } from '@/services/media';
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import type { OrderReviewItemStatus } from '@/services/product';
import { useCreateOrderReview, useOrderReviewStatus, useUpdateOrderReview } from '../hooks/use-delivery-confirmation';
import { uploadReviewMedia } from '../utils/review-media-upload';
import { ReviewMediaUploader } from './review-media-uploader';

type OrderReviewPanelProps = {
    order: OrderResponse;
};

// Hiển thị ngày hết hạn review theo locale hiện tại, fallback về null để UI không hiện deadline sai.
function formatReviewDeadline(deadline: string | null): string | null {
    if (!deadline) return null;
    const date = new Date(deadline);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(date);
}

// Render review độc lập cho từng item để Customer xem lại hoặc chỉnh sửa đúng sản phẩm đã chọn.
// Khi review đã tồn tại, form khởi tạo từ snapshot server và chỉ mở sau khi Customer bấm chỉnh sửa.
// Media cũ được quản lý tách khỏi File mới để Customer có thể xóa từng ảnh/video mà không phải upload lại toàn bộ.
function ReviewItemComposer({ orderId, item }: { orderId: string; item: OrderReviewItemStatus }) {
    const existingReview = item.review;
    const [editing, setEditing] = useState(!existingReview);
    const [rating, setRating] = useState(existingReview?.rating ?? 0);
    const [title, setTitle] = useState(existingReview?.title ?? '');
    const [content, setContent] = useState(existingReview?.content ?? '');
    const [isAnonymous, setIsAnonymous] = useState(existingReview?.isAnonymous ?? false);
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState(existingReview?.images ?? []);
    const [existingVideos, setExistingVideos] = useState(existingReview?.videos ?? []);
    const [uploading, setUploading] = useState(false);
    const [skipped, setSkipped] = useState(false);
    const createMutation = useCreateOrderReview(orderId);
    const updateMutation = useUpdateOrderReview(orderId);
    const mutation = existingReview ? updateMutation : createMutation;

    if (skipped && !existingReview) {
        return <p className="text-xs text-zinc-500">Bạn đã bỏ qua sản phẩm này. Có thể quay lại đánh giá trước thời hạn.</p>;
    }
    if (existingReview && !editing) {
        return (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-500" aria-label={`${existingReview.rating} sao`}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={index} className="size-4" fill={index < existingReview.rating ? 'currentColor' : 'none'} />
                        ))}
                        <span className="ml-1 text-xs font-semibold text-zinc-600">{existingReview.rating}/5</span>
                    </div>
                    {item.canEdit ? (
                        <Button type="button" variant="outline" className="h-8 gap-1.5 rounded-lg border-zinc-300 bg-white px-3 text-xs" onClick={() => setEditing(true)}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Chỉnh sửa
                        </Button>
                    ) : null}
                </div>
                {existingReview.title ? <p className="mt-2 text-sm font-semibold text-zinc-900">{existingReview.title}</p> : null}
                {existingReview.content ? <p className="mt-1 whitespace-pre-line text-sm leading-6 text-zinc-600">{existingReview.content}</p> : null}
                <p className="mt-2 text-xs text-zinc-500">Tên hiển thị: {existingReview.isAnonymous ? 'Người mua ẩn danh' : 'Tên tài khoản của bạn'}</p>
                <p className="mt-2 text-xs font-medium text-zinc-500">Đã gửi đánh giá{item.canEdit ? '' : ' · Đã hết hạn chỉnh sửa'}</p>
            </div>
        );
    }
    if (!item.canReview && !existingReview) {
        return <p className="text-xs text-zinc-500">Sản phẩm hiện chưa thể đánh giá.</p>;
    }

    // Upload ảnh rồi gửi review trong một handler; nếu upload lỗi thì không tạo review thiếu ảnh và vẫn cho customer thử lại.
    async function handleSubmit(): Promise<void> {
        if (rating === 0) return;
        setUploading(true);
        let uploadedAssets: ReviewMediaCleanupAsset[] = [];
        try {
            const { imageUrls, videoUrls, uploadedAssets: newUploadedAssets } = await uploadReviewMedia(images, videos);
            uploadedAssets = newUploadedAssets;
            const reviewInput = {
                productId: item.productId,
                rating,
                title: title.trim() || undefined,
                content: content.trim() || undefined,
                images: [...existingImages, ...imageUrls],
                videos: [...existingVideos, ...videoUrls],
                isAnonymous,
            };
            if (existingReview) {
                await updateMutation.mutateAsync({ reviewId: existingReview.id, ...reviewInput });
                setEditing(false);
            } else {
                await createMutation.mutateAsync({ orderItemId: item.orderItemId, ...reviewInput });
            }
        } catch {
            // Endpoint cleanup chỉ xóa asset chưa được review nào tham chiếu nên an toàn cả khi request đã lưu nhưng phản hồi lỗi.
            if (uploadedAssets.length > 0) {
                await mediaService.cleanupUploadedReviewAssets(uploadedAssets).catch(() => undefined);
            }
            // UI đã có toast ở mutation; lỗi upload cần thông báo riêng để customer biết ảnh chưa được gửi.
            toast.error('Không thể tải ảnh hoặc video đánh giá. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Chia sẻ trải nghiệm</p>
            <div className="mt-3 flex items-center gap-1" role="radiogroup" aria-label={`Đánh giá ${item.productName}`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} sao`} onClick={() => setRating(star)} className={`rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${star <= rating ? 'text-amber-400' : 'text-amber-200 hover:text-amber-400'}`}>
                        <Star className="size-7" fill="currentColor" aria-hidden="true" />
                    </button>
                ))}
                <span className="ml-2 text-xs text-zinc-500">{rating > 0 ? `${rating}/5` : 'Chọn số sao'}</span>
            </div>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề ngắn (không bắt buộc)" maxLength={200} className="mt-3 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950" />
            <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Bạn cảm nhận thế nào về sản phẩm? (không bắt buộc)" maxLength={2000} className="mt-3 min-h-24 resize-none rounded-xl border-zinc-200 bg-white" />
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs leading-4 text-zinc-600">
                <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} className="size-4 shrink-0 cursor-pointer accent-zinc-950" />
                <span>Ẩn tên và ảnh đại diện khi hiển thị đánh giá</span>
            </label>
            <ReviewMediaUploader
                images={images}
                videos={videos}
                existingImages={existingImages}
                existingVideos={existingVideos}
                onImagesChange={setImages}
                onVideosChange={setVideos}
                onExistingImagesChange={setExistingImages}
                onExistingVideosChange={setExistingVideos}
                disabled={uploading || mutation.isPending}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {existingReview ? (
                    <button type="button" onClick={() => setEditing(false)} disabled={uploading || mutation.isPending} className="text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline">Hủy</button>
                ) : (
                    <button type="button" onClick={() => setSkipped(true)} className="text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline">Bỏ qua</button>
                )}
                <Button type="button" onClick={() => void handleSubmit()} disabled={!rating || uploading || mutation.isPending} className="h-9 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white hover:bg-zinc-800">{uploading ? 'Đang tải media...' : mutation.isPending ? 'Đang lưu...' : existingReview ? 'Lưu thay đổi' : 'Gửi đánh giá'}</Button>
            </div>
        </div>
    );
}

// Chỉ mở review panel sau delivery/completed và không có issue mở; query review được gom thành một request theo order.
export function OrderReviewPanel({ order }: OrderReviewPanelProps) {
    const eligibleStage = order.fulfillmentStatus === 'DELIVERED' || order.fulfillmentStatus === 'COMPLETED';
    const enabled = eligibleStage && order.deliveryConfirmation.status !== 'ISSUE_REPORTED';
    const query = useOrderReviewStatus(order.id, enabled);

    if (!enabled || query.isPending || query.isError || !query.data) return null;
    if (!query.data.items.some((item) => item.canReview || item.review)) return null;

    const deadline = formatReviewDeadline(query.data.reviewDeadline);

    return (
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Đánh giá tùy chọn</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950">Bạn thấy sản phẩm thế nào?</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Không bắt buộc đánh giá. Nếu muốn chia sẻ, bạn có thể đánh giá từng sản phẩm trước {deadline ?? 'hết thời hạn'}.</p>
            </div>
            <div className="divide-y divide-zinc-100 px-5 sm:px-6">
                {query.data.items.map((item) => (
                    <div key={item.orderItemId} className="flex gap-4 py-5">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                            {item.imageUrl ? <Image src={item.imageUrl} alt={item.productName} fill sizes="64px" className="object-cover" /> : <div className="flex size-full items-center justify-center text-xs font-bold text-zinc-400">BIN</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-zinc-950">{item.productName}</p>
                            <p className="mt-1 text-xs text-zinc-500">{item.variantName}</p>
                            <ReviewItemComposer orderId={order.id} item={item} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
