// Section homepage hiển thị kết quả do model xếp hạng và mở rộng sang trang gợi ý.

'use client';

import Link from 'next/link';

import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { HomeProductSection } from '../products/HomeProductSection';
import { useHomeRecommendations } from './useHomeRecommendations';

// Chỉ hiển thị kết quả Recommendation Service; nếu query lỗi hoặc rỗng thì ẩn
// section, không gắn nhãn cá nhân hóa cho catalog. CTA mở trang gợi ý đầy đủ.
export function HomeRecommendationSection() {
    const recommendationQuery = useHomeRecommendations();
    const { initialized, isAuthenticated, getProtectedHref } =
        useCartAuthRedirect();
    const recommendationResult = recommendationQuery.data;

    // Không thay kết quả thiếu/lỗi bằng catalog; chờ lần tải thành công hoặc ẩn section.
    if (!recommendationResult?.items.length) return null;

    const recommendedProducts = recommendationResult.items.map(
        (item) => item.product,
    );
    const trackingContextByProductId = Object.fromEntries(
        recommendationResult.items.map((item) => [
            item.product.id,
            {
                recommendationRequestId: recommendationResult.requestId,
                recommendationItemId: item.recommendationItemId,
                recommendationSource: item.source,
                recommendationRank: item.rank,
                surface: 'home' as const,
                recommendationPolicyVersion:
                    recommendationResult.rankingPolicyVersion,
                recommendationRankingMode: recommendationResult.rankingMode,
            },
        ]),
    );
    // Không tự tạo lý do khi response model không có explanation cho sản phẩm.
    const recommendationReasonByProductId = Object.fromEntries(
        recommendationResult.items.flatMap((item) => {
            const reason = item.reasons[0];
            if (!reason) return [];
            return [[item.product.id, reason] as const];
        }),
    );
    // Chỉ tạo CTA sau hydration vì đường dẫn đích phụ thuộc trạng thái đăng nhập đã khởi tạo.
    const shouldShowMoreCta = initialized;

    return (
        <HomeProductSection
            id="recommendations"
            title="Gợi ý hôm nay"
            description="Khám phá những sản phẩm được chọn theo sở thích của bạn."
            products={recommendedProducts}
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
                            {isAuthenticated
                                ? 'Xem thêm'
                                : 'Đăng nhập để xem thêm'}
                        </Link>
                    </div>
                ) : null
            }
        />
    );
}
