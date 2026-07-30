import type {
    ProductDetail,
    ProductImage,
    ProductVariant,
    PublicProduct,
} from '@/services/product';

export interface ProductDetailData {
    product: ProductDetail;
    recommendations: PublicProduct[];
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
