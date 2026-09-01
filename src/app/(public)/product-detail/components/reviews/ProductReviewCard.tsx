// File này hiển thị một review verified theo read model public của sản phẩm.
// Card giữ người mua, sao, thời gian, biến thể, nội dung, ảnh minh chứng và like; identity nội bộ không render.
'use client';

import Image from 'next/image';
import { Heart, Star, UserRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { productService, type ProductReview } from '@/services/product';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { ImageLightbox } from '@/common/reviews/components/ImageLightbox';

interface ProductReviewCardProps {
    review: ProductReview;
}

const REVIEW_DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

// Định dạng ngày review và fallback an toàn khi nguồn ngoài trả thời gian không hợp lệ.
function formatReviewDate(createdAt: string): string {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime())
        ? 'Không rõ thời gian'
        : REVIEW_DATE_FORMATTER.format(date);
}

// Nhận biết review đã được chỉnh sửa bằng timestamp server để Customer thấy lịch sử hiển thị minh bạch.
function isReviewEdited(review: ProductReview): boolean {
    if (!review.updatedAt) return false;
    const createdTime = new Date(review.createdAt).getTime();
    const updatedTime = new Date(review.updatedAt).getTime();
    return Number.isFinite(createdTime) && Number.isFinite(updatedTime) && updatedTime - createdTime > 1000;
}

// Tao avatar chu cai cho review legacy hoac tai khoan chua co avatar URL.
function getReviewerInitials(name: string): string {
    const initials = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return initials || 'KH';
}

// Chi render anh tu URL hop le voi cau hinh Image hien tai; URL loi van fallback ve avatar chu cai.
function canRenderReviewerAvatar(url: string | null | undefined): url is string {
    return Boolean(url && (url.startsWith('/') || url.startsWith('https://')));
}

// Hiển thị một đánh giá cùng ảnh bằng chứng mà không làm lộ user ID nội bộ trên giao diện công khai.
export function ProductReviewCard({ review }: ProductReviewCardProps) {
    const isAnonymous = review.isAnonymous ?? false;
    const reviewerName = isAnonymous ? 'Người mua ẩn danh' : review.reviewerName?.trim() || 'Người mua hàng';
    const [liked, setLiked] = useState(review.likedByCurrentUser ?? false);
    const [likeCount, setLikeCount] = useState(review.likeCount ?? 0);
    const [isPending, setIsPending] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    // Gửi like/unlike lên backend rồi dùng count chuẩn từ server để tránh sai số khi nhiều tab cùng thao tác.
    async function handleLike(): Promise<void> {
        if (isPending) return;
        setIsPending(true);
        try {
            const response = liked
                ? await productService.unlikeReview(review.id)
                : await productService.likeReview(review.id);
            setLiked(response.liked);
            setLikeCount(response.likeCount);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsPending(false);
        }
    }

    return (
        <article className="border-b border-zinc-100 py-6 last:border-b-0">
            <div className="flex gap-3 sm:gap-4">
                <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-950 text-xs font-bold text-white">
                    {isAnonymous ? (
                        <UserRound className="size-5" aria-label="Người mua ẩn danh" />
                    ) : canRenderReviewerAvatar(review.reviewerAvatarUrl) ? (
                        <Image
                            src={review.reviewerAvatarUrl}
                            alt={`Avatar của ${reviewerName}`}
                            fill
                            sizes="40px"
                            className="object-cover"
                        />
                    ) : (
                        getReviewerInitials(reviewerName)
                    )}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">{reviewerName}</p>
                        </div>
                        <time className="text-xs text-zinc-400">
                            {formatReviewDate(review.createdAt)}
                            {isReviewEdited(review) ? <span> · Đã chỉnh sửa</span> : null}
                        </time>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-amber-400" aria-label={`${review.rating} trên 5 sao`}>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                                key={index}
                                className={`size-4 ${index < review.rating ? 'fill-current' : 'text-zinc-200'}`}
                            />
                        ))}
                        <span className="ml-2 text-xs font-medium text-zinc-500">{review.rating}/5</span>
                    </div>
                    {review.variantName ? <p className="mt-2 text-xs text-zinc-500">Phân loại hàng: <span className="text-zinc-700">{review.variantName}</span></p> : null}
                    {review.title ? <h3 className="mt-4 text-sm font-semibold text-zinc-950">{review.title}</h3> : null}
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-700">
                        {review.content || 'Người mua không để lại nội dung.'}
                    </p>

                    {review.images.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {review.images.map((imageUrl, index) => (
                                <button
                                    key={`${imageUrl}-${index}`}
                                    type="button"
                                    onClick={() => setSelectedImageIndex(index)}
                                    aria-label={`Xem lớn ảnh đánh giá ${index + 1}`}
                                    className="group relative size-20 cursor-zoom-in overflow-hidden rounded border border-zinc-200 bg-zinc-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                                >
                                    <Image src={imageUrl} alt={`Ảnh đánh giá ${index + 1}`} fill sizes="80px" className="object-cover" />
                                    <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/35 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        <span className="text-[10px] font-semibold">Xem ảnh</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : null}
                    {review.videos?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {review.videos.map((videoUrl, index) => (
                                <video key={`${videoUrl}-${index}`} src={videoUrl} controls preload="metadata" className="max-h-56 w-full max-w-sm rounded-xl border border-zinc-200 bg-zinc-950" aria-label={`Video đánh giá ${index + 1}`} />
                            ))}
                        </div>
                    ) : null}
                    <button type="button" onClick={() => void handleLike()} disabled={isPending} aria-pressed={liked} className={`mt-5 inline-flex cursor-pointer items-center gap-1.5 text-xs transition-colors disabled:cursor-wait disabled:opacity-60 ${liked ? 'font-semibold text-red-500' : 'text-zinc-400 hover:text-red-500'}`}>
                        <Heart className="size-4" fill={liked ? 'currentColor' : 'none'} aria-hidden="true" />
                        <span>Hữu ích</span>
                        <span>{likeCount}</span>
                    </button>
                </div>
            </div>
            {selectedImageIndex !== null ? (
                <ImageLightbox
                    images={review.images}
                    initialIndex={selectedImageIndex}
                    title="Ảnh đánh giá"
                    altPrefix="Ảnh đánh giá"
                    onClose={() => setSelectedImageIndex(null)}
                />
            ) : null}
        </article>
    );
}
