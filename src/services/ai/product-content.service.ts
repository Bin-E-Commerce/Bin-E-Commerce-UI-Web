// File này là adapter HTTP cho các use case AI liên quan đến product content.
// Request luôn đi qua API Gateway bằng authorizedAxios để JWT, CSRF và permission được xử lý ở backend.
// Không gọi trực tiếp ai-service từ trình duyệt và không đưa OPENAI_API_KEY vào bundle frontend.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ProductNameSuggestionsRequest,
    ProductNameSuggestionsResponse,
} from './types/product-content.types';

// Gửi context tối thiểu tới Gateway; seller luôn phải chủ động bấm nút nên không có request ngầm khi nhập form.
async function generateProductNameSuggestions(
    payload: ProductNameSuggestionsRequest,
): Promise<ProductNameSuggestionsResponse> {
    const response = await authorizedAxios.post<ProductNameSuggestionsResponse>(
        `${API_VERSION}/seller/ai/product-content/name-suggestions`,
        payload,
    );
    return response.data;
}

export const productContentAiService = {
    generateProductNameSuggestions,
};
