// Hook nối CTA hủy Pay2S với API và làm mới cache lịch sử/chi tiết sau khi thành công.
// Hook không tự đổi trạng thái hoặc tồn kho; backend kiểm tra owner, đóng phiên thanh toán và hủy đơn.

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { cancelPendingPay2sPayment } from '@/services/order';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Cập nhật chi tiết ngay từ phản hồi hủy, rồi làm mới danh sách/badge để đơn rời nhóm chờ thanh toán.
// Backend đóng phiên Pay2S và nhả tồn kho; lỗi từ provider hoặc trạng thái tranh chấp được giữ lại để người mua biết và thử lại.
export function useCancelPendingPay2sPayment(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => cancelPendingPay2sPayment(orderId),
        onSuccess: (order) => {
            queryClient.setQueryData(['customer-order', orderId], order);
            // Refetch danh sách ở nền để hộp xác nhận đóng ngay sau khi backend đã hủy thành công.
            void queryClient.invalidateQueries({
                queryKey: ['customer-orders'],
            });
            toast.success('Đã hủy đơn hàng chưa thanh toán.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}
