import type { CatalogCategoryAttribute } from '@/services/catalog';
import type { ProductBrand } from '@/services/product';

export interface ProductCreateImageValue {
    assetId: string;
    publicUrl: string;
    previewUrl: string;
    fileName: string;
}

export interface ProductCreateVideoValue {
    assetId: string;
    publicUrl: string;
    previewUrl: string;
    fileName: string;
    durationSeconds: number;
}

export interface ProductCreateAttributeValue {
    selectedOptionIds: string[];
    valueText: string;
    valueNumber: string;
    valueBoolean: boolean | null;
}

export interface ProductCreateOptionValue {
    clientId: string;
    value: string;
}

export interface ProductCreateOption {
    clientId: string;
    name: string;
    values: ProductCreateOptionValue[];
}

export interface ProductCreateVariant {
    key: string;
    label: string;
    optionValueClientIds: string[];
    sku: string;
    gtin: string;
    withoutGtin: boolean;
    price: string;
    originalPrice: string;
    stockQuantity: string;
    imageUrl: string;
}

export interface SellerProductCreateFormValues {
    name: string;
    categoryId: string;
    brandId: string;
    description: string;
    shortDescription: string;
    gtin: string;
    sellerSku: string;
    condition: 'new' | 'used_like_new' | 'used_good';
    countryOfOrigin: string;
    images: ProductCreateImageValue[];
    video: ProductCreateVideoValue | null;
    attributes: Record<string, ProductCreateAttributeValue>;
    options: ProductCreateOption[];
    variants: ProductCreateVariant[];
    package: {
        weightGrams: string;
        lengthCm: string;
        widthCm: string;
        heightCm: string;
    };
}

export interface SellerProductCreateReferences {
    category: { id: string; name: string; path: string | null } | null;
    brand: ProductBrand | null;
    attributes: CatalogCategoryAttribute[];
}

export interface ProductCreateSectionDefinition {
    id: 'basic' | 'details' | 'sales' | 'shipping' | 'other';
    label: string;
}
