// File này là transport adapter cho Order API qua Gateway.
// Client chỉ gửi addressId, COD và note; item, giá, tồn kho và tổng tiền do Order Service quyết định.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    CreateCodOrderInput,
    OrderResponse,
} from '@/app/(public)/checkout/types/checkout.types';

const ORDERS = `${API_BASE_URL}${API_VERSION}/orders`;
const VNPAY_RETURN = `${API_BASE_URL}${API_VERSION}/payments/vnpay/return`;

export type VnpayReturnResponse =
    | { status: 'PAID'; orderId: string }
    | {
          status:
              | 'FAILED'
              | 'REFUND_PENDING'
              | 'REFUNDED'
              | 'PENDING'
              | 'UNVERIFIED';
      };

// Gửi nguyên query VNPay tới backend; client chỉ hiển thị kết quả sau khi server xác minh chữ ký và đối chiếu attempt.
export async function verifyVnpayReturn(
    rawQueryString: string,
): Promise<VnpayReturnResponse> {
    const response = await authorizedAxios.get<VnpayReturnResponse>(
        `${VNPAY_RETURN}${rawQueryString}`,
    );
    return response.data;
}

export type DeliveryIssueReason =
    'NOT_RECEIVED' | 'DAMAGED' | 'WRONG_ITEM' | 'MISSING_ITEM' | 'OTHER';

export interface DeliveryConfirmationInput {
    decision: 'RECEIVED' | 'ISSUE';
    reason?: DeliveryIssueReason;
    itemIds?: string[];
    note?: string;
    evidence?: Array<{ assetId: string; url: string; type: 'image' | 'video' }>;
}

// Gửi quyết định nhận hàng; backend giữ ownership, idempotency và trạng thái cuối cùng của order.
export async function confirmOrderDelivery(
    orderId: string,
    input: DeliveryConfirmationInput,
): Promise<OrderResponse> {
    const response = await authorizedAxios.post<OrderResponse>(
        `${ORDERS}/${orderId}/delivery-confirmation`,
        input,
    );
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
            ...(input.cartItemId ? { cartItemId: input.cartItemId } : {}),
            paymentMethod: input.paymentMethod,
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
    paymentMethod: 'COD' | 'VNPAY';
    shippingFeeBreakdown: Array<{
        shopId: string;
        provider: string;
        fee: string;
        serviceName: string;
    }>;
}

// Quote chỉ truyền addressId; item, shop và số tiền authoritative được đọc ở backend.
export async function getOrderQuote(
    shippingAddressId: string,
    cartItemId?: string,
    paymentMethod: 'COD' | 'VNPAY' = 'COD',
): Promise<OrderQuoteResponse> {
    const response = await authorizedAxios.post<OrderQuoteResponse>(
        `${ORDERS}/quote`,
        {
            shippingAddressId,
            ...(cartItemId ? { cartItemId } : {}),
            paymentMethod,
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
export type CustomerOrderStage = NonNullable<
    OrderResponse['fulfillmentStatus']
>;

export interface CustomerOrderListItem {
    id: string;
    orderNumber: string;
    status: CustomerOrderStatus;
    fulfillmentStatus?: CustomerOrderStage;
    paymentStatus?:
        | 'COD_PENDING_COLLECTION'
        | 'PENDING'
        | 'FAILED'
        | 'PAID'
        | 'REFUND_PENDING'
        | 'REFUNDED';
    paymentMethod: 'COD' | 'VNPAY';
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

export type OrderReturnStatus =
    | 'REQUESTED'
    | 'CUSTOMER_CANCELLED'
    | 'APPROVED'
    | 'REJECTED'
    | 'AWAITING_SHIPMENT'
    | 'IN_TRANSIT'
    | 'SHIPMENT_FAILED'
    | 'RECEIVED'
    | 'INSPECTION_FAILED'
    | 'REFUND_PENDING';
export type OrderReturnReason =
    | 'DAMAGED'
    | 'WRONG_ITEM'
    | 'MISSING_ITEM'
    | 'NOT_AS_DESCRIBED'
    | 'CHANGE_OF_MIND'
    | 'OTHER';

export interface OrderReturnResponse {
    id: string;
    orderId: string;
    shopId: string;
    itemIds: string[];
    status: OrderReturnStatus;
    reason: OrderReturnReason;
    description: string | null;
    evidence: Array<{ assetId: string; url: string; type: 'image' | 'video' }>;
    refundAmount: string;
    refundItemAmount: string;
    refundShippingAmount: string;
    returnShippingFee: string;
    returnShippingCost: string;
    reviewNote: string | null;
    inspectionPassed: boolean | null;
    inspectionNote: string | null;
    inspectedAt: string | null;
    requestedAt: string;
    createdAt: string;
    updatedAt: string;
}

// Tạo return request theo một shop; UI phải tách item nhiều shop thành nhiều request.
export async function createOrderReturn(
    orderId: string,
    input: {
        itemIds: string[];
        reason: OrderReturnReason;
        description?: string;
        evidence?: OrderReturnResponse['evidence'];
    },
): Promise<OrderReturnResponse> {
    const response = await authorizedAxios.post<OrderReturnResponse>(
        `${ORDERS}/${orderId}/returns`,
        input,
    );
    return response.data;
}

// Đọc các request return thuộc order hiện tại.
export async function listOrderReturns(
    orderId: string,
): Promise<OrderReturnResponse[]> {
    const response = await authorizedAxios.get<OrderReturnResponse[]>(
        `${ORDERS}/${orderId}/returns`,
    );
    return response.data;
}

// Hủy request đang chờ seller xử lý.
export async function cancelOrderReturn(
    returnId: string,
): Promise<OrderReturnResponse> {
    const response = await authorizedAxios.post<OrderReturnResponse>(
        `${API_BASE_URL}${API_VERSION}/orders/returns/${returnId}/cancellation`,
    );
    return response.data;
}
