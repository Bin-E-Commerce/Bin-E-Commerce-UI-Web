// Section homepage hiển thị 20 sản phẩm gợi ý và mở rộng sang trang gợi ý riêng.

'use client';

import Link from 'next/link';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';

import type { PublicProduct } from '@/services/product';
import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { HomeProductSection } from '../products/HomeProductSection';
import { useHomeRecommendations } from './useHomeRecommendations';

interface HomeRecommendationSectionProps {
    products: PublicProduct[];
    hasMoreProducts: boolean;
}

// Trình bày danh sách gợi ý hiện tại và tạo CTA phù hợp với trạng thái phiên.
// Guest được giải thích lợi ích của việc đăng nhập trước khi chuyển sang trang mở rộng;
// user đã đăng nhập được đưa thẳng tới toàn bộ danh sách mà không thay đổi request backend.
export function HomeRecommendationSection({
    products,
    hasMoreProducts,
}: HomeRecommendationSectionProps) {
    const recommendationQuery = useHomeRecommendations();
    const { initialized, isAuthenticated, getProtectedHref } =
        useCartAuthRedirect();
    const recommendedProducts =
        recommendationQuery.data?.items.map((item) => item.product) ?? [];
    const trackingContextByProductId = Object.fromEntries(
        (recommendationQuery.data?.items ?? []).map((item) => [
            item.product.id,
            {
                recommendationRequestId: recommendationQuery.data?.requestId,
                recommendationItemId: item.product.id,
                recommendationSource: item.source,
                recommendationRank: item.rank,
                surface: 'home' as const,
            },
        ]),
    );
    const recommendationReasonByProductId = Object.fromEntries(
        (recommendationQuery.data?.items ?? []).map((item) => [
            item.product.id,
            item.reasons[0] ?? 'Một lựa chọn phù hợp để bạn khám phá',
        ]),
    );
    const displayedProducts =
        recommendedProducts.length > 0 ? recommendedProducts : products;
    // Guest luôn cần thấy CTA mở rộng sau khi auth đã hydrate, vì quyền xem thêm phụ thuộc đăng nhập
    // chứ không phụ thuộc riêng vào totalPages hiện tại của result set recommendation.
    const shouldShowMoreCta =
        initialized &&
        (!isAuthenticated ||
            (recommendationQuery.data
                ? recommendationQuery.data.totalPages > 1
                : hasMoreProducts));
    if (displayedProducts.length === 0) return null;

    return (
        <HomeProductSection
            id="recommendations"
            eyebrow="Dành cho bạn"
            title="Gợi ý hôm nay"
            description="Khám phá những sản phẩm được chọn theo sở thích của bạn."
            products={displayedProducts}
            mode="grid"
            trackingContextByProductId={trackingContextByProductId}
            recommendationReasonByProductId={recommendationReasonByProductId}
            footer={
                shouldShowMoreCta ? (
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-5 sm:py-5">
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                    {isAuthenticated ? (
                                        <Sparkles className="h-4 w-4" />
                                    ) : (
                                        <LockKeyhole className="h-4 w-4" />
                                    )}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-zinc-950 sm:text-base">
                                        {isAuthenticated
                                            ? 'Vẫn còn nhiều lựa chọn hợp gu đang chờ bạn.'
                                            : 'Mở khóa những gợi ý hợp gu hơn.'}
                                    </p>
                                    <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">
                                        {isAuthenticated
                                            ? 'Khám phá thêm sản phẩm từ nhiều ngành hàng, được sắp xếp theo những gì bạn quan tâm.'
                                            : 'Đăng nhập để Bin ghi nhớ sở thích, lượt xem và giỏ hàng, rồi chọn ra những sản phẩm phù hợp hơn cho bạn.'}
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={
                                    initialized
                                        ? getProtectedHref('/goi-y-hom-nay')
                                        : '#recommendations'
                                }
                                aria-disabled={!initialized}
                                onClick={(event) => {
                                    if (!initialized) event.preventDefault();
                                }}
                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                            >
                                {!isAuthenticated ? (
                                    <LockKeyhole className="h-4 w-4" />
                                ) : null}
                                {isAuthenticated
                                    ? 'Xem toàn bộ gợi ý'
                                    : 'Đăng nhập để khám phá thêm'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                ) : null
            }
        />
    );
}
