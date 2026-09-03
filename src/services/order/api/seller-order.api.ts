// File này là transport adapter cho Seller Order API; shop scope và dữ liệu nhạy cảm luôn do backend quyết định.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type { CustomerOrderStage, CustomerOrderStatus } from './order.api';
import type { OrderReturnResponse, OrderReturnStatus } from './order.api';

const SELLER_ORDERS = `${API_BASE_URL}${API_VERSION}/seller/orders`;

export type SellerOrderStatus = CustomerOrderStatus | CustomerOrderStage;
export type SellerOrderStage = CustomerOrderStage;

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
    paymentStatus?:
        'COD_PENDING_COLLECTION' | 'PAID' | 'REFUND_PENDING';
    fulfillmentStatus?: SellerOrderStage;
    paymentMethod: 'COD';
    shopItemTotal: string;
    shippingFee?: string;
    shippingFeeBreakdown?: Array<Record<string, unknown>>;
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
    counts: SellerOrderTabCounts;
}

// Số lượng theo từng bước Seller; returnRefund chỉ gồm yêu cầu Seller còn phải duyệt hoặc kiểm tra.
export interface SellerOrderTabCounts {
    all: number;
    toShip: number;
    shipping: number;
    delivered: number;
    completed: number;
    cancelled: number;
    returnRefund: number;
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
    fulfillmentStatus?: SellerOrderStage;
    paymentStatus?:
        'COD_PENDING_COLLECTION' | 'PAID' | 'REFUND_PENDING';
    paymentMethod: 'COD';
    shopItemTotal: string;
    shippingFee: string;
    shippingFeeBreakdown: Array<Record<string, unknown>>;
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
    stage?: SellerOrderStage;
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
                ...(input.stage ? { stage: input.stage } : {}),
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

// Lấy queue hoàn hàng theo shop hiện tại; backend tự áp dụng shop scope từ session.
export async function listSellerReturns(
    status?: OrderReturnStatus,
): Promise<OrderReturnResponse[]> {
    const response = await authorizedAxios.get<OrderReturnResponse[]>(
        `${SELLER_ORDERS}/returns`,
        {
            params: status ? { status } : undefined,
        },
    );
    return response.data;
}

// Seller duyệt hoặc từ chối một yêu cầu hoàn hàng.
export async function reviewSellerReturn(
    returnId: string,
    approved: boolean,
    note?: string,
): Promise<OrderReturnResponse> {
    const response = await authorizedAxios.post<OrderReturnResponse>(
        `${SELLER_ORDERS}/returns/${returnId}/${approved ? 'approve' : 'reject'}`,
        {
            note: note?.trim() || undefined,
        },
    );
    return response.data;
}

// Seller ghi nhận kết quả kiểm tra kiện hàng đã hoàn về kho.
export async function inspectSellerReturn(
    returnId: string,
    passed: boolean,
    note?: string,
): Promise<OrderReturnResponse> {
    const response = await authorizedAxios.post<OrderReturnResponse>(
        `${SELLER_ORDERS}/returns/${returnId}/inspection`,
        {
            passed,
            note: note?.trim() || undefined,
        },
    );
    return response.data;
}
