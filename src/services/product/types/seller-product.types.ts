import type { ProductBrand, ProductDetail } from './product.types';

export type SellerProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type SellerProductPublicationStatus = 'ACTIVE' | 'INACTIVE';

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

export interface SellerProductDetail extends ProductDetail {
    status: SellerProductStatus;
    sellerSku?: string | null;
    gtin?: string | null;
    condition: ProductCondition;
    countryOfOrigin?: string | null;
    packageWeightGrams?: number | null;
    packageLengthCm?: string | null;
    packageWidthCm?: string | null;
    packageHeightCm?: string | null;
}

export type ProductCondition = 'new' | 'used_like_new' | 'used_good';
export type CreateSellerProductStatus = 'DRAFT' | 'ACTIVE';

export interface ProductBrandListParams {
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface ProductBrandListResponse {
    items: ProductBrand[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CreateSellerProductPayload {
    name: string;
    categoryId: string;
    brandId?: string;
    description: string;
    shortDescription?: string;
    gtin?: string;
    sellerSku?: string;
    condition: ProductCondition;
    countryOfOrigin?: string;
    status: CreateSellerProductStatus;
    video?: {
        assetId: string;
        videoUrl: string;
        durationSeconds: number;
    };
    images: Array<{
        imageUrl: string;
        altText?: string;
        sortOrder: number;
        isThumbnail: boolean;
    }>;
    attributes: Array<{
        categoryAttributeId: string;
        selectedOptionIds?: string[];
        valueText?: string;
        valueNumber?: number;
        valueBoolean?: boolean;
    }>;
    options: Array<{
        clientId: string;
        name: string;
        position: number;
        values: Array<{
            clientId: string;
            value: string;
            position: number;
        }>;
    }>;
    variants: Array<{
        optionValueClientIds: string[];
        sku?: string;
        gtin?: string;
        withoutGtin: boolean;
        price: number;
        originalPrice?: number;
        stockQuantity: number;
        imageUrl?: string;
    }>;
    package: {
        weightGrams: number;
        lengthCm: number;
        widthCm: number;
        heightCm: number;
    };
}

export interface UpdateSellerProductPayload extends Omit<CreateSellerProductPayload, 'variants' | 'status' | 'images'> {
    status: SellerProductStatus;
    images: Array<{
        id?: string;
        imageUrl: string;
        altText?: string;
        sortOrder: number;
        isThumbnail: boolean;
    }>;
    variants: Array<{
        id?: string;
        optionValueClientIds: string[];
        sku?: string;
        gtin?: string;
        withoutGtin: boolean;
        price: number;
        originalPrice?: number;
        stockQuantity: number;
        imageUrl?: string;
    }>;
}

export interface UpdateSellerProductResponse {
    id: string;
    slug: string;
    status: SellerProductStatus;
    updatedAt: string;
}

export interface DeleteSellerProductResponse {
    id: string;
    status: 'DELETED';
    updatedAt: string;
}

export interface ChangeSellerProductStatusResponse {
    id: string;
    status: SellerProductPublicationStatus;
    updatedAt: string;
}

export interface CreateSellerProductResponse {
    id: string;
    slug: string;
    status: CreateSellerProductStatus;
    createdAt: string;
}
