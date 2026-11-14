// Chuyển filter tìm kiếm giữa query string và kiểu state của storefront.
import type {
    ProductSearchFilters,
    ProductSearchSort,
    SearchScope,
} from '../types/product-search.types';

const SEARCH_SORTS: ProductSearchSort[] = [
    'relevance',
    'newest',
    'price_asc',
    'price_desc',
    'rating_desc',
    'sold_desc',
];

// Đọc URL có kiểm tra để bookmark sai page/filter vẫn quay về trạng thái an toàn.
export function readProductSearchFilters(
    params: URLSearchParams,
): ProductSearchFilters {
    const query = params.get('q')?.trim().slice(0, 120) ?? '';
    const pageValue = Number(params.get('page'));
    const minPriceValue = Number(params.get('minPrice'));
    const maxPriceValue = Number(params.get('maxPrice'));
    const minRatingValue = Number(params.get('minRating'));
    const requestedSort = params.get('sort');

    return {
        query,
        sort: SEARCH_SORTS.includes(requestedSort as ProductSearchSort)
            ? (requestedSort as ProductSearchSort)
            : query
              ? 'relevance'
              : 'newest',
        page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
        minPrice:
            params.has('minPrice') &&
            Number.isFinite(minPriceValue) &&
            minPriceValue >= 0
                ? minPriceValue
                : undefined,
        maxPrice:
            params.has('maxPrice') &&
            Number.isFinite(maxPriceValue) &&
            maxPriceValue >= 0
                ? maxPriceValue
                : undefined,
        minRating:
            minRatingValue >= 1 && minRatingValue <= 5
                ? minRatingValue
                : undefined,
        inStock: params.get('inStock') === 'true',
    };
}

// Tạo URL gọn, giữ filter đang áp dụng và reset trang khi thay đổi điều kiện lọc.
export function buildProductSearchHref(
    current: ProductSearchFilters,
    patch: Partial<ProductSearchFilters>,
): string {
    const next = { ...current, ...patch };
    const params = new URLSearchParams();

    if (next.query) params.set('q', next.query);
    const defaultSort = next.query ? 'relevance' : 'newest';
    if (next.sort !== defaultSort) params.set('sort', next.sort);
    if (next.minPrice !== undefined)
        params.set('minPrice', String(next.minPrice));
    if (next.maxPrice !== undefined)
        params.set('maxPrice', String(next.maxPrice));
    if (next.minRating !== undefined)
        params.set('minRating', String(next.minRating));
    if (next.inStock) params.set('inStock', 'true');
    if (next.page > 1) params.set('page', String(next.page));

    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : '/products';
}

// Tạo URL đổi phạm vi tìm kiếm, chỉ giữ query và trang để filter sản phẩm không rò sang kết quả shop.
export function buildSearchScopeHref(
    query: string,
    scope: SearchScope,
    page = 1,
): string {
    const params = new URLSearchParams();
    const normalizedQuery = query.trim().slice(0, 120);

    if (normalizedQuery) params.set('q', normalizedQuery);
    if (scope === 'shops') params.set('type', 'shops');
    if (page > 1) params.set('page', String(page));

    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : '/products';
}
