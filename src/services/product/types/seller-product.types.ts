export type SellerProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export type SellerProductSortBy =
    | 'updatedAt'
    | 'createdAt'
    | 'name'
    | 'minPrice'
    | 'totalSold';

export type SellerProductSortOrder = 'ASC' | 'DESC';

export interface SellerProductListItem {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string | null;
    status: SellerProductStatus;
    minPrice: string;
    maxPrice: string;
    totalStock: number;
    variantCount: number;
    primarySku: string | null;
    totalSold: number;
    ratingAvg: string | null;
    reviewCount: number;
    updatedAt: string;
}

export interface SellerProductSummary {
    total: number;
    active: number;
    draft: number;
    inactive: number;
    outOfStock: number;
}

export interface SellerProductListParams {
    search?: string;
    status?: SellerProductStatus;
    sortBy?: SellerProductSortBy;
    sortOrder?: SellerProductSortOrder;
    page?: number;
    pageSize?: number;
}

export interface SellerProductListResponse {
    items: SellerProductListItem[];
    summary: SellerProductSummary;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
