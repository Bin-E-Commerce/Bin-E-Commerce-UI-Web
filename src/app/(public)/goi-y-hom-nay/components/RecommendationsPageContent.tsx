// Trang này trình bày gợi ý sản phẩm theo từng trang; không sở hữu thuật toán xếp hạng hoặc dữ liệu catalog.

'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

import { ProductCard } from '@/app/(public)/products/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { RECOMMENDATIONS_PAGE_SIZE } from '../constants/recommendations.constants';
import { useRecommendations } from '../hooks/useRecommendations';

type PaginationItem = number | 'ellipsis';

// Tạo danh sách số trang ngắn gọn, luôn giữ trang đầu/cuối và vùng lân cận trang hiện tại.
function getPaginationItems(
    currentPage: number,
    totalPages: number,
): PaginationItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    const pages: PaginationItem[] = [1];

    if (startPage > 2) pages.push('ellipsis');
    for (let page = startPage; page <= endPage; page += 1) {
        pages.push(page);
    }
    if (endPage < totalPages - 1) pages.push('ellipsis');

    pages.push(totalPages);
    return pages;
}

// Chuẩn hóa page từ URL để request backend luôn nhận số nguyên dương hợp lệ.
function getPageFromSearchParams(value: string | null): number {
    const parsedPage = Number(value);
    return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

// Hiển thị riêng không gian gợi ý sau khi người dùng đã đăng nhập, đồng thời điều phối phân trang sản phẩm.
export function RecommendationsPageContent() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { initialized, isAuthenticated, redirectToLogin } =
        useCartAuthRedirect();
    const page = getPageFromSearchParams(searchParams.get('page'));
    const recommendationsQuery = useRecommendations(
        initialized && isAuthenticated,
        page,
    );

    useEffect(() => {
        // Guest không được gọi API danh sách mở rộng; chuyển về login để sau đó quay lại đúng trang.
        if (initialized && !isAuthenticated) {
            redirectToLogin(
                `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
            );
        }
    }, [initialized, isAuthenticated, pathname, redirectToLogin, searchParams]);

    const totalPages = recommendationsQuery.data?.totalPages ?? 1;
    const totalProducts = recommendationsQuery.data?.total ?? 0;
    const pageItems = recommendationsQuery.data?.items ?? [];

    useEffect(() => {
        // Nếu URL vượt quá số trang thực tế, đưa về trang cuối thay vì để người dùng thấy một danh sách rỗng.
        if (recommendationsQuery.data && page > totalPages) {
            router.replace(
                totalPages === 1 ? pathname : `${pathname}?page=${totalPages}`,
                { scroll: false },
            );
        }
    }, [page, pathname, recommendationsQuery.data, router, totalPages]);

    // Đổi page trên URL để backend nhận đúng page/pageSize và thao tác back/forward vẫn giữ được lịch sử.
    function handlePageChange(nextPage: number) {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
            return;
        }

        router.push(
            nextPage === 1 ? pathname : `${pathname}?page=${nextPage}`,
            { scroll: false },
        );
        document
            .getElementById('recommendation-results')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!initialized || !isAuthenticated) {
        return (
            <div className="bg-zinc-100 px-3 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-zinc-500">
                        Đang chuẩn bị danh sách gợi ý dành cho bạn...
                    </p>
                </div>
            </div>
        );
    }

    const firstProductIndex =
        totalProducts === 0 ? 0 : (page - 1) * RECOMMENDATIONS_PAGE_SIZE + 1;
    const lastProductIndex = Math.min(
        page * RECOMMENDATIONS_PAGE_SIZE,
        totalProducts,
    );

    return (
        <div className="min-h-[560px] bg-zinc-100 px-3 py-6 text-zinc-950 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_12px_36px_-28px_rgba(24,24,27,0.55)]">
                    <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                        <div className="p-6 sm:p-8 lg:p-10">
                            <h1 className="mt-4 max-w-2xl text-2xl font-bold leading-tight tracking-tight sm:text-2xl">
                                Tìm thấy món đồ tiếp theo khiến bạn thích thú.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                                Từ đồ công nghệ tiện ích đến những sản phẩm dùng
                                mỗi ngày, khám phá thêm cảm hứng cho lần mua sắm
                                tiếp theo của bạn.
                            </p>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                                Xem nhanh những lựa chọn nổi bật, so sánh thông tin
                                cần thiết và tìm ra món đồ thật sự phù hợp với bạn.
                            </p>
                            <a
                                href="#recommendation-results"
                                className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                            >
                                Khám phá ngay
                                <span aria-hidden="true">→</span>
                            </a>
                        </div>
                        <div className="border-t border-zinc-200 bg-zinc-50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                            <p className="mt-3 text-xl font-semibold leading-7 text-zinc-900">
                                Mỗi lần ghé thăm, một điều mới để khám phá.
                            </p>
                            <p className="mt-3 text-sm leading-6 text-zinc-500">
                                Duyệt những lựa chọn nổi bật, xem thông tin chi
                                tiết và tìm món đồ hợp với bạn.
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <p className="text-sm font-semibold text-zinc-900">
                                        Đa dạng
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        ngành hàng
                                    </p>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                    <p className="text-sm font-semibold text-zinc-900">
                                        Luôn mới
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        lựa chọn mỗi ngày
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="recommendation-results"
                    className="mt-5 rounded-2xl border border-zinc-200 bg-white shadow-sm"
                >
                    <div className="flex flex-col gap-1 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
                        <div>
                            <h2 className="text-lg font-bold">
                                Khám phá lựa chọn mới
                            </h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                {totalProducts > 0
                                    ? `Hiển thị ${firstProductIndex}–${lastProductIndex} trong ${totalProducts} sản phẩm`
                                    : 'Danh sách sản phẩm đang được cập nhật.'}
                            </p>
                        </div>
                    </div>

                    {recommendationsQuery.isPending ? (
                        <RecommendationsGridSkeleton />
                    ) : recommendationsQuery.isError ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <p className="text-sm text-zinc-500">
                                Chưa thể tải danh sách gợi ý lúc này.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 gap-2"
                                onClick={() =>
                                    void recommendationsQuery.refetch()
                                }
                            >
                                <RefreshCw className="h-4 w-4" />
                                Thử lại
                            </Button>
                        </div>
                    ) : pageItems.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-5 lg:grid-cols-5 xl:grid-cols-6">
                            {pageItems.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-16 text-center text-sm text-zinc-500">
                            Hiện chưa có sản phẩm gợi ý để hiển thị.
                        </div>
                    )}

                    {totalPages > 1 ? (
                        <div className="flex flex-col gap-4 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-sm text-zinc-500">
                                Trang{' '}
                                <span className="font-semibold text-zinc-900">
                                    {page}
                                </span>{' '}
                                / {totalPages}
                            </p>
                            <nav
                                aria-label="Phân trang sản phẩm gợi ý"
                                className="flex items-center justify-center gap-1"
                            >
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    aria-label="Trang trước"
                                    onClick={() => handlePageChange(page - 1)}
                                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-200 px-2 text-sm text-zinc-600 transition-colors hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-600"
                                >
                                    ‹
                                </button>
                                {getPaginationItems(page, totalPages).map(
                                    (item, index) =>
                                        item === 'ellipsis' ? (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-zinc-400"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={item}
                                                type="button"
                                                aria-current={
                                                    item === page
                                                        ? 'page'
                                                        : undefined
                                                }
                                                onClick={() =>
                                                    handlePageChange(item)
                                                }
                                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                                                    item === page
                                                        ? 'border-zinc-950 bg-zinc-950 text-white'
                                                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-950 hover:text-zinc-950'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        ),
                                )}
                                <button
                                    type="button"
                                    disabled={page === totalPages}
                                    aria-label="Trang tiếp theo"
                                    onClick={() => handlePageChange(page + 1)}
                                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-200 px-2 text-sm text-zinc-600 transition-colors hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-600"
                                >
                                    ›
                                </button>
                            </nav>
                        </div>
                    ) : null}
                </section>
            </div>
        </div>
    );
}

// Giữ ổn định bố cục 24 card trong lúc chuyển trang để giao diện không bị nhảy chiều cao.
function RecommendationsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-5 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 24 }).map((_, index) => (
                <div
                    key={index}
                    className="space-y-3 rounded-xl border border-zinc-200 p-3"
                >
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
            ))}
        </div>
    );
}
