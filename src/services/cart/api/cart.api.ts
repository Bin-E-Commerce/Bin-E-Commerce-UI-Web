// Adapter này gọi Cart API qua Gateway bằng authorizedAxios để dùng chung cấu hình CORS và auth.
// Adapter không tự quyết định ownership; Guest session chỉ được truyền bằng request header.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    AddCartItemInput,
    Cart,
    UpdateCartItemInput,
} from '@/app/(public)/cart/types/cart.types';

// Lấy hoặc khởi tạo active cart của Customer hoặc Guest hiện tại.
export async function getActiveCart(guestSessionId?: string): Promise<Cart> {
    const response = await authorizedAxios.get<Cart>(`${API_VERSION}/cart`, {
        headers: guestSessionId
            ? { 'X-Session-Id': guestSessionId }
            : undefined,
    });
    return response.data;
}

// Thêm một variant vào active cart bằng dữ liệu tối thiểu; backend tự xác thực giá, trạng thái và tồn kho.
export async function addCartItem(input: AddCartItemInput): Promise<Cart> {
    const response = await authorizedAxios.post<Cart>(
        `${API_VERSION}/cart/items`,
        input,
    );
    return response.data;
}

// Cập nhật số lượng tuyệt đối để server kiểm tra tồn kho và trả về cart chính thức sau mutation.
export async function updateCartItem(
    input: UpdateCartItemInput,
): Promise<Cart> {
    const response = await authorizedAxios.patch<Cart>(
        `${API_VERSION}/cart/items/${input.itemId}`,
        { quantity: input.quantity },
    );
    return response.data;
}

// Xóa một item bằng itemId; Cart Service tự xác định cart theo user context từ Gateway.
export async function removeCartItem(itemId: string): Promise<Cart> {
    const response = await authorizedAxios.delete<Cart>(
        `${API_VERSION}/cart/items/${itemId}`,
    );
    return response.data;
}
