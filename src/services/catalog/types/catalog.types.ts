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

