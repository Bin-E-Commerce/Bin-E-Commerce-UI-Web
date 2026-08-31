// Transport adapter cho shipment Customer/Seller; mọi scope và trạng thái đều do backend quyết định.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import axios from 'axios';

const ORDERS = `${API_BASE_URL}${API_VERSION}/orders`;
const SELLER_ORDERS = `${API_BASE_URL}${API_VERSION}/seller/orders`;

export type ShipmentStatus =
    | 'READY_TO_SHIP'
    | 'PICKUP_ASSIGNED'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'FAILED'
    | 'CANCELLED'
    | 'RETURNING'
    | 'RETURNED';

export interface ShipmentRoutePoint {
    latitude: number;
    longitude: number;
    label: string;
}

export interface ShipmentResponse {
    id: string;
    orderId: string;
    provider: 'GHN_TEST';
    trackingCode: string;
    providerStatusCode: number | null;
    providerStatusText: string | null;
    status: ShipmentStatus;
    statusLabel: string;
    currentLocation: ShipmentRoutePoint;
    routePoints: ShipmentRoutePoint[];
    mapMode: 'INTERNAL_PRESENTATION';
    trackingSource: 'GHN_TEST';
    demoMode: boolean;
    estimatedDeliveryAt: string | null;
    history: Array<{
        id: string;
        fromStatus: ShipmentStatus | null;
        toStatus: ShipmentStatus;
        reason: string | null;
        locationLabel: string | null;
        occurredAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerTrackingResponse {
    orderId: string;
    shipments: ShipmentResponse[];
}

// Tạo vận đơn GHN Test cho shop hiện tại sau khi Seller chuẩn bị đơn.
export async function createSellerShipment(orderId: string): Promise<ShipmentResponse> {
    const response = await authorizedAxios.post<ShipmentResponse>(`${SELLER_ORDERS}/${orderId}/shipment`);
    return response.data;
}

// Lấy shipment của seller hiện tại; 404 chỉ nghĩa là shop chưa tạo vận đơn.
export async function getSellerShipment(orderId: string): Promise<ShipmentResponse | null> {
    try {
        const response = await authorizedAxios.get<ShipmentResponse>(`${SELLER_ORDERS}/${orderId}/shipment`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
    }
}

// Làm mới trạng thái từ GHN Test, không cho UI tự chuyển bước.
export async function refreshSellerShipment(orderId: string): Promise<ShipmentResponse> {
    const response = await authorizedAxios.post<ShipmentResponse>(`${SELLER_ORDERS}/${orderId}/shipment/refresh`);
    return response.data;
}

// Hủy vận đơn khi GHN chưa lấy hàng.
export async function cancelSellerShipment(orderId: string): Promise<ShipmentResponse> {
    const response = await authorizedAxios.post<ShipmentResponse>(`${SELLER_ORDERS}/${orderId}/shipment/cancel`);
    return response.data;
}

// Chuyển shipment sang chặng kế tiếp chỉ trong chế độ GHN Test để phục vụ demo.
export async function advanceDemoSellerShipment(orderId: string): Promise<ShipmentResponse> {
    const response = await authorizedAxios.post<ShipmentResponse>(`${SELLER_ORDERS}/${orderId}/shipment/demo/advance`);
    return response.data;
}

// Tải nhãn từ server để credential GHN không bao giờ nằm ở browser.
export async function printSellerShipmentLabel(orderId: string): Promise<Blob> {
    const response = await authorizedAxios.get<Blob>(`${SELLER_ORDERS}/${orderId}/shipment/label`, { responseType: 'blob' });
    return response.data;
}

// Customer lấy toàn bộ shipment sau khi backend kiểm tra owner của order.
export async function getCustomerTracking(orderId: string): Promise<CustomerTrackingResponse> {
    const response = await authorizedAxios.get<CustomerTrackingResponse>(`${ORDERS}/${orderId}/tracking`);
    return response.data;
}
