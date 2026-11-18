// CTA tiếp tục thanh toán và hủy đơn Pay2S chưa thanh toán dùng chung cho danh sách và chi tiết.
// Component chỉ điều phối giao diện; quyền sở hữu, trạng thái tiền và việc nhả tồn kho do backend quyết định.

'use client';

import { useState } from 'react';
import { CreditCard, LoaderCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCancelPendingPay2sPayment } from '../hooks/use-cancel-pending-pay2s-payment';
import { useRetryPay2sPayment } from '../hooks/use-retry-pay2s-payment';
import type { CustomerPay2sPaymentRetryProps } from '../types/customer-payment.types';

// Hiển thị tiếp tục thanh toán và hủy đơn ở footer danh sách hoặc cạnh mục lục chi tiết.
// Backend vẫn là nguồn kiểm tra chủ đơn, trạng thái thanh toán và điều kiện đóng phiên Pay2S.
export function CustomerPay2sPaymentRetry({
    orderId,
    layout = 'footer',
}: CustomerPay2sPaymentRetryProps) {
    const mutation = useRetryPay2sPayment(orderId);
    const cancelMutation = useCancelPendingPay2sPayment(orderId);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    // Lấy URL sau khi backend xác nhận đơn còn được thanh toán.
    // Chuyển tab hiện tại để tránh tạo thêm tab rỗng.
    function handleRetryPayment(): void {
        // Backend kiểm tra chủ đơn, trạng thái tiền và hạn thanh toán trước khi cấp URL.
        mutation.mutate(undefined, {
            onSuccess: ({ paymentUrl }) => window.location.assign(paymentUrl),
        });
    }

    // Chỉ đóng hộp xác nhận sau khi backend hủy đơn thành công; nếu provider từ chối thì khách vẫn thấy lựa chọn thử lại.
    function handleCancelPendingOrder(): void {
        cancelMutation.mutate(undefined, {
            onSuccess: () => setCancelDialogOpen(false),
        });
    }

    // Không cho đóng hộp xác nhận trong lúc server đang xử lý để tránh tạo thao tác hủy lặp từ cùng giao diện.
    function handleCancelDialogOpenChange(nextOpen: boolean): void {
        if (cancelMutation.isPending && !nextOpen) return;
        setCancelDialogOpen(nextOpen);
    }

    return (
        <div
            className={
                layout === 'inline'
                    ? 'flex items-center'
                    : 'flex flex-col gap-3 border-t border-zinc-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between'
            }
        >
            {layout === 'footer' ? (
                <p className="shrink-0 text-xs font-medium text-zinc-500">
                    Đơn hàng đang chờ thanh toán Pay2S
                </p>
            ) : null}
            {/* Giữ hai CTA cùng hàng; footer cấp chỗ riêng ở màn hẹp còn layout inline nằm gọn ở thanh mục lục. */}
            <div
                className={
                    layout === 'inline'
                        ? 'flex flex-nowrap items-center gap-1.5'
                        : 'flex w-full flex-nowrap items-center justify-between gap-1.5 sm:w-auto sm:justify-end'
                }
            >
                <AlertDialog
                    open={cancelDialogOpen}
                    onOpenChange={handleCancelDialogOpenChange}
                >
                    <AlertDialogTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={
                                mutation.isPending || cancelMutation.isPending
                            }
                            className="h-10 shrink-0 whitespace-nowrap rounded-xl px-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 sm:px-3 sm:text-sm"
                        >
                            <XCircle
                                className="mr-1.5 size-4 sm:mr-2"
                                aria-hidden="true"
                            />
                            Hủy đơn
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Hủy đơn chưa thanh toán?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="leading-6">
                                Đơn hàng sẽ bị hủy và phiên thanh toán Pay2S sẽ
                                được đóng. Bạn sẽ không thể thanh toán tiếp cho
                                đơn này.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={cancelMutation.isPending}
                                className="mt-0 cursor-pointer"
                            >
                                Giữ đơn hàng
                            </AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                disabled={cancelMutation.isPending}
                                onClick={(event) => {
                                    // Ngăn dialog tự đóng; handler chỉ đóng sau khi API xác nhận hủy thành công.
                                    event.preventDefault();
                                    handleCancelPendingOrder();
                                }}
                                className="cursor-pointer"
                            >
                                {cancelMutation.isPending ? (
                                    <>
                                        <LoaderCircle
                                            className="mr-2 size-4 animate-spin"
                                            aria-hidden="true"
                                        />
                                        Đang hủy...
                                    </>
                                ) : (
                                    'Xác nhận hủy đơn'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button
                    type="button"
                    onClick={handleRetryPayment}
                    disabled={mutation.isPending || cancelMutation.isPending}
                    className="h-10 shrink-0 whitespace-nowrap rounded-xl bg-zinc-950 px-3 text-xs font-semibold text-white hover:bg-zinc-800 sm:px-4 sm:text-sm"
                >
                    {mutation.isPending ? (
                        <LoaderCircle
                            className="mr-1.5 size-4 animate-spin sm:mr-2"
                            aria-hidden="true"
                        />
                    ) : (
                        <CreditCard
                            className="mr-1.5 size-4 sm:mr-2"
                            aria-hidden="true"
                        />
                    )}
                    {mutation.isPending
                        ? 'Đang mở thanh toán...'
                        : 'Tiếp tục thanh toán'}
                </Button>
            </div>
        </div>
    );
}
