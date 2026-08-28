// Adapter này gọi Cart API qua Gateway bằng authorizedAxios để dùng chung cấu hình CORS và auth.
// Adapter không tự quyết định ownership; Guest session chỉ được truyền bằng request header.

import { API_VERSION } from "@/config/api.config";
import authorizedAxios from "@/utils/authorizedAxios";
import type { Cart } from "@/features/cart/types/cart.types";

// Lấy hoặc khởi tạo active cart của Customer hoặc Guest hiện tại.
export async function getActiveCart(guestSessionId?: string): Promise<Cart> {
    const response = await authorizedAxios.get<Cart>(`${API_VERSION}/cart`, {
        headers: guestSessionId ? { "X-Session-Id": guestSessionId } : undefined,
    });
    return response.data;
}
