import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    CreateShopProfileChangeRequestPayload,
    ShopProfileChangeRequestDto,
    ShopProfileDto,
    UpdateShopProfilePayload,
} from '../types/shop-profile.types';

const SHOP_PROFILE_ENDPOINT = `${API_VERSION}/seller/shop/profile`;

export const shopProfileService = {
    // Lấy hồ sơ của shop thuộc phiên đăng nhập hiện tại; ownerId luôn do gateway suy ra từ access token.
    getMine: () =>
        authorizedAxios
            .get<ShopProfileDto>(SHOP_PROFILE_ENDPOINT)
            .then((response) => response.data),

    // Cập nhật whitelist thông tin công khai và không cho frontend tác động tới slug, thuế hay định danh đã duyệt.
    updateMine: (payload: UpdateShopProfilePayload) =>
        authorizedAxios
            .patch<ShopProfileDto>(SHOP_PROFILE_ENDPOINT, payload)
            .then((response) => response.data),

    // Gửi thay đổi nhạy cảm để admin đối chiếu; dữ liệu hiện hành chưa bị ghi đè ở bước này.
    createChangeRequest: (payload: CreateShopProfileChangeRequestPayload) =>
        authorizedAxios
            .post<ShopProfileChangeRequestDto>(
                `${SHOP_PROFILE_ENDPOINT}/change-requests`,
                payload,
            )
            .then((response) => response.data),
};
