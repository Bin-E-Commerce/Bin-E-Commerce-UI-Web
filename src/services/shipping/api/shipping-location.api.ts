// Client master data GHN qua API Gateway; frontend không gọi GHN trực tiếp và không giữ credential.

import { API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';

export interface GhnProvinceOption {
    id: number;
    name: string;
}

export interface GhnDistrictOption {
    id: number;
    name: string;
    provinceId: number;
}

export interface GhnWardOption {
    code: string;
    name: string;
    districtId: number;
}

const BASE_PATH = `${API_VERSION}/shipping/locations`;

// Tải tỉnh/thành phố GHN từ endpoint đã được Gateway chuẩn hóa.
export async function listGhnProvinces(): Promise<GhnProvinceOption[]> {
    const response = await publicAxios.get<GhnProvinceOption[]>(`${BASE_PATH}/provinces`);
    return response.data;
}

// Tải quận/huyện GHN theo mã tỉnh đã chọn.
export async function listGhnDistricts(provinceId: number): Promise<GhnDistrictOption[]> {
    const response = await publicAxios.get<GhnDistrictOption[]>(`${BASE_PATH}/districts`, {
        params: { provinceId },
    });
    return response.data;
}

// Tải phường/xã GHN theo mã quận/huyện đã chọn.
export async function listGhnWards(districtId: number): Promise<GhnWardOption[]> {
    const response = await publicAxios.get<GhnWardOption[]>(`${BASE_PATH}/wards`, {
        params: { districtId },
    });
    return response.data;
}

export const shippingLocationService = {
    listGhnProvinces,
    listGhnDistricts,
    listGhnWards,
};
