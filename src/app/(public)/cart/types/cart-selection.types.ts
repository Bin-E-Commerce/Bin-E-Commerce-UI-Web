// Kiểu dữ liệu trình bày cho lựa chọn sản phẩm trong cart.
// Các ID chỉ quyết định dòng hàng nào đi sang checkout; giá và tồn kho vẫn do Order Service xác nhận.

import type { Cart, CartItem } from './cart.types';

// Props của danh sách cart được lấy từ response đã chuẩn hóa của Cart Service.
export interface CartItemsViewProps {
    cart: Cart;
}

// Cùng bộ thao tác số lượng và xóa được dùng ở trang giỏ lẫn giỏ xem trước.
export interface CartItemActionsProps {
    item: CartItem;
    compact?: boolean;
    mode?: 'all' | 'quantity' | 'remove';
}

// Nhãn tồn kho chỉ đọc dữ liệu trình bày của một dòng sản phẩm.
export interface CartItemAvailabilityProps {
    item: CartItem;
}

// Trạng thái selection giữ item được tick và các tổng tạm tính chỉ phục vụ giao diện.
export interface CartSelectionState {
    selectedItemIds: string[];
    selectedItems: CartItem[];
    selectedQuantity: number;
    selectedSubtotal: string;
    selectableItemCount: number;
    isAllSelected: boolean;
    isPartiallySelected: boolean;
    toggleAll(checked: boolean): void;
    toggleItem(itemId: string, checked: boolean): void;
}
