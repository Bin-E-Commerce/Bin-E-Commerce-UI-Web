// File này chuyển state wizard thành payload mô tả tối thiểu; không gửi shortDescription hay định danh UI dư thừa.
// Ảnh chỉ được gửi khi có assetId, tên file và HTTPS public URL đã sẵn sàng.

import type { ProductDescriptionSuggestionsRequest } from '@/services/ai';
import type {
    SellerProductCreateFormValues,
    SellerProductCreateReferences,
} from '../../../types/seller-product-create-form.type';
import { buildProductNameSuggestionRequest } from '../../product-content-assistant/utils/build-product-name-request';

// Tái sử dụng mapper context đã kiểm soát để name và description luôn gửi cùng category/brand/attributes.
export function buildProductDescriptionRequest(
    values: SellerProductCreateFormValues,
    references: SellerProductCreateReferences,
): ProductDescriptionSuggestionsRequest {
    const request = buildProductNameSuggestionRequest(values, references);
    const sellerInput = request.sellerInput;
    return {
        ...request,
        sellerInput: sellerInput
            ? {
                  ...(sellerInput.draftName ? { draftName: sellerInput.draftName } : {}),
                  ...(sellerInput.description ? { description: sellerInput.description } : {}),
                  ...(sellerInput.attributes?.length ? { attributes: sellerInput.attributes } : {}),
              }
            : undefined,
    };
}
