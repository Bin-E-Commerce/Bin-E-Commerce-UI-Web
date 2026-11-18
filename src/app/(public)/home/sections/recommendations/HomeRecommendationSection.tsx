// Section homepage hiển thị kết quả do model xếp hạng và mở rộng sang trang gợi ý.

'use client';

import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeProductSection } from '../products/HomeProductSection';
import { useHomeRecommendations } from './useHomeRecommendations';

// Hiển thị kết quả từ model, đồng thời giữ trạng thái tải/lỗi nhìn thấy được.
export function HomeRecommendationSection() {
    const recommendationQuery = useHomeRecommendations();
    const { initialized, isAuthenticated, getProtectedHref } =
        useCartAuthRedirect();
    const recommendationResult = recommendationQuery.data;

    // Giữ chỗ trong trang khi model đang tải để tránh nhầm với section bị gỡ khỏi production.
    if (recommendationQuery.isPending) {
        return (
            <section
                id="recommendations"
                className="mt-3 border-y border-zinc-200 bg-white"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="border-b border-zinc-200 px-4 py-3 sm:px-6">
                        <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                            Gợi ý hôm nay
                        </h2>
                        <p className="text-xs text-zinc-500 sm:text-sm">
                            Sản phẩm được xếp hạng bằng mô hình AI.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-6">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div key={index} className="space-y-3">
                                <Skeleton className="aspect-square w-full rounded-lg" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Khi request lỗi hoặc model trả danh sách rỗng, giải thích trạng thái và cho phép retry.
    if (!recommendationResult?.items.length) {
        const isError = recommendationQuery.isError;

        return (
            <section
                id="recommendations"
                className="mt-3 border-y border-zinc-200 bg-white"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="border-b border-zinc-200 px-4 py-3 sm:px-6">
                        <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                            Gợi ý hôm nay
                        </h2>
                        <p className="text-xs text-zinc-500 sm:text-sm">
                            Sản phẩm được xếp hạng bằng mô hình AI.
                        </p>
                    </div>
                    <div className="flex min-h-44 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                        <p className="text-sm text-zinc-600">
                            {isError
                                ? 'Dịch vụ gợi ý AI chưa thể tải dữ liệu lúc này.'
                                : 'Chưa có sản phẩm phù hợp để gợi ý lúc này.'}
                        </p>
                        {isError ? (
                            <Button
                                type="button"
                                size="lg"
                                disabled={recommendationQuery.isFetching}
                                onClick={() =>
                                    void recommendationQuery.refetch()
                                }
                            >
                                <RefreshCw
                                    className={
                                        recommendationQuery.isFetching
                                            ? 'animate-spin'
                                            : undefined
                                    }
                                />
                                {recommendationQuery.isFetching
                                    ? 'Đang thử lại'
                                    : 'Thử lại'}
                            </Button>
                        ) : null}
                    </div>
                </div>
            </section>
        );
    }

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
            description="Sản phẩm được xếp hạng bằng mô hình AI."
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
