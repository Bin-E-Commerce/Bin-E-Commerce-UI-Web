// Hook này tải cây địa chỉ hành chính từ Location Service cho form checkout.
// Hook chỉ quản lý dữ liệu đọc và trạng thái tải; nó không lưu địa chỉ người dùng hoặc gọi Auth Service.

'use client';

import { useQuery } from '@tanstack/react-query';

import {
    locationService,
    type LocationDto,
} from '@/services/location';

interface CheckoutLocationsResult {
    provinces: LocationDto[];
    wards: LocationDto[];
    isLoading: boolean;
    error: string | null;
}

// Lấy tỉnh và phường/xã theo mô hình địa chỉ v2 mà Location Service đang cung cấp.
// Hook chỉ trả dữ liệu cần cho checkout, không giữ lại logic quận/huyện không tồn tại trong nguồn dữ liệu hiện tại.
export function useCheckoutLocations(
    provinceId: string,
): CheckoutLocationsResult {
    const provincesQuery = useQuery({
        queryKey: ['locations', 'checkout', 'provinces'],
        queryFn: () => locationService.listLocations({ type: 'province', pageSize: 500 }),
        staleTime: 30 * 60 * 1000,
    });

    const wardsQuery = useQuery({
        queryKey: ['locations', 'checkout', 'wards-by-province', provinceId],
        queryFn: () => locationService.listLocations({
            type: 'ward',
            parentId: provinceId,
            pageSize: 500,
        }),
        enabled: Boolean(provinceId),
        staleTime: 30 * 60 * 1000,
    });

    const errorQuery = [
        provincesQuery,
        wardsQuery,
    ].find((query) => query.isError);

    // Chỉ báo loading theo các query thực sự cần cho lựa chọn hiện tại,
    // tránh khóa form khi người dùng chưa chọn tỉnh để tải danh sách phường/xã.
    const isLoading = provincesQuery.isPending
        || (Boolean(provinceId) && wardsQuery.isPending);

    return {
        provinces: provincesQuery.data?.items ?? [],
        wards: wardsQuery.data?.items ?? [],
        isLoading,
        error: errorQuery ? 'Không tải được dữ liệu địa chỉ. Vui lòng thử lại.' : null,
    };
}
