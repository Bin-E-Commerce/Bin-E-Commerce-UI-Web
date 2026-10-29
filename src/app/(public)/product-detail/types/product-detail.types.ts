// File này định nghĩa view-model riêng của product detail; không sở hữu API fetching hay logic ranking.

import type {
    ProductDetail,
    ProductImage,
    ProductVariant,
    PublicProduct,
} from '@/services/product';

// Props của route product detail; segment URL có thể chứa UUID cũ hoặc slug public.
export interface ProductDetailRouteProps {
    params: Promise<{ id: string }>;
}

// Định danh truyền từ route vào client detail trước khi API phân giải thành product UUID.
export interface ProductDetailPageContentProps {
    productIdentifier: string;
}

export interface ProductDetailData {
    product: ProductDetail;
    shopProducts: PublicProduct[];
    recommendations: ProductDetailRecommendation[];
    attributeLabels: Record<string, string>;
}

export interface ProductDetailRecommendation {
    product: PublicProduct;
    rank?: number;
    source?: string;
    reasons?: string[];
    recommendationRequestId?: string;
    recommendationItemId?: string;
    recommendationPolicyVersion?: string;
    recommendationRankingMode?: 'HYBRID' | 'ML_HYBRID';
}

export interface ProductBreadcrumbItem {
    name: string;
    slug?: string;
}

export interface ProductSpecificationItem {
    id: string;
    label: string;
    value: string;
}

export interface ProductPurchaseState {
    selectedVariant: ProductVariant | null;
    selectedValueIds: Record<string, string>;
    quantity: number;
    availableStock: number;
    selectOptionValue: (optionId: string, valueId: string) => void;
    decreaseQuantity: () => void;
    increaseQuantity: () => void;
    setQuantity: (quantity: number) => void;
}

export interface ProductGalleryImage extends ProductImage {
    sourceKey: string;
}
