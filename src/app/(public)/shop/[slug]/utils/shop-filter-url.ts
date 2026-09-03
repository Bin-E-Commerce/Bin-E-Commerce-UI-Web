// Bộ chuyển đổi filter của catalog giữa URL và kiểu dữ liệu mà API sử dụng.
// File này chỉ xử lý dữ liệu thuần; nó không đọc router, không gọi API và không quản lý state.

import type { ShopCatalogFilters } from '../types/shop-page.types';

// Đọc filter một chiều từ URL để reload, back/forward và chia sẻ link không làm mất trạng thái catalog.
export function readShopCatalogFilters(
    params: URLSearchParams,
): ShopCatalogFilters {
    const page = Number(params.get('page'));
    const minRating = Number(params.get('minRating'));
    const minPriceValue = params.get('minPrice');
    const maxPriceValue = params.get('maxPrice');
    const minPrice = minPriceValue ? Number(minPriceValue) : NaN;
    const maxPrice = maxPriceValue ? Number(maxPriceValue) : NaN;
    const sort = params.get('sort');

    return {
        search: params.get('search') ?? '',
        sort:
            sort === 'price_asc' ||
            sort === 'price_desc' ||
            sort === 'rating_desc' ||
            sort === 'sold_desc'
                ? sort
                : 'newest',
        minRating: minRating >= 1 && minRating <= 5 ? minRating : undefined,
        minPrice: minPrice >= 0 ? minPrice : undefined,
        maxPrice: maxPrice >= 0 ? maxPrice : undefined,
        inStock: params.get('inStock') === 'true',
        page: Number.isInteger(page) && page > 0 ? page : 1,
    };
}

// Ghép filter hiện tại với thay đổi mới thành URL gọn, chỉ giữ những giá trị khác mặc định.
// Trang được caller reset về 1 khi search hoặc điều kiện lọc thay đổi để tránh rơi vào trang rỗng.
export function buildShopCatalogHref(
    pathname: string,
    current: ShopCatalogFilters,
    patch: Partial<ShopCatalogFilters>,
): string {
    const next = { ...current, ...patch };
    const params = new URLSearchParams();
    if (next.search) params.set('search', next.search);
    if (next.sort !== 'newest') params.set('sort', next.sort);
    if (next.minRating) params.set('minRating', String(next.minRating));
    if (next.minPrice !== undefined)
        params.set('minPrice', String(next.minPrice));
    if (next.maxPrice !== undefined)
        params.set('maxPrice', String(next.maxPrice));
    if (next.inStock) params.set('inStock', 'true');
    if (next.page > 1) params.set('page', String(next.page));

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
}
