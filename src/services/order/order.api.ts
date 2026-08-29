// File này là transport adapter cho Order API qua Gateway.
// Client chỉ gửi addressId, COD và note; item, giá, tồn kho và tổng tiền do Order Service quyết định.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    CreateCodOrderInput,
    OrderResponse,
} from '@/app/(public)/checkout/types/checkout.types';

const ORDERS = `${API_BASE_URL}${API_VERSION}/orders`;

// Tạo order COD với idempotency key để double click hoặc retry mạng không tạo đơn trùng.
export async function createCodOrder(
    input: CreateCodOrderInput,
): Promise<OrderResponse> {
    const response = await authorizedAxios.post<OrderResponse>(
        ORDERS,
        {
            shippingAddressId: input.shippingAddressId,
            paymentMethod: 'COD',
            note: input.note?.trim() || undefined,
        },
        {
            headers: { 'Idempotency-Key': input.idempotencyKey },
        },
    );
    return response.data;
}

// Lấy chi tiết order thuộc user hiện tại cho màn hình kết quả hoặc refresh trang sau này.
export async function getOrder(orderId: string): Promise<OrderResponse> {
    const response = await authorizedAxios.get<OrderResponse>(
        `${ORDERS}/${orderId}`,
    );
    return response.data;
}

export type CustomerOrderStatus = OrderResponse['status'];

export interface CustomerOrderListItem {
    id: string;
    orderNumber: string;
    status: CustomerOrderStatus;
    paymentMethod: 'COD';
    totalAmount: string;
    itemCount: number;
    previewItems: Array<{
        productId: string;
        variantId: string;
        productName: string;
        variantName: string;
        imageUrl: string | null;
        quantity: number;
    }>;
    createdAt: string;
}

export interface CustomerOrderListResponse {
    items: CustomerOrderListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Lấy lịch sử order thuộc tài khoản hiện tại, filter và phân trang tại server.
export async function listOrders(
    input: {
        page?: number;
        pageSize?: number;
        status?: CustomerOrderStatus;
    } = {},
): Promise<CustomerOrderListResponse> {
    const response = await authorizedAxios.get<CustomerOrderListResponse>(
        ORDERS,
        {
            params: {
                page: input.page ?? 1,
                pageSize: input.pageSize ?? 10,
                ...(input.status ? { status: input.status } : {}),
            },
        },
    );
    return response.data;
}

// Hủy order COD; backend là nơi quyết định trạng thái và release tồn kho.
export async function cancelOrder(
    orderId: string,
    reason?: string,
): Promise<OrderResponse> {
    const response = await authorizedAxios.post<OrderResponse>(
        `${ORDERS}/${orderId}/cancel`,
        {
            ...(reason?.trim() ? { reason: reason.trim() } : {}),
        },
    );
    return response.data;
}
