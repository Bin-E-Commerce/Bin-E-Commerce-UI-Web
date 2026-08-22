export interface CatalogCategory {
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    level: number;
    path: string | null;
    imageUrl: string | null;
    sortOrder: number;
    isLeaf: boolean;
    isActive: boolean;
    sourcePlatform: string;
    externalCategoryId: string;
}

export interface PaginatedCatalogResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ListCategoriesParams {
    parentId?: string;
    level?: number;
    isLeaf?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
}

export type CatalogAttributeInputType =
    | 'TEXT'
    | 'TEXTAREA'
    | 'INTEGER'
    | 'DECIMAL'
    | 'BOOLEAN'
    | 'DATE'
    | 'DATETIME'
    | 'SINGLE_SELECT'
    | 'MULTI_SELECT';

export interface CatalogCategoryAttributeOption {
    id: string;
    attributeId: string;
    value: string;
    displayValue: string;
    sortOrder: number;
    isActive: boolean;
}

export interface CatalogCategoryAttribute {
    id: string;
    categoryId: string;
    parentAttributeId: string | null;
    triggerOptionId: string | null;
    name: string;
    displayName: string;
    slug: string;
    inputType: CatalogAttributeInputType;
    isRequired: boolean;
    isFilterable: boolean;
    maxSelections: number | null;
    sortOrder: number;
    isActive: boolean;
    options: CatalogCategoryAttributeOption[];
}

export interface ListCategoryAttributesParams {
    includeOptions?: boolean;
    includeConditional?: boolean;
}
