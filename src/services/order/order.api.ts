// File này là transport adapter cho Order API qua Gateway.
// Client chỉ gửi addressId, COD và note; item, giá, tồn kho và tổng tiền do Order Service quyết định.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    CreateCodOrderInput,
    OrderResponse,
} from '@/app/(public)/checkout/types/checkout.types';

const ORDERS = `${API_BASE_URL}${API_VERSION}/orders`;

export type DeliveryIssueReason = 'NOT_RECEIVED' | 'DAMAGED' | 'WRONG_ITEM' | 'MISSING_ITEM' | 'OTHER';

export interface DeliveryConfirmationInput {
    decision: 'RECEIVED' | 'ISSUE';
    reason?: DeliveryIssueReason;
    itemIds?: string[];
    note?: string;
}

// Gửi quyết định nhận hàng; backend giữ ownership, idempotency và trạng thái cuối cùng của order.
export async function confirmOrderDelivery(orderId: string, input: DeliveryConfirmationInput): Promise<OrderResponse> {
    const response = await authorizedAxios.post<OrderResponse>(`${ORDERS}/${orderId}/delivery-confirmation`, input);
    return response.data;
}

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

// Gọi quote khi địa chỉ thay đổi để UI hiển thị phí thật từ Order/Shipping Service trước khi submit.
export interface OrderQuoteResponse {
    subtotal: string;
    shippingFee: string;
    totalAmount: string;
    paymentMethod: 'COD';
    shippingFeeBreakdown: Array<{ shopId: string; provider: string; fee: string; serviceName: string }>;
}

// Quote chỉ truyền addressId; item, shop và số tiền authoritative được đọc ở backend.
export async function getOrderQuote(shippingAddressId: string): Promise<OrderQuoteResponse> {
    const response = await authorizedAxios.post<OrderQuoteResponse>(`${ORDERS}/quote`, {
        shippingAddressId,
        paymentMethod: 'COD',
    });
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
export type CustomerOrderStage = NonNullable<OrderResponse['fulfillmentStatus']>;

export interface CustomerOrderListItem {
    id: string;
    orderNumber: string;
    status: CustomerOrderStatus;
    fulfillmentStatus?: CustomerOrderStage;
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
    counts?: CustomerOrderTabCounts;
}

// Số lượng đơn của từng nhóm tab, độc lập với page/filter hiện tại để badge phản ánh đúng toàn bộ tài khoản.
export interface CustomerOrderTabCounts {
    all: number;
    pendingPayment: number;
    toShip: number;
    shipping: number;
    delivered: number;
    completed: number;
    cancelled: number;
    returnRefund: number;
}

export interface CustomerOrderFilter {
    status?: CustomerOrderStatus;
    stage?: CustomerOrderStage;
}

// Lấy lịch sử order thuộc tài khoản hiện tại, filter và phân trang tại server.
export async function listOrders(
    input: CustomerOrderFilter & {
        page?: number;
        pageSize?: number;
    } = {},
): Promise<CustomerOrderListResponse> {
    const response = await authorizedAxios.get<CustomerOrderListResponse>(
        ORDERS,
        {
            params: {
                page: input.page ?? 1,
                pageSize: input.pageSize ?? 10,
                ...(input.status ? { status: input.status } : {}),
                ...(input.stage ? { stage: input.stage } : {}),
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
