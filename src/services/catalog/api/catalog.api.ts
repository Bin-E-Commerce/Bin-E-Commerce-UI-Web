import { API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';
import type {
    CatalogCategory,
    CatalogCategoryAttribute,
    ListCategoriesParams,
    ListCategoryAttributesParams,
    PaginatedCatalogResponse,
} from '../types/catalog.types';

export const catalogService = {
    // Lấy danh mục từ catalog-service thông qua API Gateway để FE không cần biết URL nội bộ của service.
    listCategories: (params: ListCategoriesParams = {}) =>
        publicAxios
            .get<
                PaginatedCatalogResponse<CatalogCategory>
            >(`${API_VERSION}/categories`, { params })
            .then((response) => response.data),

    // Lấy một category đã chọn để hiển thị đầy đủ đường dẫn và xác nhận đây là category lá.
    getCategory: (categoryId: string) =>
        publicAxios
            .get<CatalogCategory>(`${API_VERSION}/categories/${categoryId}`)
            .then((response) => response.data),

    // Lấy schema thuộc tính động của category để form không hard-code trường theo từng ngành hàng.
    listCategoryAttributes: (
        categoryId: string,
        params: ListCategoryAttributesParams = {
            includeOptions: true,
            includeConditional: true,
        },
    ) =>
        publicAxios
            .get<
                CatalogCategoryAttribute[]
            >(`${API_VERSION}/categories/${categoryId}/attributes`, { params })
            .then((response) => response.data),
};
