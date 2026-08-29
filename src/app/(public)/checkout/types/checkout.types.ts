// File này chứa các type trình bày của checkout, tách khỏi entity và DTO backend.

import type { UserAddress } from '@/services/auth';

// Input form checkout được hook chuyển thành request Order API có idempotency key.
export interface CreateCodOrderInput {
    shippingAddressId: string;
    note?: string;
    idempotencyKey: string;
}

// Response order tối thiểu để trang checkout hiển thị kết quả tạo đơn.
export interface OrderResponse {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
    paymentMethod: 'COD';
    subtotal: string;
    shippingFee: string;
    totalAmount: string;
    note: string | null;
    shippingAddress: Pick<UserAddress, 'fullName' | 'phone' | 'province' | 'district' | 'ward' | 'street'> & { label?: string };
    items: OrderItemResponse[];
    warnings: string[];
    createdAt: string;
}

// Item snapshot giúp success state hiển thị đúng những gì server đã chốt.
export interface OrderItemResponse {
    id: string;
    productId: string;
    variantId: string;
    sellerShopId: string | null;
    sku: string;
    productName: string;
    variantName: string;
    imageUrl: string | null;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
}
