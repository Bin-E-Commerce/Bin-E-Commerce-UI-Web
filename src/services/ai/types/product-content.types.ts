// File này định nghĩa hợp đồng frontend cho trợ lý AI tạo nội dung sản phẩm.
// Chỉ chứa kiểu dữ liệu của API; không chứa token, user ID, prompt hoặc logic gọi provider.

export interface ProductContentCategoryInput {
    name: string;
    path?: string;
}

export interface ProductContentAttributeInput {
    label: string;
    value: string;
}

export interface ProductContentSellerInput {
    draftName?: string;
    shortDescription?: string;
    description?: string;
    attributes?: ProductContentAttributeInput[];
}

export interface ProductContentImageInput {
    assetId: string;
    publicUrl: string;
    fileName: string;
}

export interface ProductNameSuggestionsRequest {
    category: ProductContentCategoryInput;
    brand?: string;
    sellerInput?: ProductContentSellerInput;
    images: ProductContentImageInput[];
    locale: 'vi-VN';
}

export interface ProductNameSuggestion {
    id: string;
    title: string;
    reason: string;
    recommended: boolean;
}

export interface ProductContentWarning {
    code: string;
    field: string;
    message: string;
}

export interface ProductNameSuggestionsResponse {
    suggestions: ProductNameSuggestion[];
    warnings: ProductContentWarning[];
    requestId: string;
}
