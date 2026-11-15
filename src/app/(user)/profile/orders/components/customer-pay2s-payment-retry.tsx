// CTA thanh toán lại dùng chung cho danh sách và chi tiết order đang chờ Pay2S.

'use client';

import { CreditCard, LoaderCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useRetryPay2sPayment } from '../hooks/use-retry-pay2s-payment';
import type { CustomerPay2sPaymentRetryProps } from '../types/customer-payment.types';

// Giữ CTA ngoài link bao trùm card và khóa nút trong lúc server tạo lại payment URL.
export function CustomerPay2sPaymentRetry({
    orderId,
}: CustomerPay2sPaymentRetryProps) {
    const mutation = useRetryPay2sPayment(orderId);

    // Lấy URL sau khi backend xác nhận đơn còn được thanh toán.
    // Chuyển tab hiện tại để tránh tạo thêm tab rỗng.
    function handleRetryPayment(): void {
        // Backend kiểm tra chủ đơn, trạng thái tiền và hạn thanh toán trước khi cấp URL.
        mutation.mutate(undefined, {
            onSuccess: ({ paymentUrl }) => window.location.assign(paymentUrl),
        });
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3">
            <p className="text-xs font-medium text-zinc-500">
                Đơn hàng đang chờ thanh toán Pay2S
            </p>
            <Button
                type="button"
                onClick={handleRetryPayment}
                disabled={mutation.isPending}
                className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
                {mutation.isPending ? (
                    <LoaderCircle
                        className="mr-2 size-4 animate-spin"
                        aria-hidden="true"
                    />
                ) : (
                    <CreditCard className="mr-2 size-4" aria-hidden="true" />
                )}
                {mutation.isPending
                    ? 'Đang mở thanh toán...'
                    : 'Tiếp tục thanh toán'}
            </Button>
        </div>
    );
}
