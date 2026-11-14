// Contract UI của trang tìm kiếm và các option hiển thị trong combobox header.
import type {
    ListProductsParams,
    ProductSearchSuggestion,
} from '@/services/product';
import type { PublicShopListItem } from '@/services/seller';

export type SearchScope = 'products' | 'shops';

export type ProductSearchSort = NonNullable<ListProductsParams['sort']>;

export interface ProductSearchFilters {
    query: string;
    sort: ProductSearchSort;
    page: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock: boolean;
}

export interface ProductSuggestionOption {
    id: string;
    kind: 'product';
    label: string;
    product: ProductSearchSuggestion;
}

export interface ShopSuggestionOption {
    id: string;
    kind: 'shop';
    label: string;
    shop: PublicShopListItem;
}

export type ProductSearchOption =
    ProductSuggestionOption | ShopSuggestionOption;

export interface ProductSearchBoxProps {
    variant: 'header' | 'page';
    initialQuery?: string;
    searchScope?: SearchScope;
    onSearchScopeChange?: (scope: SearchScope, query: string) => void;
}

export interface SearchOptionRowProps {
    option: ProductSearchOption;
}
