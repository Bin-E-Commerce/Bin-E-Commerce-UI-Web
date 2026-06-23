import { API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';
import type {
    CatalogCategory,
    ListCategoriesParams,
    PaginatedCatalogResponse,
} from './types/catalog.types';

export const catalogService = {
    // Lấy danh mục từ catalog-service thông qua API Gateway để FE không cần biết URL nội bộ của service.
    listCategories: (params: ListCategoriesParams = {}) =>
        publicAxios
            .get<PaginatedCatalogResponse<CatalogCategory>>(
                `${API_VERSION}/categories`,
                { params },
            )
            .then((response) => response.data),
};

