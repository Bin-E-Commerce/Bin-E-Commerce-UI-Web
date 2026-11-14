// Danh sách shop tìm kiếm: query được cache theo từ khóa/trang và URL giữ trạng thái phân trang.
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopSearch } from '../../hooks/useShopSearch';
import type { ShopSearchResultsProps } from '../../types/shop-search.types';
import { buildSearchScopeHref } from '../../utils/search-url';
import { ShopSearchResultCard } from './ShopSearchResultCard';

// Tải trang shop public và cung cấp trạng thái tải/lỗi/rỗng riêng cho phạm vi này.
export function ShopSearchResults({ query, page }: ShopSearchResultsProps) {
    const router = useRouter();
    const shopQuery = useShopSearch(query, page);
    const result = shopQuery.data;

    // URL bookmark có thể yêu cầu trang vượt tổng số trang; chỉ chuẩn hóa sau khi dữ liệu đúng query đã tải xong.
    useEffect(() => {
        if (!result || shopQuery.isPlaceholderData) return;

        const lastAvailablePage = Math.max(1, result.totalPages);
        if (page > lastAvailablePage) {
            router.replace(
                buildSearchScopeHref(query, 'shops', lastAvailablePage),
                { scroll: false },
            );
        }
    }, [page, query, result, router, shopQuery.isPlaceholderData]);

    // Đưa trang mới vào URL và loại bỏ filter của sản phẩm khỏi truy vấn shop.
    function goToPage(nextPage: number): void {
        router.push(buildSearchScopeHref(query, 'shops', nextPage), {
            scroll: false,
        });
    }

    // Dữ liệu placeholder thuộc query/trang trước, nên dùng skeleton thay vì hiện nhầm trạng thái rỗng.
    if (shopQuery.isPending || shopQuery.isPlaceholderData) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                    <div
                        key={index}
                        className="rounded-2xl border border-neutral-200 bg-white p-5"
                    >
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-16 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                        </div>
                        <Skeleton className="mt-5 h-10 w-full" />
                        <Skeleton className="mt-5 h-10 w-full rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (shopQuery.isError) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                    <Store className="size-5" />
                </span>
                <p className="mt-4 font-semibold text-neutral-950">
                    Chưa thể tải danh sách cửa hàng
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                    Kết nối đang gián đoạn. Hãy thử tải lại kết quả.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    className="mt-5 h-10 rounded-xl px-4"
                    onClick={() => void shopQuery.refetch()}
                >
                    Thử lại
                </Button>
            </div>
        );
    }

    if (!result?.items.length) {
        return (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                    <Search className="size-5" />
                </span>
                <p className="mt-4 font-semibold text-neutral-950">
                    {query
                        ? 'Chưa tìm thấy cửa hàng phù hợp'
                        : 'Chưa có cửa hàng để hiển thị'}
                </p>
                <p className="mx-auto mt-1 max-w-lg text-sm text-neutral-500">
                    Thử tên shop khác hoặc kiểm tra lại từ khóa tìm kiếm.
                </p>
            </div>
        );
    }

    return (
        <div aria-busy={shopQuery.isFetching}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((item) => (
                    <ShopSearchResultCard key={item.shop.id} item={item} />
                ))}
            </div>
            {result.totalPages > 1 ? (
                <div className="mt-7 flex items-center justify-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-neutral-200 px-4"
                        disabled={page <= 1 || shopQuery.isFetching}
                        onClick={() => goToPage(page - 1)}
                    >
                        Trước
                    </Button>
                    <span className="text-sm text-neutral-600">
                        Trang {result.page} / {result.totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-neutral-200 px-4"
                        disabled={
                            page >= result.totalPages || shopQuery.isFetching
                        }
                        onClick={() => goToPage(page + 1)}
                    >
                        Sau
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
