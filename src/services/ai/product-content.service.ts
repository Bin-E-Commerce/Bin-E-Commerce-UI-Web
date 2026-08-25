// File này là adapter HTTP cho các use case AI liên quan đến product content.
// Request luôn đi qua API Gateway bằng authorizedAxios để JWT, CSRF và permission được xử lý ở backend.
// Không gọi trực tiếp ai-service từ trình duyệt và không đưa OPENAI_API_KEY vào bundle frontend.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ProductDescriptionSuggestionsRequest,
    ProductDescriptionSuggestionsResponse,
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

// Gửi context tới Gateway để AI service tạo một bản mô tả; frontend không biết OpenAI key/provider.
async function generateProductDescriptionSuggestions(
    payload: ProductDescriptionSuggestionsRequest,
): Promise<ProductDescriptionSuggestionsResponse> {
    const response = await authorizedAxios.post<ProductDescriptionSuggestionsResponse>(
        `${API_VERSION}/seller/ai/product-content/description-suggestions`,
        payload,
    );
    return response.data;
}

export const productContentAiService = {
    generateProductNameSuggestions,
    generateProductDescriptionSuggestions,
};
