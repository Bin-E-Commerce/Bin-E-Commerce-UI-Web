'use client';

import { useEffect, useState } from 'react';

import {
    locationService,
    type ListLocationsParams,
    type LocationDto,
} from '@/services/location';

interface UseLocationsResult {
    locations: LocationDto[];
    loading: boolean;
    error: string | null;
}

// Tải danh sách địa điểm từ location-service và tự hủy setState khi component rời màn hình.
export function useLocations(params: ListLocationsParams): UseLocationsResult {
    const [locations, setLocations] = useState<LocationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        // Không gọi API khi hook được dùng cho cấp con nhưng chưa có parentId.
        const shouldSkipChildQuery =
            (params.type === 'ward' || params.type === 'district') &&
            !params.parentId &&
            !params.parentCode;

        if (shouldSkipChildQuery) {
            setLocations([]);
            setLoading(false);
            setError(null);
            return () => {
                cancelled = true;
            };
        }

        const loadLocations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await locationService.listLocations(params);

                if (!cancelled) {
                    setLocations(response.items);
                }
            } catch {
                if (!cancelled) {
                    setError('Không tải được dữ liệu địa chỉ. Vui lòng thử lại.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadLocations();

        return () => {
            cancelled = true;
        };
    }, [
        params.adminVersion,
        params.page,
        params.pageSize,
        params.parentCode,
        params.parentId,
        params.search,
        params.type,
    ]);

    return { locations, loading, error };
}
