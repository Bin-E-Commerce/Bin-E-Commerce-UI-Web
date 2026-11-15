// Hook xử lý Pay2S Return cho lịch sử đơn hàng.
// Backend xác minh chữ ký/IPN và giữ trạng thái thanh toán authoritative;
// hook chờ kết quả, làm mới cache và chỉ hiển thị thông báo không chặn thao tác.
'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { verifyPay2sReturn } from '@/services/order';

// Backoff giới hạn số lần verify khi IPN chưa ghi trạng thái, tránh gọi dồn dập
// trong lúc chờ callback server-to-server.
const PAY2S_RETURN_RETRY_DELAYS_MS = [
    1_000, 2_000, 4_000, 8_000, 8_000, 8_000,
] as const;

// Xóa callback đã xác minh nhưng giữ filter/page người dùng có thể vừa chọn.
const PAY2S_RETURN_QUERY_KEYS = new Set([
    'accessKey',
    'amount',
    'cancel',
    'checksum',
    'errorCode',
    'extraData',
    'message',
    'm2signature',
    'orderId',
    'orderInfo',
    'orderType',
    'partnerCode',
    'payType',
    'requestId',
    'responseCode',
    'responseTime',
    'requestTrace',
    'resultCode',
    'signature',
    'transId',
    'transactionStatus',
    'version',
]);

// Timer chờ lần đọc kế tiếp và chỉ chạy trên trình duyệt sau callback.
function waitForRetry(delayMs: number): Promise<void> {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, delayMs);
    });
}

// Verify callback đã ký rồi đợi IPN cập nhật đơn trước khi báo thành công.
// Return URL không ghi PAID; PENDING được kiểm tra lại theo backoff giới hạn.
// Sau lần verify đầu, URL sạch nhưng closure vẫn giữ callback để poll.
// Khi PAID, hook invalidates list/detail; lỗi mạng giữ query để tải lại.
export function usePay2sReturnVerification(hasPay2sReturn: boolean) {
    const queryClient = useQueryClient();
    const handledPay2sReturn = useRef(false);
    const pageIsMounted = useRef(false);

    // Cờ này dừng poll khi rời trang; thay query chỉ làm render lại.
    useEffect(() => {
        pageIsMounted.current = true;
        return () => {
            pageIsMounted.current = false;
        };
    }, []);

    // Chặn render/Strict Mode chạy trùng; mỗi Return mở một luồng verify/poll.
    useEffect(() => {
        if (handledPay2sReturn.current || !hasPay2sReturn) return;
        handledPay2sReturn.current = true;

        const rawQueryString = window.location.search;

        // Verify chữ ký trước khi xóa query để giữ URL nếu kết nối lỗi.
        async function verifyAndRefresh(): Promise<void> {
            let pendingToastId: string | number | undefined;

            try {
                let result = await verifyPay2sReturn(rawQueryString);
                if (!pageIsMounted.current) return;

                // Dọn URL bằng History API để không đè thao tác chuyển tab đang chạy.
                const cleanedUrl = new URL(window.location.href);
                for (const key of [...cleanedUrl.searchParams.keys()]) {
                    if (PAY2S_RETURN_QUERY_KEYS.has(key)) {
                        cleanedUrl.searchParams.delete(key);
                    }
                }
                window.history.replaceState(
                    window.history.state,
                    '',
                    `${cleanedUrl.pathname}${cleanedUrl.search}${cleanedUrl.hash}`,
                );

                if (result.status === 'PENDING') {
                    pendingToastId = toast.loading(
                        'Đang chờ Pay2S xác nhận giao dịch...',
                    );

                    // Redirect chỉ xác nhận chữ ký; poll đọc trạng thái DB sau IPN.
                    for (const delayMs of PAY2S_RETURN_RETRY_DELAYS_MS) {
                        await waitForRetry(delayMs);
                        if (!pageIsMounted.current) {
                            toast.dismiss(pendingToastId);
                            return;
                        }

                        try {
                            result = await verifyPay2sReturn(rawQueryString);
                        } catch {
                            // Lỗi tạm thời giữ PENDING; backoff sau sẽ thử lại.
                            continue;
                        }

                        if (result.status !== 'PENDING') break;
                    }
                }

                if (!pageIsMounted.current) {
                    if (pendingToastId !== undefined)
                        toast.dismiss(pendingToastId);
                    return;
                }

                if (pendingToastId !== undefined) toast.dismiss(pendingToastId);

                if (result.status === 'PAID') {
                    // Toast không phủ modal lên tab; chi tiết đơn vẫn nạp từ server.
                    toast.success(
                        'Thanh toán thành công. Đơn hàng đã được cập nhật.',
                    );
                    await queryClient.invalidateQueries({
                        queryKey: ['customer-order', result.orderId],
                    });
                } else if (result.status === 'REFUND_PENDING') {
                    toast.info(
                        'Giao dịch đến muộn; hệ thống đang xử lý hoàn tiền.',
                    );
                } else if (result.status === 'REFUNDED') {
                    toast.info('Giao dịch đã được hoàn tiền.');
                } else if (result.status === 'CANCELLED') {
                    // Hủy giao dịch trên Pay2S không hủy order; order vẫn mở để khách thử lại trong thời hạn.
                    toast.info(
                        'Giao dịch Pay2S đã hủy. Đơn vẫn được giữ để thanh toán lại; hãy bấm “Tiếp tục thanh toán”.',
                    );
                } else if (result.status === 'FAILED') {
                    toast.error(
                        'Thanh toán chưa thành công. Bạn có thể thử lại.',
                    );
                } else if (result.status === 'PENDING') {
                    toast.info(
                        'Giao dịch đang chờ Pay2S xác nhận. ' +
                            'Đừng thanh toán lại; hãy kiểm tra sau ít phút.',
                        { duration: 10_000 },
                    );
                } else {
                    toast.error(
                        'Không xác minh được kết quả thanh toán Pay2S.',
                    );
                }

                // Làm mới mọi filter để tab nhận trạng thái và số đếm mới.
                await queryClient.invalidateQueries({
                    queryKey: ['customer-orders'],
                });
            } catch {
                if (pendingToastId !== undefined) toast.dismiss(pendingToastId);
                if (!pageIsMounted.current) return;

                handledPay2sReturn.current = false;
                toast.error(
                    'Không thể xác minh thanh toán lúc này. ' +
                        'Vui lòng tải lại trang.',
                );
            }
        }

        void verifyAndRefresh();
    }, [hasPay2sReturn, queryClient]);
}
