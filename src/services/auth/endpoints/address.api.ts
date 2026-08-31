// File này gọi API địa chỉ qua Gateway.
// Nó chỉ chịu trách nhiệm transport; ownership được Auth Service xác nhận từ JWT context.

import authorizedAxios from '@/utils/authorizedAxios';
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import type { ApiResponse, CreateAddressPayload, UserAddress } from '../types/auth.types';

const ADDRESSES = `${API_BASE_URL}${API_VERSION}/users/me/addresses`;

// Lấy danh sách địa chỉ của user hiện tại để checkout không nhận địa chỉ tùy ý từ browser.
export function getAddresses() {
    return authorizedAxios.get<ApiResponse<UserAddress[]>>(ADDRESSES).then((response) => response.data);
}

// Tạo nhanh địa chỉ mới rồi trả bản ghi đã được Auth Service lưu thành công.
export function createAddress(payload: CreateAddressPayload) {
    return authorizedAxios.post<ApiResponse<UserAddress>>(ADDRESSES, payload).then((response) => response.data);
}

// Cập nhật đầy đủ địa chỉ GHN thuộc tài khoản hiện tại.
export function updateAddress(id: string, payload: CreateAddressPayload) {
    return authorizedAxios.put<ApiResponse<UserAddress>>(`${ADDRESSES}/${id}`, payload).then((response) => response.data);
}

// Xóa địa chỉ thuộc tài khoản hiện tại.
export function deleteAddress(id: string) {
    return authorizedAxios.delete<ApiResponse<null>>(`${ADDRESSES}/${id}`).then((response) => response.data);
}
