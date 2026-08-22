'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminSellerApplicationsService } from '@/services/admin';
import type { RejectSellerApplicationPayload } from '@/services/admin';

// Quản lý command từ chối và đồng bộ lại cả cache chi tiết lẫn danh sách sau khi backend trả trạng thái mới.
export function useRejectSellerApplication(applicationId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RejectSellerApplicationPayload) =>
            adminSellerApplicationsService.reject(applicationId, payload),
        onSuccess: (application) => {
            // Ghi thẳng response mới vào cache để trang chi tiết đổi trạng thái ngay, không tạo thêm một request không cần thiết.
            queryClient.setQueryData(
                ['admin-seller-application', applicationId],
                application,
            );

            // Danh sách có thể đang lọc theo pending nên đánh dấu stale để lần quay lại bảng sẽ phản ánh đúng kết quả.
            void queryClient.invalidateQueries({
                queryKey: ['admin-seller-applications'],
            });
        },
    });
}
