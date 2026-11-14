// Trang catalog tìm kiếm: URL là nguồn filter, service hook tải đúng một trang và card giữ attribution storefront.
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Filter,
    Search,
    SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ProductCard } from '@/app/(public)/products/components/ProductCard';
import { useProductSearch } from '../hooks/useProductSearch';
import type {
    ProductSearchFilters,
    SearchScope,
} from '../types/product-search.types';
import {
    buildProductSearchHref,
    buildSearchScopeHref,
    readProductSearchFilters,
} from '../utils/search-url';
import { ProductSearchBox } from './ProductSearchBox';
import { ProductSearchSkeleton } from './ProductSearchSkeleton';
import { ShopSearchResults } from './shops/ShopSearchResults';

// Chuyển giá từ form thành số không âm; chuỗi trống hoặc input sai định dạng không tạo bộ lọc giả.
function parseOptionalPrice(
    value: FormDataEntryValue | null,
): number | undefined {
    if (value === null || value === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

const SEARCH_SORT_LABELS: Record<ProductSearchFilters['sort'], string> = {
    relevance: 'Liên quan nhất',
    newest: 'Mới nhất',
    sold_desc: 'Bán chạy',
    rating_desc: 'Đánh giá cao',
    price_asc: 'Giá thấp đến cao',
    price_desc: 'Giá cao đến thấp',
};

// Đồng bộ query, sort, filter và page với URL để link tìm kiếm có thể refresh/chia sẻ/back-forward.
export function ProductSearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [priceError, setPriceError] = useState<string | null>(null);
    const filters = useMemo(
        () => readProductSearchFilters(new URLSearchParams(searchParams)),
        [searchParams],
    );
    const searchScope: SearchScope =
        searchParams.get('type') === 'shops' ? 'shops' : 'products';
    const searchQuery = useProductSearch(filters, searchScope === 'products');
    const catalog = searchScope === 'products' ? searchQuery.data : undefined;
    const totalPages = catalog?.totalPages ?? 0;
    const hasPriceOrRatingFilter = Boolean(
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        filters.minRating !== undefined ||
        filters.inStock,
    );

    // Chỉ sửa URL khi dữ liệu thuộc đúng trang hiện tại; placeholder cũ không được kéo trang mới về sai số trang.
    useEffect(() => {
        if (
            searchScope !== 'products' ||
            !catalog ||
            searchQuery.isPlaceholderData ||
            catalog.page !== filters.page
        ) {
            return;
        }

        const lastAvailablePage = Math.max(1, catalog.totalPages);
        if (filters.page > lastAvailablePage) {
            router.replace(
                buildProductSearchHref(filters, {
                    page: lastAvailablePage,
                }),
                { scroll: false },
            );
        }
    }, [catalog, filters, router, searchScope, searchQuery.isPlaceholderData]);

    // Khi sort/filter đổi thì đưa về trang đầu để không giữ offset cũ của bộ kết quả khác.
    function updateFilters(patch: Partial<ProductSearchFilters>): void {
        const nextPatch =
            patch.page === undefined ? { ...patch, page: 1 } : patch;
        router.push(buildProductSearchHref(filters, nextPatch), {
            scroll: false,
        });
    }

    // Dùng query đang nhập để đổi phạm vi không làm mất chữ chưa submit; filter sản phẩm được bỏ khỏi URL shop.
    function changeSearchScope(value: string, query: string): void {
        if (value !== 'products' && value !== 'shops') return;
        setPriceError(null);
        router.push(buildSearchScopeHref(query, value));
    }

    // Áp dụng khoảng giá sau khi kiểm tra thứ tự; lỗi hiển thị ngay dưới form thay vì gọi API sai range.
    function handlePriceSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const minPrice = parseOptionalPrice(formData.get('minPrice'));
        const maxPrice = parseOptionalPrice(formData.get('maxPrice'));

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            minPrice > maxPrice
        ) {
            setPriceError('Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa.');
            return;
        }

        setPriceError(null);
        updateFilters({ minPrice, maxPrice });
    }

    // Xóa riêng các điều kiện lọc để giữ nguyên query tìm kiếm và cách sắp xếp hiện tại.
    function clearFilters(): void {
        setPriceError(null);
        updateFilters({
            minPrice: undefined,
            maxPrice: undefined,
            minRating: undefined,
            inStock: false,
        });
    }

    if (searchScope === 'products' && searchQuery.isPending && !catalog) {
        return <ProductSearchSkeleton />;
    }

    return (
        <main className="min-h-[75vh] bg-white px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <h1 className="sr-only">Tìm sản phẩm và cửa hàng</h1>
                <section
                    aria-label="Tìm sản phẩm hoặc cửa hàng"
                    className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4"
                >
                    <ProductSearchBox
                        variant="page"
                        initialQuery={filters.query}
                        searchScope={searchScope}
                        onSearchScopeChange={changeSearchScope}
                    />
                </section>

                {searchScope === 'shops' ? (
                    <section className="mt-7" aria-label="Kết quả cửa hàng">
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-neutral-950">
                                    Cửa hàng phù hợp
                                </h2>
                                <p className="mt-1 text-sm text-neutral-500">
                                    {filters.query
                                        ? `Đang tìm shop theo “${filters.query}”`
                                        : 'Khám phá các cửa hàng đang hoạt động'}
                                </p>
                            </div>
                            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600">
                                Hồ sơ cửa hàng công khai
                            </span>
                        </div>
                        <ShopSearchResults
                            query={filters.query}
                            page={filters.page}
                        />
                    </section>
                ) : (
                    <section className="mt-7" aria-label="Kết quả sản phẩm">
                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900">
                                        <Filter className="size-4" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-950">
                                            Lọc sản phẩm
                                        </p>
                                        <p className="mt-0.5 text-xs text-neutral-500">
                                            Thu hẹp kết quả theo giá, đánh giá
                                            và tình trạng hàng
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        value={filters.sort}
                                        onValueChange={(value) =>
                                            updateFilters({
                                                sort: value as ProductSearchFilters['sort'],
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            aria-label="Sắp xếp kết quả tìm kiếm"
                                            className="data-[size=default]:h-9 w-44 gap-2 rounded-xl border-neutral-200 bg-white"
                                        >
                                            <SlidersHorizontal className="size-4 text-neutral-500" />
                                            <SelectValue>
                                                {SEARCH_SORT_LABELS[filters.sort]}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            <SelectItem value="relevance">
                                                Liên quan nhất
                                            </SelectItem>
                                            <SelectItem value="newest">
                                                Mới nhất
                                            </SelectItem>
                                            <SelectItem value="sold_desc">
                                                Bán chạy
                                            </SelectItem>
                                            <SelectItem value="rating_desc">
                                                Đánh giá cao
                                            </SelectItem>
                                            <SelectItem value="price_asc">
                                                Giá thấp đến cao
                                            </SelectItem>
                                            <SelectItem value="price_desc">
                                                Giá cao đến thấp
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {hasPriceOrRatingFilter ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-9 rounded-xl border-neutral-200 bg-white px-3 text-neutral-700"
                                            onClick={clearFilters}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                        Khoảng giá
                                    </p>
                                    <form
                                        onSubmit={handlePriceSubmit}
                                        className="flex flex-wrap items-center gap-2"
                                    >
                                        <label className="flex h-10 min-w-[120px] flex-1 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm text-neutral-500 transition-colors focus-within:border-neutral-500">
                                            <span className="shrink-0">Từ</span>
                                            <Input
                                                key={`min-${filters.minPrice ?? ''}`}
                                                name="minPrice"
                                                type="number"
                                                min="0"
                                                defaultValue={
                                                    filters.minPrice ?? ''
                                                }
                                                placeholder="0₫"
                                                aria-label="Giá tối thiểu"
                                                className="h-8 min-w-0 w-full border-0 px-0 text-neutral-950 shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
                                            />
                                        </label>
                                        <span className="text-neutral-400">
                                            —
                                        </span>
                                        <label className="flex h-10 min-w-[120px] flex-1 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-sm text-neutral-500 transition-colors focus-within:border-neutral-500">
                                            <span className="shrink-0">
                                                Đến
                                            </span>
                                            <Input
                                                key={`max-${filters.maxPrice ?? ''}`}
                                                name="maxPrice"
                                                type="number"
                                                min="0"
                                                defaultValue={
                                                    filters.maxPrice ?? ''
                                                }
                                                placeholder="Không giới hạn"
                                                aria-label="Giá tối đa"
                                                className="h-8 min-w-0 w-full border-0 px-0 text-neutral-950 shadow-none placeholder:text-neutral-400 focus-visible:ring-0"
                                            />
                                        </label>
                                        <Button
                                            type="submit"
                                            className="h-10 shrink-0 rounded-xl bg-neutral-950 px-4 text-white hover:bg-neutral-800"
                                        >
                                            Áp dụng
                                        </Button>
                                    </form>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                        Đánh giá tối thiểu
                                    </p>
                                    <Select
                                        value={
                                            filters.minRating?.toString() ??
                                            'all'
                                        }
                                        onValueChange={(value) =>
                                            updateFilters({
                                                minRating:
                                                    value === 'all'
                                                        ? undefined
                                                        : Number(value),
                                            })
                                        }
                                    >
                                        <SelectTrigger
                                            aria-label="Lọc theo đánh giá tối thiểu"
                                            className="data-[size=default]:h-10 w-full rounded-xl border-neutral-200 bg-white"
                                        >
                                            <SelectValue>
                                                {filters.minRating
                                                    ? `Từ ${filters.minRating} sao`
                                                    : 'Mọi đánh giá'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Mọi đánh giá
                                            </SelectItem>
                                            <SelectItem value="4">
                                                Từ 4 sao
                                            </SelectItem>
                                            <SelectItem value="3">
                                                Từ 3 sao
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                        Tình trạng
                                    </p>
                                    <label className="flex h-10 cursor-pointer items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 text-sm text-neutral-800 transition-colors hover:border-neutral-400">
                                        <span>Chỉ còn hàng</span>
                                        <Checkbox
                                            checked={filters.inStock}
                                            className="data-checked:border-neutral-950 data-checked:bg-neutral-950"
                                            onCheckedChange={(checked) =>
                                                updateFilters({
                                                    inStock: checked === true,
                                                })
                                            }
                                            aria-label="Chỉ hiển thị sản phẩm còn hàng"
                                        />
                                    </label>
                                </div>
                            </div>

                            {priceError ? (
                                <p
                                    className="px-4 pb-4 text-sm text-rose-700"
                                    role="alert"
                                >
                                    {priceError}
                                </p>
                            ) : null}
                        </div>

                        <div className="mt-3 flex min-h-6 items-center">
                            <p
                                className="text-sm text-neutral-600"
                                aria-live="polite"
                            >
                                {catalog
                                    ? `${catalog.total.toLocaleString('vi-VN')} sản phẩm`
                                    : 'Đang tải sản phẩm'}
                                {searchQuery.isFetching && catalog
                                    ? ' · Đang cập nhật'
                                    : ''}
                            </p>
                        </div>

                        <div
                            className="relative mt-5"
                            aria-busy={searchQuery.isFetching}
                        >
                            {searchQuery.isError ? (
                                <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                                    <p className="font-semibold text-neutral-950">
                                        Không thể tải kết quả tìm kiếm
                                    </p>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        Catalog đang tạm thời chưa sẵn sàng.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-5 h-10 rounded-xl px-4"
                                        onClick={() =>
                                            void searchQuery.refetch()
                                        }
                                    >
                                        Thử lại
                                    </Button>
                                </div>
                            ) : null}

                            {!searchQuery.isError && catalog?.items.length ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {catalog.items.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            trackingPage="search_results"
                                        />
                                    ))}
                                </div>
                            ) : null}

                            {!searchQuery.isFetching &&
                            !searchQuery.isError &&
                            catalog?.items.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                                    <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                                        <Search className="size-5" />
                                    </span>
                                    <p className="mt-4 font-semibold text-neutral-950">
                                        {filters.query
                                            ? 'Chưa tìm thấy sản phẩm phù hợp'
                                            : 'Chưa có sản phẩm để hiển thị'}
                                    </p>
                                    <p className="mx-auto mt-1 max-w-lg text-sm text-neutral-500">
                                        Thử từ khóa ngắn hơn, kiểm tra chính tả
                                        hoặc bỏ dấu tiếng Việt. Bạn cũng có thể
                                        xóa bộ lọc để mở rộng kết quả.
                                    </p>
                                    {hasPriceOrRatingFilter ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-5 h-10 rounded-xl px-4"
                                            onClick={clearFilters}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    ) : null}
                                </div>
                            ) : null}

                            {searchQuery.isFetching && catalog ? (
                                <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/65 pt-4">
                                    <span
                                        role="status"
                                        aria-live="polite"
                                        className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm"
                                    >
                                        Đang cập nhật sản phẩm…
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        {totalPages > 1 ? (
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 rounded-xl px-4"
                                    disabled={filters.page <= 1}
                                    onClick={() =>
                                        updateFilters({
                                            page: filters.page - 1,
                                        })
                                    }
                                >
                                    Trước
                                </Button>
                                <span className="text-sm text-neutral-600">
                                    Trang {filters.page} / {totalPages}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 rounded-xl px-4"
                                    disabled={filters.page >= totalPages}
                                    onClick={() =>
                                        updateFilters({
                                            page: filters.page + 1,
                                        })
                                    }
                                >
                                    Sau
                                </Button>
                            </div>
                        ) : null}
                    </section>
                )}
            </div>
        </main>
    );
}
