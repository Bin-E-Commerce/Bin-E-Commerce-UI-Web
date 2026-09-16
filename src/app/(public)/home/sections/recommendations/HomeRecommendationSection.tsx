// Section homepage hiển thị 20 sản phẩm gợi ý và mở rộng sang trang gợi ý riêng.

'use client';

import Link from 'next/link';

import type { PublicProduct } from '@/services/product';
import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { HomeProductSection } from '../products/HomeProductSection';
import { useHomeRecommendations } from './useHomeRecommendations';

interface HomeRecommendationSectionProps {
    products: PublicProduct[];
}

// Trình bày danh sách gợi ý hiện tại và tạo CTA phù hợp với trạng thái phiên.
// Guest được giải thích lợi ích của việc đăng nhập trước khi chuyển sang trang mở rộng;
// user đã đăng nhập được đưa thẳng tới toàn bộ danh sách mà không thay đổi request backend.
export function HomeRecommendationSection({
    products,
}: HomeRecommendationSectionProps) {
    const recommendationQuery = useHomeRecommendations();
    const { initialized, getProtectedHref } = useCartAuthRedirect();
    const recommendedProducts =
        recommendationQuery.data?.items.map((item) => item.product) ?? [];
    const trackingContextByProductId = Object.fromEntries(
        (recommendationQuery.data?.items ?? []).map((item) => [
            item.product.id,
            {
                recommendationRequestId: recommendationQuery.data?.requestId,
                recommendationItemId: item.recommendationItemId,
                recommendationSource: item.source,
                recommendationRank: item.rank,
                surface: 'home' as const,
                recommendationPolicyVersion:
                    recommendationQuery.data?.rankingPolicyVersion,
                recommendationRankingMode:
                    recommendationQuery.data?.rankingMode,
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
    // CTA luôn được giữ khi section có sản phẩm để người dùng luôn có lối vào trang gợi ý.
    // Guest được đưa sang login; user đã đăng nhập đi thẳng đến trang gợi ý.
    const shouldShowMoreCta = initialized && displayedProducts.length > 0;
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
                    <div className="flex justify-center">
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
                            className="inline-flex items-center rounded-md border border-zinc-900 px-5 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                        >
                            Xem thêm
                        </Link>
                    </div>
                ) : null
            }
        />
    );
}
