export interface ProductBrand {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    countryCode?: string | null;
    countryName?: string | null;
}

export interface ProductExternalShop {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string | null;
    sourcePlatform: string;
    description?: string | null;
    sourceUrl?: string | null;
    ratingAvg?: string | null;
    reviewCount?: number;
    followerCount?: number;
}

export interface ProductImage {
    id: string;
    imageUrl: string;
    altText?: string | null;
    sortOrder: number;
    isThumbnail: boolean;
}

export interface ProductInventory {
    id: string;
    quantityAvailable: number;
    quantityReserved: number;
    quantitySold: number;
    lowStockThreshold: number;
}

export interface ProductOptionValue {
    id: string;
    value: string;
    position: number;
}

export interface ProductOption {
    id: string;
    name: string;
    position: number;
    values: ProductOptionValue[];
}

export interface ProductVariantOptionChoice {
    optionValueId: string;
    optionValue: ProductOptionValue & {
        option: Pick<ProductOption, 'id' | 'name' | 'position'>;
    };
}

export interface ProductVariant {
    id: string;
    sellerSku?: string | null;
    sku: string;
    gtin?: string | null;
    withoutGtin?: boolean;
    name: string;
    price: string;
    originalPrice?: string | null;
    stockQuantity: number;
    imageUrl?: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    inventory?: ProductInventory | null;
    optionChoices: ProductVariantOptionChoice[];
}

export interface ProductAttributeValue {
    id: string;
    categoryAttributeId: string;
    valueText?: string | null;
    valueNumber?: string | null;
    valueBoolean?: boolean | null;
    metadata?: Record<string, unknown>;
}

export interface ProductReview {
    id: string;
    userId?: string | null;
    rating: number;
    content?: string | null;
    images: string[];
    status: string;
    createdAt: string;
}

export interface PublicProduct {
    id: string;
    originType?: 'INTERNAL' | 'EXTERNAL';
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

export interface ProductDetail extends PublicProduct {
    description?: string | null;
    categoryId: string;
    viewCount: number;
    videoAssetId?: string | null;
    videoUrl?: string | null;
    videoDurationSeconds?: number | null;
    metadata?: Record<string, unknown>;
    variants: ProductVariant[];
    options: ProductOption[];
    attributeValues: ProductAttributeValue[];
    reviews: ProductReview[];
    createdAt: string;
    updatedAt: string;
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
