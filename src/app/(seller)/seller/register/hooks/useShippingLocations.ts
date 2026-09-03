// Hook dùng master data GHN cho form onboarding Seller.

'use client';

import { useQuery } from '@tanstack/react-query';
import { shippingLocationService } from '@/services/shipping';

// Tải tuần tự tỉnh, quận/huyện và phường/xã theo các mã GHN đã chọn.
export function useShippingLocations(provinceId: number | null, districtId: number | null) {
    const provincesQuery = useQuery({ queryKey: ['shipping-locations', 'provinces'], queryFn: shippingLocationService.listGhnProvinces, staleTime: 60 * 60 * 1000 });
    const districtsQuery = useQuery({ queryKey: ['shipping-locations', 'districts', provinceId], queryFn: () => shippingLocationService.listGhnDistricts(provinceId as number), enabled: Boolean(provinceId), staleTime: 60 * 60 * 1000 });
    const wardsQuery = useQuery({ queryKey: ['shipping-locations', 'wards', districtId], queryFn: () => shippingLocationService.listGhnWards(districtId as number), enabled: Boolean(districtId), staleTime: 60 * 60 * 1000 });
    const errorQuery = [provincesQuery, districtsQuery, wardsQuery].find((query) => query.isError);
    return { provinces: provincesQuery.data ?? [], districts: districtsQuery.data ?? [], wards: wardsQuery.data ?? [], isLoading: provincesQuery.isPending || (Boolean(provinceId) && districtsQuery.isPending) || (Boolean(districtId) && wardsQuery.isPending), error: errorQuery ? 'Không tải được danh sách địa chỉ GHN. Vui lòng thử lại.' : null };
}
