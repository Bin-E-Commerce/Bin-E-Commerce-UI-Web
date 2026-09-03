// File này định nghĩa contract product/review dùng giữa API và các màn hình web.
// Các field like chỉ là read model công khai; userId nội bộ không được dùng để render danh tính khách hàng.
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
    reviewerName?: string | null;
    reviewerAvatarUrl?: string | null;
    isAnonymous?: boolean;
    rating: number;
    title?: string | null;
    content?: string | null;
    images: string[];
    videos: string[];
    status: string;
    createdAt: string;
    updatedAt?: string;
    likeCount?: number;
    likedByCurrentUser?: boolean;
    variantName?: string | null;
}

export interface OrderReviewItemStatus {
    orderItemId: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    imageUrl: string | null;
    canReview: boolean;
    canEdit: boolean;
    review: {
        id: string;
        rating: number;
        status: string;
        title: string | null;
        content: string | null;
        images: string[];
        videos: string[];
        isAnonymous: boolean;
        createdAt: string;
        updatedAt: string;
    } | null;
}

export interface OrderReviewStatusResponse {
    orderId: string;
    canReview: boolean;
    reviewDeadline: string | null;
    items: OrderReviewItemStatus[];
}

export interface PublicProduct {
    id: string;
    originType?: 'INTERNAL' | 'EXTERNAL';
    sellerShopId?: string | null;
    name: string;
    slug: string;
    shortDescription?: string | null;
    minPrice: string;
    maxPrice: string;
    displayPrice: string;
    displayOriginalPrice: string | null;
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
    sellerShopId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'sold_desc';
}

export interface ShopCatalogSummary {
    shopId: string;
    productCount: number;
    ratingAvg: string | null;
    reviewCount: number;
    categoryIds: string[];
}

export interface PaginatedProductResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
