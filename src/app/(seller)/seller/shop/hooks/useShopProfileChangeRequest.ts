'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    shopProfileService,
    type CreateShopProfileChangeRequestPayload,
} from '@/services/seller';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const SHOP_PROFILE_QUERY_KEY = ['seller', 'shop-profile'] as const;

// Dùng chung mutation gửi duyệt để cả form thuế và định danh cập nhật cùng cache hồ sơ sau khi thành công.
export function useShopProfileChangeRequest(onSubmitted: () => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateShopProfileChangeRequestPayload) =>
            shopProfileService.createChangeRequest(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: SHOP_PROFILE_QUERY_KEY,
            });
            onSubmitted();
            toast.success('Đã gửi yêu cầu thay đổi để kiểm tra.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
