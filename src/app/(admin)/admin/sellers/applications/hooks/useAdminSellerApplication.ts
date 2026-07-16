'use client';

import { useQuery } from '@tanstack/react-query';

import { adminSellerApplicationsService } from '@/services/admin';

// Tải chi tiết một hồ sơ seller theo id; query chỉ bật khi id hợp lệ để tránh gọi API rỗng.
export function useAdminSellerApplication(applicationId: string) {
    return useQuery({
        queryKey: ['admin-seller-application', applicationId],
        queryFn: () => adminSellerApplicationsService.getById(applicationId),
        enabled: Boolean(applicationId),
    });
}
