// Hàm này xác định dòng hàng nào được phép đưa vào selection checkout trong cart.
// Chặn trạng thái hết hàng, thiếu số lượng hoặc ngừng bán; UNKNOWN vẫn cho chọn vì server sẽ xác minh lại lúc checkout.

import type { CartItem } from '../types/cart.types';

// Giữ selection an toàn mà không xóa hàng khỏi cart khi Product Service chưa xác nhận được tồn kho.
export function isCartItemSelectable(item: CartItem): boolean {
    return (
        item.availabilityStatus !== 'OUT_OF_STOCK' &&
        item.availabilityStatus !== 'INSUFFICIENT_STOCK' &&
        item.availabilityStatus !== 'UNAVAILABLE'
    );
}
