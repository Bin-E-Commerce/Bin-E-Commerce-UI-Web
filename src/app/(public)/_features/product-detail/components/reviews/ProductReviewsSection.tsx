'use client';

import { MessageSquareText, Star } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { ProductDetail } from '@/services/product';
import { getProductRating } from '@/features/products/utils/product-formatters';
import { ProductReviewCard } from './ProductReviewCard';

interface ProductReviewsSectionProps {
    product: ProductDetail;
}

// Lọc đánh giá theo số sao ngay trên client vì toàn bộ review của product đã có trong response chi tiết.
export function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const rating = getProductRating(product);
    const approvedReviews = product.reviews.filter(
        (review) => review.status.toLowerCase() === 'approved',
    );
    const visibleReviews = ratingFilter
        ? approvedReviews.filter((review) => review.rating === ratingFilter)
        : approvedReviews;

    return (
        <section className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-5 py-4 sm:px-7">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                    Trải nghiệm người mua
                </p>
                <h2 className="mt-1 text-xl font-bold text-zinc-950">
                    Đánh giá sản phẩm
                </h2>
            </div>

            <div className="grid gap-5 border-b border-zinc-200 bg-zinc-50 px-5 py-5 sm:grid-cols-[180px_1fr] sm:px-7">
                <div>
                    <p className="text-3xl font-bold text-red-600">
                        {rating > 0 ? rating.toFixed(1) : '0.0'}
                        <span className="text-base font-medium text-zinc-500"> / 5</span>
                    </p>
                    <div className="mt-2 flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                                key={index}
                                className={cn(
                                    'h-4 w-4',
                                    index < Math.round(rating)
                                        ? 'fill-current'
                                        : 'text-zinc-300',
                                )}
                            />
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                        {product.reviewCount} lượt đánh giá
                    </p>
                </div>

                <div className="flex flex-wrap content-start gap-2">
                    <ReviewFilterButton
                        label="Tất cả"
                        active={ratingFilter === null}
                        onClick={() => setRatingFilter(null)}
                    />
                    {[5, 4, 3, 2, 1].map((star) => (
                        <ReviewFilterButton
                            key={star}
                            label={`${star} sao`}
                            active={ratingFilter === star}
                            onClick={() => setRatingFilter(star)}
                        />
                    ))}
                </div>
            </div>

            <div className="px-5 sm:px-7">
                {visibleReviews.length > 0 ? (
                    visibleReviews.map((review) => (
                        <ProductReviewCard key={review.id} review={review} />
                    ))
                ) : (
                    <div className="flex min-h-52 flex-col items-center justify-center py-10 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                            <MessageSquareText className="h-5 w-5" />
                        </span>
                        <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                            Chưa có đánh giá phù hợp
                        </h3>
                        <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">
                            Đánh giá từ người mua sẽ được hiển thị tại đây sau khi được kiểm duyệt.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

interface ReviewFilterButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

// Giữ trạng thái bộ lọc sao rõ ràng và có vùng bấm phù hợp trên thiết bị cảm ứng.
function ReviewFilterButton({
    label,
    active,
    onClick,
}: ReviewFilterButtonProps) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={cn(
                'h-9 rounded border px-4 text-sm transition-colors',
                active
                    ? 'border-zinc-950 bg-zinc-950 text-white'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-500',
            )}
        >
            {label}
        </button>
    );
}
