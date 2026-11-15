// Hook cấp lại Pay2S URL sau khi backend kiểm tra quyền sở hữu và trạng thái đơn.

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { retryPay2sPayment } from '@/services/order';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Chỉ tạo URL sau khi Order Service kiểm tra ownership và trạng thái; lỗi API được báo tại trang hiện tại.
export function useRetryPay2sPayment(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => retryPay2sPayment(orderId),
        onSuccess: async () => {
            // Retry tạo attempt mới; refresh cả list lẫn detail để thấy PENDING và bắt đầu polling ngay.
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['customer-orders'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['customer-order', orderId],
                }),
            ]);
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
