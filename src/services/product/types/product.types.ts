export interface ProductBrand {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
}

export interface ProductExternalShop {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string | null;
    sourcePlatform: string;
}

export interface ProductImage {
    id: string;
    imageUrl: string;
    altText?: string | null;
    sortOrder: number;
    isThumbnail: boolean;
}

export interface PublicProduct {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string | null;
    minPrice: string;
    maxPrice: string;
    totalSold: number;
    ratingAvg?: string | null;
    reviewCount: number;
    sourcePlatform?: string | null;
    sourceUrl?: string | null;
    brand?: ProductBrand | null;
    externalShop?: ProductExternalShop | null;
    images?: ProductImage[];
}

export interface ListProductsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    originType?: 'INTERNAL' | 'EXTERNAL';
    status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface PaginatedProductResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
