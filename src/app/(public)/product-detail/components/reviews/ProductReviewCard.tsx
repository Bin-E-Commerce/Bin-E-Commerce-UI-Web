import Image from 'next/image';
import { CheckCircle2, Star, UserRound } from 'lucide-react';

import type { ProductReview } from '@/services/product';

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

// Hiển thị một đánh giá cùng ảnh bằng chứng mà không làm lộ user ID nội bộ trên giao diện công khai.
export function ProductReviewCard({ review }: ProductReviewCardProps) {
    return (
        <article className="grid gap-4 border-b border-zinc-100 py-6 sm:grid-cols-[180px_1fr]">
            <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                        <UserRound className="h-4 w-4 text-zinc-500" />
                    </span>
                    Người mua hàng
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã mua sản phẩm
                </p>
            </div>

            <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                                key={index}
                                className={`h-4 w-4 ${index < review.rating ? 'fill-current' : 'text-zinc-200'}`}
                            />
                        ))}
                    </div>
                    <time className="text-xs text-zinc-400">
                        {formatReviewDate(review.createdAt)}
                    </time>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-700">
                    {review.content || 'Người mua không để lại nội dung.'}
                </p>

                {review.images.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {review.images.map((imageUrl, index) => (
                            <div
                                key={`${imageUrl}-${index}`}
                                className="relative h-20 w-20 overflow-hidden rounded border border-zinc-200 bg-zinc-50"
                            >
                                <Image
                                    src={imageUrl}
                                    alt={`Ảnh đánh giá ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </article>
    );
}
