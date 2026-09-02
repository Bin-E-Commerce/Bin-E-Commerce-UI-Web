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
    fulfillmentStatus?:
        | 'TO_SHIP'
        | 'SHIPPING'
        | 'DELIVERED'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'DELIVERY_FAILED'
        | 'RETURN_REFUND';
    paymentStatus?: 'COD_PENDING_COLLECTION' | 'PAID' | 'REFUND_PENDING';
    paymentMethod: 'COD';
    subtotal: string;
    shippingFee: string;
    totalAmount: string;
    shippingFeeBreakdown?: Array<Record<string, unknown>>;
    note: string | null;
    shippingAddress: Pick<
        UserAddress,
        | 'fullName'
        | 'phone'
        | 'province'
        | 'district'
        | 'ward'
        | 'street'
        | 'ghnProvinceId'
        | 'ghnProvinceName'
        | 'ghnDistrictId'
        | 'ghnDistrictName'
        | 'ghnWardCode'
        | 'ghnWardName'
    > & { label?: string };
    items: OrderItemResponse[];
    cancelReason: string | null;
    cancelledAt: string | null;
    statusHistory: OrderStatusHistoryResponse[];
    warnings: string[];
    createdAt: string;
    completedAt: string | null;
    deliveryConfirmation: DeliveryConfirmationResponse;
}

export interface DeliveryConfirmationResponse {
    status: 'PENDING' | 'CONFIRMED' | 'ISSUE_REPORTED' | 'AUTO_CONFIRMED';
    method: 'CUSTOMER' | 'AUTO' | null;
    deliveredAt: string | null;
    deadline: string | null;
}

export interface OrderStatusHistoryResponse {
    id: string;
    fromStatus: OrderResponse['status'] | null;
    toStatus: OrderResponse['status'];
    reason: string;
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
