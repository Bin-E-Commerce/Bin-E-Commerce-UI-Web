// Ô tìm kiếm dùng chung cho header và trang catalog; gợi ý sản phẩm đi qua endpoint autocomplete nhẹ.
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Clock3, Search, Store, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { trackRecommendationInteraction } from '@/services/recommendation';
import { useProductSearchSuggestions } from '../hooks/useProductSearch';
import { useShopSearchSuggestions } from '../hooks/useShopSearch';
import type {
    ProductSearchBoxProps,
    ProductSearchOption,
    SearchScope,
    SearchOptionRowProps,
} from '../types/product-search.types';
import {
    clearRecentSearches,
    readRecentSearches,
    removeRecentSearch,
    rememberRecentSearch,
} from '../utils/recent-searches';
import { buildSearchScopeHref } from '../utils/search-url';

// Ghi nhận query ở chế độ best-effort; lỗi tracking không được chặn điều hướng tìm kiếm.
function trackSearchQuery(query: string): void {
    void trackRecommendationInteraction({
        interactionType: 'SEARCH_PERFORMED',
        query,
        page: 'product_search',
    }).catch(() => undefined);
}

// Hiển thị gợi ý shop và sản phẩm với thông tin phụ để người dùng nhận diện kết quả ngay trong popup.
function SearchOptionRow({ option }: SearchOptionRowProps) {
    if (option.kind === 'shop') {
        const shop = option.shop.shop;
        const location = [shop.location.district, shop.location.province]
            .filter(Boolean)
            .join(', ');

        return (
            <>
                {shop.logoUrl ? (
                    <Image
                        src={shop.logoUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 shrink-0 rounded-full border border-neutral-200 bg-white object-cover"
                    />
                ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-900">
                        <Store className="size-4" />
                    </span>
                )}
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-neutral-900">
                        {shop.name}
                    </span>
                    <span className="flex items-center gap-1 truncate text-xs text-neutral-500">
                        <Users className="size-3 shrink-0" />
                        {option.shop.stats.followerCount.toLocaleString(
                            'vi-VN',
                        )}{' '}
                        người theo dõi
                        {location ? ` · ${location}` : ''}
                    </span>
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-900">
                    Shop
                </span>
            </>
        );
    }

    return (
        <>
            {option.product.imageUrl ? (
                <Image
                    src={option.product.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-0.5"
                />
            ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                    <Search className="size-4 text-neutral-400" />
                </span>
            )}
            <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-neutral-900">
                    {option.product.name}
                </span>
                <span className="block truncate text-xs text-neutral-500">
                    {option.product.brandName ?? 'Sản phẩm'}
                    {' · '}
                    {Number(option.product.minPrice).toLocaleString('vi-VN')}₫
                </span>
            </span>
        </>
    );
}

// Kết hợp query, gợi ý và lịch sử cục bộ để tìm sản phẩm/shop.
// Header đổi chiều rộng theo focus; popup bám theo anchor để hai vùng bung ra đồng bộ.
// Query được debounce trước API; xóa một mục chỉ cập nhật lịch sử, không điều hướng hay gửi tracking.
export function ProductSearchBox({
    variant,
    initialQuery = '',
    searchScope = 'products',
    onSearchScopeChange,
}: ProductSearchBoxProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const normalizedQuery = query.trim();
    const suggestionsQuery = useProductSearchSuggestions(
        debouncedQuery,
        isOpen && normalizedQuery === debouncedQuery,
    );
    const shopSuggestionsQuery = useShopSearchSuggestions(
        debouncedQuery,
        isOpen && normalizedQuery === debouncedQuery,
    );

    // Query từ URL chỉ đồng bộ khi trang kết quả thay đổi, không làm mất chữ người dùng đang gõ.
    useEffect(() => {
        setQuery(initialQuery);
        setDebouncedQuery(initialQuery);
    }, [initialQuery]);

    // Chờ người dùng ngừng gõ 250 ms; hook chỉ gọi API khi giá trị đã debounce trùng input hiện tại.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 250);

        return () => window.clearTimeout(timer);
    }, [query]);

    // Lịch sử chỉ đọc ở trình duyệt, tránh truy cập localStorage trong lần render phía server.
    useEffect(() => {
        setRecentSearches(readRecentSearches());
    }, []);

    // Giữ lịch sử ngoài listbox; chỉ tạo option khi gợi ý khớp query đã debounce để tránh chọn nhầm kết quả cũ.
    const options = useMemo<ProductSearchOption[]>(() => {
        const searchTerm = normalizedQuery;
        if (searchTerm.length < 2) return [];

        if (searchTerm !== debouncedQuery) return [];

        const productOptions = (suggestionsQuery.data ?? []).map((product) => ({
            id: `product-${product.id}`,
            kind: 'product' as const,
            label: product.name,
            product,
        }));
        const shopOptions = (shopSuggestionsQuery.data?.items ?? []).map(
            (shop) => ({
                id: `shop-${shop.shop.id}`,
                kind: 'shop' as const,
                label: shop.shop.name,
                shop,
            }),
        );

        return [...productOptions, ...shopOptions];
    }, [
        debouncedQuery,
        normalizedQuery,
        suggestionsQuery.data,
        shopSuggestionsQuery.data,
    ]);

    // Query có chữ được lưu và tracking trước khi mở kết quả; query rỗng mở catalog khám phá mà không ghi lịch sử.
    function submitSearch(
        rawQuery: string,
        scope: SearchScope = variant === 'page' ? searchScope : 'products',
    ): void {
        const searchTerm = rawQuery.trim();
        // Giữ từ khóa trong ô sau khi popup đóng; Base UI có thể phát input rỗng khi bấm nút bên ngoài popup.
        setQuery(searchTerm);
        setDebouncedQuery(searchTerm);
        if (searchTerm) {
            setRecentSearches(rememberRecentSearch(searchTerm));
            trackSearchQuery(searchTerm);
        }
        router.push(buildSearchScopeHref(searchTerm, scope));
        setIsOpen(false);
    }

    // Chọn shop mở gian hàng; chọn sản phẩm ghi nhận tương tác rồi mở trang chi tiết.
    function handleOptionSelect(option: ProductSearchOption | null): void {
        if (!option) return;

        // Chọn shop mở storefront trực tiếp; không gửi sự kiện PRODUCT_CLICKED cho sai loại đối tượng.
        if (option.kind === 'shop') {
            const searchTerm = query.trim();
            if (searchTerm) {
                setRecentSearches(rememberRecentSearch(searchTerm));
                trackSearchQuery(searchTerm);
            }
            setIsOpen(false);
            router.push(`/shop/${encodeURIComponent(option.shop.shop.slug)}`);
            return;
        }

        const searchTerm = query.trim();
        if (searchTerm) {
            setRecentSearches(rememberRecentSearch(searchTerm));
            trackSearchQuery(searchTerm);
        }
        void trackRecommendationInteraction({
            interactionType: 'PRODUCT_CLICKED',
            productId: option.product.id,
            page: 'search_suggestions',
            position: options.findIndex((item) => item.id === option.id) + 1,
        }).catch(() => undefined);
        setIsOpen(false);
        router.push(`/products/${encodeURIComponent(option.product.slug)}`);
    }

    // Chặn submit mặc định để cả nút tìm và phím Enter dùng chung một điều hướng có tracking.
    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        submitSearch(query);
    }

    // Xóa lịch sử trình duyệt ngay trong popup mà không làm thay đổi query đang nhập.
    function handleClearRecentSearches(): void {
        clearRecentSearches();
        setRecentSearches([]);
    }

    // Xóa đúng query đã chọn và cập nhật popup từ danh sách trả về của storage helper.
    function handleRemoveRecentSearch(queryToRemove: string): void {
        setRecentSearches(removeRecentSearch(queryToRemove));
    }

    const isHeader = variant === 'header';
    const showRecentSearches = !normalizedQuery && recentSearches.length > 0;
    // Chỉ đổi target theo focus; transition giới hạn ở chiều rộng để icon header không bị animate theo.
    const headerWidthClasses = isOpen
        ? 'w-[min(36rem,calc(100vw-15rem))] lg:w-[48rem]'
        : 'w-52 lg:w-80';

    return (
        <form
            onSubmit={handleSubmit}
            className={
                isHeader
                    ? `relative flex items-center transition-[width] duration-300 ease-in-out motion-reduce:transition-none ${headerWidthClasses}`
                    : 'relative flex w-full items-center gap-2'
            }
        >
            <Combobox<ProductSearchOption>
                items={options}
                open={isOpen}
                inputValue={query}
                onInputValueChange={setQuery}
                onValueChange={handleOptionSelect}
                onOpenChange={setIsOpen}
                itemToStringLabel={(option) => option?.label ?? ''}
                itemToStringValue={(option) => option?.id ?? ''}
                isItemEqualToValue={(left, right) => left.id === right.id}
                autoHighlight={false}
                filter={null}
            >
                <div className="relative min-w-0 flex-1">
                    <ComboboxInput
                        aria-label="Tìm kiếm sản phẩm hoặc cửa hàng"
                        maxLength={120}
                        placeholder={
                            isHeader
                                ? 'Tìm sản phẩm hoặc shop…'
                                : 'Bạn đang tìm sản phẩm hay cửa hàng?'
                        }
                        onFocus={() => setIsOpen(true)}
                        showTrigger={false}
                        showClear={isHeader && Boolean(query)}
                        className={
                            isHeader
                                ? 'h-10 w-full rounded-xl border-neutral-200 bg-white pr-1 shadow-sm transition focus-within:border-neutral-500 focus-within:ring-2 focus-within:ring-neutral-300 [&_[data-slot=input-group-control]]:h-10 [&_[data-slot=input-group-control]]:pl-10 [&_[data-slot=input-group-control]]:text-sm'
                                : 'h-11 w-full rounded-xl border-neutral-200 bg-white shadow-sm transition focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200 [&_[data-slot=input-group-control]]:h-11 [&_[data-slot=input-group-control]]:pl-4 [&_[data-slot=input-group-control]]:text-sm'
                        }
                    />
                    {isHeader ? (
                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label="Tìm kiếm"
                            className="absolute left-1 top-1/2 size-8 -translate-y-1/2 text-neutral-500 hover:text-neutral-950"
                        >
                            <Search className="size-4" />
                        </Button>
                    ) : null}
                    {!isHeader && query ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Xóa từ khóa tìm kiếm"
                            className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-neutral-500"
                            onClick={() => setQuery('')}
                        >
                            <X className="size-4" />
                        </Button>
                    ) : null}
                </div>
                {!isHeader && onSearchScopeChange ? (
                    <Select
                        value={searchScope}
                        onValueChange={(value) => {
                            if (value === 'products' || value === 'shops') {
                                onSearchScopeChange(value, query.trim());
                            }
                        }}
                    >
                        <SelectTrigger
                            aria-label="Tìm trong sản phẩm hoặc cửa hàng"
                            className="data-[size=default]:h-11 h-11 w-32 shrink-0 rounded-xl border-neutral-200 bg-white px-3 text-sm"
                        >
                            <SelectValue>
                                {searchScope === 'products'
                                    ? 'Sản phẩm'
                                    : 'Cửa hàng'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-0">
                            <SelectItem value="products">Sản phẩm</SelectItem>
                            <SelectItem value="shops">Cửa hàng</SelectItem>
                        </SelectContent>
                    </Select>
                ) : null}
                {!isHeader ? (
                    <Button
                        type="submit"
                        className="h-11 shrink-0 rounded-xl bg-neutral-900 px-4 text-white hover:bg-neutral-800 sm:px-6"
                    >
                        <Search className="size-4" />
                        <span className="hidden sm:inline">Tìm kiếm</span>
                    </Button>
                ) : null}
                <ComboboxContent
                    className="w-(--anchor-width) min-w-0 max-w-[calc(100vw-1rem)] rounded-2xl border-neutral-200 bg-white p-2 shadow-[0_18px_55px_-22px_rgba(0,0,0,0.22)] duration-200 ease-in-out"
                    sideOffset={8}
                >
                    {(suggestionsQuery.isFetching ||
                        shopSuggestionsQuery.isFetching) &&
                    options.length > 0 ? (
                        <p className="px-3 py-2 text-xs text-neutral-500">
                            Đang tìm gợi ý…
                        </p>
                    ) : null}
                    {(suggestionsQuery.isError ||
                        shopSuggestionsQuery.isError) &&
                    options.length > 0 ? (
                        <p className="px-3 py-2 text-xs text-neutral-500">
                            Một vài gợi ý chưa tải được; bạn vẫn có thể tìm đầy
                            đủ bên dưới.
                        </p>
                    ) : null}
                    {showRecentSearches ? (
                        <div
                            role="group"
                            aria-label="Tìm gần đây"
                            className="space-y-1 p-1"
                        >
                            {recentSearches.map((recentQuery, index) => (
                                <div
                                    key={`recent-${index}-${recentQuery}`}
                                    className="flex items-center gap-1"
                                >
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-12 min-w-0 flex-1 justify-start rounded-xl px-3 text-left font-normal text-neutral-900 hover:bg-neutral-100"
                                        onClick={() =>
                                            submitSearch(recentQuery)
                                        }
                                    >
                                        <Clock3 className="size-4 shrink-0 text-neutral-400" />
                                        <span className="min-w-0 flex-1 truncate">
                                            {recentQuery}
                                        </span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Xóa lịch sử tìm kiếm: ${recentQuery}`}
                                        className="text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                                        onPointerDown={(event) =>
                                            event.preventDefault()
                                        }
                                        onClick={() =>
                                            handleRemoveRecentSearch(
                                                recentQuery,
                                            )
                                        }
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : null}
                    {!showRecentSearches ? (
                        <ComboboxEmpty>
                            {normalizedQuery.length >= 2 &&
                            normalizedQuery !== debouncedQuery
                                ? 'Đang chuẩn bị gợi ý…'
                                : suggestionsQuery.isFetching ||
                                    shopSuggestionsQuery.isFetching
                                  ? 'Đang tìm gợi ý…'
                                  : suggestionsQuery.isError &&
                                      shopSuggestionsQuery.isError
                                    ? 'Hãy nhấn Enter để xem trang kết quả.'
                                    : suggestionsQuery.isError ||
                                        shopSuggestionsQuery.isError
                                      ? 'Một số gợi ý chưa tải được. Hãy mở trang kết quả để tiếp tục tìm.'
                                      : normalizedQuery.length >= 2
                                        ? 'Chưa thấy sản phẩm hoặc shop phù hợp. Hãy thử từ khóa khác.'
                                        : 'Nhập ít nhất 2 ký tự để tìm sản phẩm hoặc shop.'}
                        </ComboboxEmpty>
                    ) : null}
                    <ComboboxList className="max-h-80">
                        {(option: ProductSearchOption, index: number) => (
                            <ComboboxItem
                                key={option.id}
                                value={option}
                                index={index}
                                className="min-h-14 cursor-pointer rounded-xl px-2.5 py-2 transition-colors data-[highlighted]:bg-neutral-100"
                            >
                                <SearchOptionRow option={option} />
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                    {normalizedQuery.length >= 2 ? (
                        <div className="mt-1 grid grid-cols-2 gap-2 border-t border-neutral-100 p-1 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 justify-center rounded-xl border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-800 sm:text-sm"
                                onClick={() =>
                                    submitSearch(normalizedQuery, 'products')
                                }
                            >
                                <Search className="size-4" />
                                Tìm sản phẩm
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 justify-center rounded-xl border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-800 sm:text-sm"
                                onClick={() =>
                                    submitSearch(normalizedQuery, 'shops')
                                }
                            >
                                <Store className="size-4" />
                                Tìm cửa hàng
                            </Button>
                        </div>
                    ) : recentSearches.length > 0 ? (
                        <div className="flex items-center justify-between border-t border-neutral-100 px-2 pt-2">
                            <span className="text-xs font-medium text-neutral-500">
                                Tìm gần đây
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-neutral-500"
                                onClick={handleClearRecentSearches}
                            >
                                Xóa lịch sử
                            </Button>
                        </div>
                    ) : null}
                </ComboboxContent>
            </Combobox>
        </form>
    );
}
