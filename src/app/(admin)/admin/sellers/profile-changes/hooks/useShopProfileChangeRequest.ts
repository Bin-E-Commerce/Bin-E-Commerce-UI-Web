'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    adminShopProfileChangesService,
    type RejectShopProfileChangeRequestPayload,
    type ReviewShopProfileChangeRequestPayload,
} from '@/services/admin';
import { SHOP_PROFILE_CHANGES_QUERY_KEY } from './useShopProfileChangeRequests';

// Tải chi tiết có chứa snapshot đối chiếu và chỉ kích hoạt khi URL có request id hợp lệ.
export function useShopProfileChangeRequest(requestId: string) {
    return useQuery({
        queryKey: [...SHOP_PROFILE_CHANGES_QUERY_KEY, 'detail', requestId],
        queryFn: () => adminShopProfileChangesService.getById(requestId),
        enabled: Boolean(requestId),
    });
}

// Duyệt request và đồng bộ cả cache chi tiết lẫn danh sách để trạng thái UI thay đổi ngay sau response.
export function useApproveShopProfileChangeRequest(requestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ReviewShopProfileChangeRequestPayload) =>
            adminShopProfileChangesService.approve(requestId, payload),
        onSuccess: (request) => {
            queryClient.setQueryData(
                [...SHOP_PROFILE_CHANGES_QUERY_KEY, 'detail', requestId],
                request,
            );
            void queryClient.invalidateQueries({
                queryKey: SHOP_PROFILE_CHANGES_QUERY_KEY,
            });
        },
    });
}

// Từ chối request với lý do bắt buộc và làm mới hàng đợi đang lọc pending.
export function useRejectShopProfileChangeRequest(requestId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: RejectShopProfileChangeRequestPayload) =>
            adminShopProfileChangesService.reject(requestId, payload),
        onSuccess: (request) => {
            queryClient.setQueryData(
                [...SHOP_PROFILE_CHANGES_QUERY_KEY, 'detail', requestId],
                request,
            );
            void queryClient.invalidateQueries({
                queryKey: SHOP_PROFILE_CHANGES_QUERY_KEY,
            });
        },
    });
}
