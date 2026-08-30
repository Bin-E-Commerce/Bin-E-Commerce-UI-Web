// File này là transport adapter cho Seller Order API; shop scope và dữ liệu nhạy cảm luôn do backend quyết định.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type { CustomerOrderStatus } from './order.api';

const SELLER_ORDERS = `${API_BASE_URL}${API_VERSION}/seller/orders`;

export type SellerOrderStatus = CustomerOrderStatus;

export interface SellerOrderPreviewItem {
    productId: string;
    productName: string;
    variantName: string;
    imageUrl: string | null;
    quantity: number;
    lineTotal: string;
}

export interface SellerOrderListItem {
    id: string;
    orderNumber: string;
    status: SellerOrderStatus;
    paymentMethod: 'COD';
    shopItemTotal: string;
    itemCount: number;
    previewItems: SellerOrderPreviewItem[];
    createdAt: string;
}

export interface SellerOrderListResponse {
    items: SellerOrderListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface SellerOrderItem {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    imageUrl: string | null;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
}

export interface SellerOrderResponse {
    id: string;
    orderNumber: string;
    status: SellerOrderStatus;
    paymentMethod: 'COD';
    shopItemTotal: string;
    shippingAddress: Record<string, string>;
    items: SellerOrderItem[];
    cancelReason: string | null;
    cancelledAt: string | null;
    statusHistory: Array<{
        id: string;
        fromStatus: SellerOrderStatus | null;
        toStatus: SellerOrderStatus;
        reason: string;
        createdAt: string;
    }>;
    createdAt: string;
}

export interface SellerOrderListParams {
    page?: number;
    pageSize?: number;
    status?: SellerOrderStatus;
    search?: string;
}

// Lấy danh sách order đã được backend giới hạn theo shop của seller hiện tại.
export async function listSellerOrders(
    input: SellerOrderListParams = {},
): Promise<SellerOrderListResponse> {
    const response = await authorizedAxios.get<SellerOrderListResponse>(
        SELLER_ORDERS,
        {
            params: {
                page: input.page ?? 1,
                pageSize: input.pageSize ?? 10,
                ...(input.status ? { status: input.status } : {}),
                ...(input.search?.trim()
                    ? { search: input.search.trim() }
                    : {}),
            },
        },
    );
    return response.data;
}

// Lấy snapshot detail của order trong phạm vi shop hiện tại; backend trả 404 nếu order không thuộc shop.
export async function getSellerOrder(
    orderId: string,
): Promise<SellerOrderResponse> {
    const response = await authorizedAxios.get<SellerOrderResponse>(
        `${SELLER_ORDERS}/${orderId}`,
    );
    return response.data;
}
