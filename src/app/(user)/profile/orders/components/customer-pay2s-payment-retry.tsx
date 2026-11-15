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

    // Mở tab chờ trong click để trình duyệt không chặn; trang danh sách/chi tiết ở tab hiện tại vẫn theo dõi IPN.
    function handleRetryPayment(): void {
        const paymentWindow = window.open('about:blank', '_blank');
        if (paymentWindow) paymentWindow.opener = null;

        // URL chỉ được dùng sau ownership/state check; popup bị chặn sẽ dùng cùng tab như phương án dự phòng.
        mutation.mutate(undefined, {
            onSuccess: () => {
                const paymentPath = `/profile/orders/${orderId}/payment`;
                if (paymentWindow) paymentWindow.location.replace(paymentPath);
                else window.location.assign(paymentPath);
            },
            // Không để tab rỗng tồn tại nếu backend từ chối tạo lại link.
            onError: () => paymentWindow?.close(),
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
