// Hook giữ dữ liệu QR, đồng bộ trạng thái Pay2S và thao tác thử lại/hủy của trang thanh toán nội bộ.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    cancelPay2sPayment,
    getPay2sPaymentDetails,
    retryPay2sPayment,
} from '@/services/order';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Query status từ server để redirect/refresh không tạo lại attempt hoặc đặt lại payment deadline.
export function usePay2sPaymentPage(orderId: string) {
    const queryClient = useQueryClient();
    const paymentQuery = useQuery({
        queryKey: ['customer-pay2s-payment', orderId],
        queryFn: () => getPay2sPaymentDetails(orderId),
        enabled: Boolean(orderId),
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchInterval: (query) => {
            // Tiếp tục bắt IPN thành công đến muộn hoặc trạng thái retryable cho tới khi order được chốt.
            const status = query.state.data?.status;
            return status === 'PENDING' || status === 'RETRYABLE'
                ? 5_000
                : status === 'REFUND_PENDING'
                  ? 15_000
                  : false;
        },
    });

    const cancelMutation = useMutation({
        mutationFn: () => cancelPay2sPayment(orderId),
        onSuccess: async () => {
            // Cập nhật đồng thời màn thanh toán, lịch sử và chi tiết để mọi tab thấy đơn đã hủy.
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['customer-pay2s-payment', orderId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['customer-orders'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['customer-order', orderId],
                }),
            ]);
            toast.success('Đã hủy giao dịch và cập nhật trạng thái đơn hàng.');
        },
        onError: (error) => {
            // Nếu provider đã thu tiền hoặc chưa xác nhận hủy, không báo thành công và giữ nguyên order.
            toast.error(getErrorMessage(error));
        },
    });

    const retryMutation = useMutation({
        mutationFn: () => retryPay2sPayment(orderId),
        onSuccess: async () => {
            // Retry tạo attempt mới nhưng giữ deadline của order; đọc lại QR mới từ response provider.
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['customer-pay2s-payment', orderId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['customer-orders'],
                }),
            ]);
            await queryClient.refetchQueries({
                queryKey: ['customer-pay2s-payment', orderId],
                exact: true,
            });
        },
        onError: (error) => {
            // Order Service từ chối retry nếu deadline đóng hoặc thanh toán đã chốt; đưa nguyên nhân lên UI.
            toast.error(getErrorMessage(error));
        },
    });

    return { paymentQuery, cancelMutation, retryMutation };
}
