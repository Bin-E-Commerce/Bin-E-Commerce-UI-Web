// API adapter cho shop public.
// authorizedAxios vẫn cho guest đọc GET và tự đính kèm token khi customer đã đăng nhập.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type { PublicShopResponse } from '../types/public-shop.types';

// Encode identifier để slug có ký tự đặc biệt không làm vỡ path khi adapter gọi API.
const shopEndpoint = (identifier: string) =>
    `${API_VERSION}/shops/${encodeURIComponent(identifier)}`;

// Adapter giữ toàn bộ URL và HTTP method của public shop ở một boundary duy nhất.
export const publicShopService = {
    // Đọc hồ sơ public và trạng thái follow hiện tại của viewer.
    getBySlug: (slug: string) =>
        authorizedAxios
            .get<PublicShopResponse>(shopEndpoint(slug))
            .then((response) => response.data),

    // Theo dõi shop; backend tự resolve user từ JWT, không nhận followerId từ body.
    follow: (slug: string) =>
        authorizedAxios
            .put<PublicShopResponse>(`${shopEndpoint(slug)}/follow`)
            .then((response) => response.data),

    // Bỏ theo dõi shop theo cùng resource và permission với thao tác follow.
    unfollow: (slug: string) =>
        authorizedAxios
            .delete<PublicShopResponse>(`${shopEndpoint(slug)}/follow`)
            .then((response) => response.data),
};
