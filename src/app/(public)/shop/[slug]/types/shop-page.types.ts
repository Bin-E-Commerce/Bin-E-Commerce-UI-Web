// UI contract cho trang shop public.
// Filter được giữ trong URL để refresh/chia sẻ link vẫn bảo toàn ngữ cảnh catalog.

export interface ShopCatalogFilters {
    search: string;
    sort: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'sold_desc';
    minRating?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock: boolean;
    page: number;
}
