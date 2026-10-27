// Xác minh Pay2S Return cho giao dịch nạp ví; IPN có chữ ký mới là nguồn ghi có authoritative.
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { verifyPay2sReturn } from '@/services/order';

// Xác minh callback trên server, làm mới cache ví rồi bỏ query chứa dữ liệu giao dịch khỏi URL.
export function WalletDepositReturnContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const handledReturn = useRef(false);

    useEffect(() => {
        if (handledReturn.current) return;
        handledReturn.current = true;

        const rawQueryString = window.location.search;
        if (!new URLSearchParams(rawQueryString).has('orderId')) {
            toast.error('Không tìm thấy thông tin giao dịch Pay2S.');
            router.replace('/seller/finance');
            return;
        }

        void verifyPay2sReturn(rawQueryString)
            .then(async (result) => {
                if (result.status === 'WALLET_DEPOSIT_PAID') {
                    toast.success(
                        'Nạp tiền thành công. Số dư ví đã được cập nhật.',
                    );
                } else if (result.status === 'WALLET_DEPOSIT_FAILED') {
                    toast.error('Giao dịch nạp ví chưa thành công.');
                } else if (result.status === 'PENDING') {
                    toast.info('Đang chờ Pay2S xác nhận giao dịch nạp ví.');
                } else {
                    toast.error('Không xác minh được giao dịch nạp ví.');
                }

                // Dù callback thất bại hay thành công, refresh snapshot để UI lấy trạng thái mới nhất từ server.
                await queryClient.invalidateQueries({
                    queryKey: ['seller-wallet'],
                });
                await queryClient.invalidateQueries({
                    queryKey: ['seller-wallet-withdrawals'],
                });
                router.replace('/seller/finance');
            })
            .catch(() => {
                toast.error(
                    'Chưa xác minh được kết quả Pay2S. Hãy kiểm tra lại lịch sử giao dịch trong ví.',
                );
                router.replace('/seller/finance');
            });
    }, [queryClient, router]);

    return (
        <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-5">
            <div
                role="status"
                className="w-full rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm"
            >
                <p className="font-semibold text-zinc-950">
                    Đang xác minh giao dịch Pay2S
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                    Số dư chỉ được cập nhật sau khi máy chủ xác thực giao dịch.
                </p>
            </div>
        </main>
    );
}
