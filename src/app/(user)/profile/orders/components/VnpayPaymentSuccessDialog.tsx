// Popup biên nhận VNPay chỉ xuất hiện sau khi page nhận trạng thái PAID đã được backend xác minh.

import Link from 'next/link';
import { ArrowRight, Check, ReceiptText, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { VnpayPaymentSuccessDialogProps } from '../types/vnpay-payment-success.types';

// Định dạng số tiền callback sau khi backend xác nhận chữ ký và đối chiếu snapshot giao dịch.
function formatVerifiedAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Hiển thị biên nhận rõ ràng và các đường đi tiếp theo; dialog không tự thay đổi trạng thái đơn.
export function VnpayPaymentSuccessDialog({
    payment,
    onClose,
}: VnpayPaymentSuccessDialogProps) {
    return (
        <Dialog
            open={Boolean(payment)}
            onOpenChange={(open) => {
                // Escape, backdrop và nút đóng chỉ ẩn biên nhận; kết quả thanh toán đã xác minh vẫn do backend lưu.
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-md overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl sm:max-w-lg">
                <div className="relative overflow-hidden px-6 pb-7 pt-9 text-center sm:px-9 sm:pt-10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-emerald-100/70 blur-3xl"
                    />
                    <div className="relative">
                        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                                <Check
                                    className="size-8"
                                    strokeWidth={3}
                                    aria-hidden="true"
                                />
                            </span>
                        </span>
                        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
                            Thanh toán qua VNPay
                        </p>
                        <DialogHeader className="mt-2 items-center text-center">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                Thanh toán thành công!
                            </DialogTitle>
                            <DialogDescription className="mt-1 max-w-sm text-sm leading-6 text-zinc-500">
                                Giao dịch đã được VNPay xác nhận. Bạn có thể theo
                                dõi tiến độ đơn hàng trong lịch sử mua sắm.
                            </DialogDescription>
                        </DialogHeader>

                        {payment?.amount !== undefined ? (
                            <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4">
                                <p className="text-xs font-medium text-zinc-500">
                                    Số tiền đã thanh toán
                                </p>
                                <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
                                    {formatVerifiedAmount(payment.amount)}
                                </p>
                            </div>
                        ) : null}

                        {payment?.orderNumber || payment?.transactionNumber ? (
                            <div className="mx-auto mt-4 max-w-sm divide-y divide-zinc-100 rounded-2xl border border-zinc-200 px-4 text-left">
                                {payment.orderNumber ? (
                                    <div className="flex items-center justify-between gap-4 py-3">
                                        <span className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
                                            <ReceiptText
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            Mã đơn hàng
                                        </span>
                                        <span className="truncate text-right text-xs font-semibold text-zinc-900">
                                            {payment.orderNumber}
                                        </span>
                                    </div>
                                ) : null}
                                {payment.transactionNumber ? (
                                    <div className="flex items-center justify-between gap-4 py-3">
                                        <span className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
                                            <ShieldCheck
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                            Mã giao dịch
                                        </span>
                                        <span className="truncate text-right text-xs font-semibold text-zinc-900">
                                            {payment.transactionNumber}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Nội dung cha dùng p-0 nên footer không cần margin âm của dialog mặc định. */}
                <DialogFooter className="mx-0 mb-0 gap-2 border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 sm:flex-row sm:justify-center sm:px-9">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-zinc-200 bg-white px-5"
                        onClick={onClose}
                    >
                        Đóng
                    </Button>
                    {/* Dùng orderId từ kết quả backend xác minh để CTA mở đúng đơn vừa thanh toán, không quay về danh sách chung. */}
                    <Button
                        type="button"
                        className="h-10 rounded-xl bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                        onClick={onClose}
                        render={
                            <Link
                                href={
                                    payment
                                        ? `/profile/orders/${payment.orderId}`
                                        : '/profile/orders'
                                }
                            />
                        }
                    >
                        Xem chi tiết đơn hàng
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
