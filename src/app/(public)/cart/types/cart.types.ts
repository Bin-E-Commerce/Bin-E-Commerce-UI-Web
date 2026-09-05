// Type này mô tả response Cart Service mà frontend dùng cho active cart và các item đã thêm.
// Snapshot chỉ phục vụ hiển thị; checkout sau này phải xác thực lại giá và tồn kho từ nguồn chính thức.

export type CartOwnerType = "CUSTOMER" | "GUEST";
export type CartStatus = "ACTIVE" | "CHECKED_OUT" | "ABANDONED";

// Input gửi tới Add Item API; frontend không được gửi snapshot giá hoặc tồn kho.
export interface AddCartItemInput {
    productId: string;
    variantId: string;
    quantity: number;
}

// Input đặt quantity mới cho một cart item; quantity bằng 0 phải dùng API remove item riêng.
export interface UpdateCartItemInput {
    itemId: string;
    quantity: number;
}

// Contract cart rỗng dùng cho trang giỏ hàng và các badge sau này.
export interface Cart {
    id: string;
    ownerType: CartOwnerType;
    ownerId: string;
    status: CartStatus;
    items: CartItem[];
    totalItems: number;
    subtotal: string;
    warnings: string[];
    createdAt: string;
    updatedAt: string;
}

// Dòng hàng dùng để render cart; lineTotal đã được backend tính từ snapshot unitPrice.
export interface CartItem {
    id: string;
    productId: string;
    variantId: string;
    sellerShopId: string | null;
    originType: 'INTERNAL' | 'EXTERNAL';
    sku: string;
    productName: string;
    variantName: string;
    imageUrl: string | null;
    unitPrice: string;
    originalPrice: string | null;
    quantity: number;
    lineTotal: string;
}
