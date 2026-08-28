// Type này mô tả response Cart Service mà frontend cần cho Phase 1.
// Type chưa mô tả item detail vì Add Item chưa nằm trong phạm vi phase này.

export type CartOwnerType = "CUSTOMER" | "GUEST";
export type CartStatus = "ACTIVE" | "CHECKED_OUT" | "ABANDONED";

// Contract cart rỗng dùng cho trang giỏ hàng và các badge sau này.
export interface Cart {
    id: string;
    ownerType: CartOwnerType;
    ownerId: string;
    status: CartStatus;
    items: [];
    totalItems: 0;
    warnings: [];
    createdAt: string;
    updatedAt: string;
}
