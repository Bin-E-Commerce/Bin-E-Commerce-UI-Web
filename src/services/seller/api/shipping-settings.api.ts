// Transport adapter cho cấu hình giao nhận; API tự suy shop từ JWT nên frontend không truyền shopId.
import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';

export interface PickupAddress {
    id: string;
    contactName: string;
    phone: string;
    ghnProvinceId: number | null;
    ghnProvinceName: string | null;
    ghnDistrictId: number | null;
    ghnDistrictName: string | null;
    ghnWardCode: string | null;
    ghnWardName: string | null;
    addressLine: string;
    isDefault: boolean;
}

export interface ShippingSettingsResponse {
    settings: { shopId: string; defaultPickupAddressId: string | null; preparationTimeHours: number; pickupWindowStart: string; pickupWindowEnd: string; enabled: boolean };
    pickupAddresses: PickupAddress[];
}

// Đọc settings của shop hiện tại.
export function getShippingSettings(): Promise<ShippingSettingsResponse> {
    return authorizedAxios.get<ShippingSettingsResponse>(`${API_VERSION}/seller/shipping/settings`).then((response) => response.data);
}

// Lưu lịch vận hành giao nhận; credential nhà vận chuyển luôn do platform quản lý.
export function updateShippingSettings(payload: Partial<ShippingSettingsResponse['settings']>): Promise<ShippingSettingsResponse> {
    return authorizedAxios.patch<ShippingSettingsResponse>(`${API_VERSION}/seller/shipping/settings`, payload).then((response) => response.data);
}

// Tạo địa chỉ pickup gắn với shop hiện tại.
export interface PickupAddressPayload {
    contactName: string;
    phone: string;
    provinceId: number;
    provinceName: string;
    districtId: number;
    districtName: string;
    wardCode: string;
    wardName: string;
    addressLine: string;
}

// Tạo địa chỉ theo cây địa giới hiện hành; districtId có thể rỗng khi tỉnh quản lý trực tiếp phường/xã.
export function createPickupAddress(payload: PickupAddressPayload): Promise<ShippingSettingsResponse> {
    return authorizedAxios.post<ShippingSettingsResponse>(`${API_VERSION}/seller/shipping/pickup-addresses`, payload).then((response) => response.data);
}

// Đặt địa chỉ pickup mặc định theo id thuộc shop hiện tại.
export function setDefaultPickupAddress(id: string): Promise<ShippingSettingsResponse> {
    return authorizedAxios.post<ShippingSettingsResponse>(`${API_VERSION}/seller/shipping/pickup-addresses/${id}/default`).then((response) => response.data);
}

// Cập nhật địa chỉ pickup thuộc shop hiện tại; ownership do backend suy ra từ JWT.
// Cập nhật địa chỉ hiện tại mà không làm thay đổi snapshot của shipment cũ.
export function updatePickupAddress(id: string, payload: PickupAddressPayload): Promise<ShippingSettingsResponse> {
    return authorizedAxios.patch<ShippingSettingsResponse>(`${API_VERSION}/seller/shipping/pickup-addresses/${id}`, payload).then((response) => response.data);
}

// Xóa địa chỉ pickup thuộc shop hiện tại và nhận lại settings đã được backend chọn default thay thế.
export function deletePickupAddress(id: string): Promise<ShippingSettingsResponse> {
    return authorizedAxios.delete<ShippingSettingsResponse>(`${API_VERSION}/seller/shipping/pickup-addresses/${id}`).then((response) => response.data);
}
