// Catalog public của shop: search, filter nhẹ, sort và phân trang.

'use client';

import type { FormEvent } from 'react';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
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
import { trackRecommendationInteraction } from '@/services/recommendation';
import type {
    PaginatedProductResponse,
    PublicProduct,
} from '@/services/product';
import type { ShopCatalogFilters } from '../types/shop-page.types';
import { ShopCatalogSkeleton } from './ShopPageSkeleton';

interface ShopCatalogProps {
    data?: { catalog: PaginatedProductResponse<PublicProduct> };
    filters: ShopCatalogFilters;
    isLoading: boolean;
    isRefreshing: boolean;
    isError: boolean;
    onRetry: () => void;
    onFilterChange: (patch: Partial<ShopCatalogFilters>) => void;
}

// Chuyển giá trị form thành số hợp lệ; ô trống hoặc số âm được coi là không áp dụng bộ lọc.
function parseOptionalPrice(
    value: FormDataEntryValue | null,
): number | undefined {
    const parsed = Number(value);
    return value !== null &&
        value !== '' &&
        Number.isFinite(parsed) &&
        parsed >= 0
        ? parsed
        : undefined;
}

// Giữ toolbar có thể sử dụng bằng keyboard và đưa state vào URL qua callback của page coordinator.
export function ShopCatalog({
    data,
    filters,
    isLoading,
    isRefreshing,
    isError,
    onRetry,
    onFilterChange,
}: ShopCatalogProps) {
    const products = data?.catalog.items ?? [];
    const totalPages = data?.catalog.totalPages ?? 0;

    // Chỉ gửi search khi submit để mỗi ký tự không tạo một request và một lần đổi URL mới.
    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const search = String(formData.get('search') ?? '').trim();
        if (search) {
            void trackRecommendationInteraction({
                interactionType: 'SEARCH_PERFORMED',
                query: search,
                page: 'shop_catalog',
            }).catch(() => undefined);
        }
        onFilterChange({
            search,
            minPrice: parseOptionalPrice(formData.get('minPrice')),
            maxPrice: parseOptionalPrice(formData.get('maxPrice')),
            page: 1,
        });
    }

    return (
        <section className="mt-8">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="mt-1 text-2xl font-bold text-zinc-950">
                        Tất cả sản phẩm
                    </h2>
                </div>
                <p className="text-sm text-zinc-500">
                    {data
                        ? `${data.catalog.total.toLocaleString('vi-VN')} sản phẩm`
                        : 'Đang tải catalog'}
                </p>
            </div>

            <form
                className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm"
                onSubmit={handleSearchSubmit}
            >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            key={filters.search}
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Tìm trong shop..."
                            className="!h-10 pl-9"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
                        <Select
                            value={filters.sort}
                            onValueChange={(value) =>
                                onFilterChange({
                                    sort: value as ShopCatalogFilters['sort'],
                                    page: 1,
                                })
                            }
                        >
                            <SelectTrigger
                                aria-label="Sắp xếp sản phẩm"
                                className="!h-10 w-full min-w-36 gap-2 border-zinc-200 bg-white px-3 text-sm text-zinc-600 lg:w-44"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                side="bottom"
                                align="start"
                                sideOffset={6}
                                alignItemWithTrigger={false}
                            >
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="price_asc">
                                    Giá thấp đến cao
                                </SelectItem>
                                <SelectItem value="price_desc">
                                    Giá cao đến thấp
                                </SelectItem>
                                <SelectItem value="rating_desc">
                                    Đánh giá cao
                                </SelectItem>
                                <SelectItem value="sold_desc">
                                    Bán chạy
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <label className="inline-flex !h-10 cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50">
                            <Checkbox
                                checked={filters.inStock}
                                onCheckedChange={(checked) =>
                                    onFilterChange({
                                        inStock: checked === true,
                                        page: 1,
                                    })
                                }
                                aria-label="Chỉ hiển thị sản phẩm còn hàng"
                            />
                            <Filter className="h-4 w-4" />
                            <span>Còn hàng</span>
                        </label>

                        <Select
                            value={filters.minRating?.toString() ?? 'all'}
                            onValueChange={(value) =>
                                onFilterChange({
                                    minRating:
                                        value === 'all'
                                            ? undefined
                                            : Number(value),
                                    page: 1,
                                })
                            }
                        >
                            <SelectTrigger
                                aria-label="Lọc theo đánh giá tối thiểu"
                                className="!h-10 w-full min-w-40 gap-2 border-zinc-200 bg-white px-3 text-sm text-zinc-600 lg:w-48"
                            >
                                <span aria-hidden="true">⭐</span>
                                <SelectValue>
                                    {filters.minRating
                                        ? `Từ ${filters.minRating} sao`
                                        : 'Mọi đánh giá'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent
                                side="bottom"
                                align="start"
                                sideOffset={6}
                                alignItemWithTrigger={false}
                            >
                                <SelectItem value="all">
                                    Mọi đánh giá
                                </SelectItem>
                                <SelectItem value="4">Từ 4 sao</SelectItem>
                                <SelectItem value="3">Từ 3 sao</SelectItem>
                            </SelectContent>
                        </Select>

                        <label className="inline-flex !h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-600">
                            <span className="shrink-0">Giá từ</span>
                            <Input
                                key={`min-${filters.minPrice ?? ''}`}
                                name="minPrice"
                                type="number"
                                min="0"
                                defaultValue={filters.minPrice ?? ''}
                                placeholder="0"
                                className="!h-8 w-20 border-0 px-0 shadow-none focus-visible:ring-0"
                            />
                        </label>

                        <label className="inline-flex !h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-600">
                            <span className="shrink-0">Đến</span>
                            <Input
                                key={`max-${filters.maxPrice ?? ''}`}
                                name="maxPrice"
                                type="number"
                                min="0"
                                defaultValue={filters.maxPrice ?? ''}
                                placeholder="∞"
                                className="!h-8 w-20 border-0 px-0 shadow-none focus-visible:ring-0"
                            />
                        </label>
                    </div>

                    <Button type="submit" variant="outline" className="!h-10">
                        Tìm kiếm
                    </Button>
                </div>
            </form>

            <div
                className="relative mt-5"
                aria-busy={isLoading || isRefreshing}
            >
                {isLoading ? <ShopCatalogSkeleton /> : null}

                {!isLoading && isError ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <p className="font-semibold text-zinc-950">
                            Không thể tải catalog
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Dữ liệu shop đang tạm thời chưa sẵn sàng.
                        </p>
                        <Button
                            type="button"
                            className="mt-5"
                            variant="outline"
                            onClick={onRetry}
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : null}

                {!isLoading && !isError && products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : null}

                {!isLoading && !isError && products.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <p className="font-semibold text-zinc-950">
                            Không tìm thấy sản phẩm
                        </p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Thử thay đổi từ khóa hoặc bộ lọc của bạn.
                        </p>
                        <Button
                            type="button"
                            className="mt-5"
                            variant="outline"
                            onClick={() =>
                                onFilterChange({
                                    search: '',
                                    minRating: undefined,
                                    minPrice: undefined,
                                    maxPrice: undefined,
                                    inStock: false,
                                    page: 1,
                                })
                            }
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                ) : null}

                {isRefreshing ? (
                    <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-4">
                        <span className="rounded-full border border-zinc-200 bg-white/95 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
                            Đang cập nhật sản phẩm...
                        </span>
                    </div>
                ) : null}
            </div>

            {totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={filters.page <= 1}
                        onClick={() =>
                            onFilterChange({ page: filters.page - 1 })
                        }
                    >
                        Trước
                    </Button>
                    <span className="text-sm text-zinc-600">
                        Trang {filters.page} / {totalPages}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={filters.page >= totalPages}
                        onClick={() =>
                            onFilterChange({ page: filters.page + 1 })
                        }
                    >
                        Sau
                    </Button>
                </div>
            ) : null}
        </section>
    );
}
