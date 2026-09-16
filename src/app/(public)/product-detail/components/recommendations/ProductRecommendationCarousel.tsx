// File này sở hữu UI carousel ngang cho product detail; không truy vấn dữ liệu và nhận product/metadata qua props.

'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ProductCard } from '@/app/(public)/products/components/ProductCard';
import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { cn } from '@/lib/utils';
import type { ProductDetailRecommendation } from '../../types/product-detail.types';

interface ProductRecommendationCarouselProps {
    title: string;
    actionLabel: string;
    actionHref: string;
    products: ProductDetailRecommendation[];
    showRecommendationMetadata?: boolean;
    requiresAuth?: boolean;
    showNavigation?: boolean;
    layout?: 'carousel' | 'grid';
    actionPlacement?: 'header' | 'footer';
}

// Carousel dùng chung cho hai nguồn: catalog shop không truyền metadata, recommendation thì giữ đầy đủ attribution.
// Card được dàn thành một hàng ngang với 2/3/6 cột theo breakpoint để không làm thay đổi layout nội dung chính.
// Shop carousel có thể tắt navigation để chỉ hiển thị sáu card đầu và chuyển người dùng sang CTA “Xem tất cả”.
// Khi navigation bật, scroll state được đo lại sau render và khi resize để nút phản ánh đúng viewport hiện tại.
// Layout grid render toàn bộ danh sách thành nhiều hàng; layout carousel chỉ dùng khi cần cuộn ngang.
// Action có thể nằm ở header cho carousel shop hoặc ở footer để grid recommendation không chiếm chỗ cạnh tiêu đề.
export function ProductRecommendationCarousel({
    title,
    actionLabel,
    actionHref,
    products,
    showRecommendationMetadata = false,
    requiresAuth = false,
    showNavigation = true,
    layout = 'carousel',
    actionPlacement = 'header',
}: ProductRecommendationCarouselProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const { initialized, getProtectedHref } = useCartAuthRedirect();
    const isGridLayout = layout === 'grid';
    const isActionDisabled = requiresAuth && !initialized;
    const resolvedActionHref =
        requiresAuth && initialized
            ? getProtectedHref(actionHref)
            : actionHref;

    // Cập nhật trạng thái nút theo scroll container để desktop/mobile đều có affordance khi danh sách vượt viewport.
    const updateScrollState = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        setCanScrollLeft(viewport.scrollLeft > 0);
        setCanScrollRight(
            viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 1,
        );
    }, []);

    // Cuộn gần một viewport thay vì nhảy từng sản phẩm để người dùng vẫn giữ được ngữ cảnh nhóm card.
    const scrollByViewport = (direction: -1 | 1) => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.scrollBy({
            left: direction * viewport.clientWidth * 0.85,
            behavior: 'smooth',
        });
        window.setTimeout(updateScrollState, 350);
    };

    // Đo lại sau khi card render để nút không bị bật sai khi sáu card đã vừa trên desktop.
    useEffect(() => {
        if (!showNavigation || isGridLayout || products.length === 0) return;
        const frame = window.requestAnimationFrame(updateScrollState);
        window.addEventListener('resize', updateScrollState);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [isGridLayout, products.length, showNavigation, updateScrollState]);

    if (products.length === 0) return null;

    return (
        <section className="mx-auto max-w-7xl border-y border-zinc-200 bg-white">
            <div className="px-3 py-6 sm:px-6 lg:px-8">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold uppercase tracking-[0.08em] text-zinc-800 sm:text-lg">
                        {title}
                        </h2>
                        {showNavigation || actionPlacement === 'header' ? (
                            <div className="flex items-center gap-2">
                                {showNavigation ? (
                                    <>
                                        <button
                                            type="button"
                                            aria-label={`Cuộn trái: ${title}`}
                                            disabled={!canScrollLeft}
                                            onClick={() => scrollByViewport(-1)}
                                            className="hidden rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-30 sm:inline-flex"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={`Cuộn phải: ${title}`}
                                            disabled={!canScrollRight}
                                            onClick={() => scrollByViewport(1)}
                                            className="hidden rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-30 sm:inline-flex"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : null}
                            {actionPlacement === 'header' ? (
                                <Link
                                    href={
                                        isActionDisabled
                                            ? '#'
                                            : resolvedActionHref
                                    }
                                    aria-disabled={isActionDisabled}
                                    onClick={(event) => {
                                        if (isActionDisabled) {
                                            event.preventDefault();
                                        }
                                    }}
                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    {actionLabel}{' '}
                                    <span aria-hidden="true">›</span>
                                </Link>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                <div
                    ref={viewportRef}
                    onScroll={
                        showNavigation && !isGridLayout
                            ? updateScrollState
                            : undefined
                    }
                    className={cn(
                        isGridLayout
                            ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6'
                            : 'grid auto-cols-[calc((100%-0.5rem)/2)] grid-flow-col gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[calc((100%-1.5rem)/3)] sm:gap-3 lg:auto-cols-[calc((100%-3.75rem)/6)]',
                    )}
                >
                    {products.map((item) => (
                        <ProductCard
                            key={item.product.id}
                            product={item.product}
                            className="w-full"
                            trackingPage="product_detail"
                            trackingContext={
                                showRecommendationMetadata &&
                                item.recommendationRequestId &&
                                item.recommendationItemId
                                    ? {
                                          recommendationRequestId:
                                              item.recommendationRequestId,
                                          recommendationItemId:
                                              item.recommendationItemId,
                                          recommendationSource: item.source,
                                          recommendationRank: item.rank,
                                          surface: 'product_detail',
                                          recommendationPolicyVersion:
                                              item.recommendationPolicyVersion,
                                          recommendationRankingMode:
                                              item.recommendationRankingMode,
                                      }
                                    : undefined
                            }
                            recommendationReason={
                                showRecommendationMetadata
                                    ? item.reasons?.[0]
                                    : undefined
                            }
                        />
                    ))}
                </div>

                {actionPlacement === 'footer' ? (
                    <div className="mt-5 flex justify-center">
                        <Link
                            href={
                                isActionDisabled ? '#' : resolvedActionHref
                            }
                            aria-disabled={isActionDisabled}
                            onClick={(event) => {
                                if (isActionDisabled) {
                                    event.preventDefault();
                                }
                            }}
                            className="inline-flex items-center rounded-md border border-zinc-900 px-5 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
                        >
                            {actionLabel}
                        </Link>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
