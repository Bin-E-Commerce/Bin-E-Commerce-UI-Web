'use client';

import { useQuery } from '@tanstack/react-query';

import {
    adminSellerApplicationsService,
    type ListSellerApplicationsParams,
} from '@/services/admin';

// Tải danh sách hồ sơ seller cho admin; queryKey chứa filter để React Query tự cache từng trạng thái.
export function useAdminSellerApplications(params: ListSellerApplicationsParams) {
    return useQuery({
        queryKey: ['admin-seller-applications', params],
        queryFn: () => adminSellerApplicationsService.list(params),
    });
}
