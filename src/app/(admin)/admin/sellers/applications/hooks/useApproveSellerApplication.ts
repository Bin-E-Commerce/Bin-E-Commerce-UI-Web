'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminSellerApplicationsService } from '@/services/admin';

// Quản lý command duyệt và đồng bộ cache để cả trang chi tiết lẫn danh sách phản ánh trạng thái mới ngay sau response.
export function useApproveSellerApplication(applicationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => adminSellerApplicationsService.approve(applicationId),
        onSuccess: (application) => {
            // Ghi response vào cache chi tiết để badge và nhóm thao tác đổi trạng thái mà không gọi lại API.
            queryClient.setQueryData(
                ['admin-seller-application', applicationId],
                application,
            );

            // Danh sách có thể đang lọc hồ sơ chờ duyệt nên cần invalidation để loại dòng vừa được xử lý.
            void queryClient.invalidateQueries({
                queryKey: ['admin-seller-applications'],
            });
        },
    });
}
