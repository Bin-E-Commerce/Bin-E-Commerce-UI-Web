// Popup xử lý hoàn tiền theo từng đơn; chuyển khoản vẫn do admin tự thực hiện qua ngân hàng.
'use client';

import { AlertCircle, CircleDollarSign, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RefundProcessingDialogProps } from '../../types/refunds/refund-queue.types';
import { RefundTransferCard } from './RefundTransferCard';

// Định dạng số tiền theo VND từ snapshot API để header khớp số tiền trong QR.
function formatRefundAmount(value: string): string {
    return `${Number(value).toLocaleString('vi-VN')} đ`;
}

// Gắn nhãn loại hồ sơ riêng với phương thức thanh toán để không lặp chữ Pay2S.
function refundSourceLabel(
    sourceType: NonNullable<
        RefundProcessingDialogProps['refund']
    >['sourceType'],
): string {
    if (sourceType === 'PAYMENT_ATTEMPT') return 'Hoàn thanh toán';
    if (sourceType === 'ORDER_RETURN') return 'Khách trả hàng';
    return 'Khiếu nại chưa nhận hàng';
}

// Hiển thị toàn bộ thao tác của một refund trong dialog có vùng cuộn và footer cố định.
export function RefundProcessingDialog({
    open,
    onOpenChange,
    refund,
    failureNote,
    isSavingRecipientAccount,
    isConfirmingRefund,
    isRecordingFailure,
    onFailureNoteChange,
    onSaveRecipientAccount,
    onConfirmRefund,
    onRecordFailure,
}: RefundProcessingDialogProps) {
    if (!refund) return null;

    const isFailed = refund.status === 'REFUND_FAILED';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-0 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.38)] sm:max-w-5xl">
                <DialogHeader className="shrink-0 border-b border-zinc-100 bg-white px-4 py-3.5 pr-12 sm:pl-5 sm:pr-14">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                                <CircleDollarSign
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="min-w-0 flex-1">
                                <DialogTitle className="truncate text-base font-semibold tracking-tight text-zinc-950">
                                    Hoàn tiền · {refund.orderNumber}
                                </DialogTitle>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-600">
                                        {refundSourceLabel(refund.sourceType)}
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[9px] font-semibold tracking-wide text-zinc-700">
                                        {refund.paymentMethod === 'PAY2S'
                                            ? 'Pay2S'
                                            : 'COD'}
                                    </span>
                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isFailed ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}
                                    >
                                        {isFailed
                                            ? 'Chuyển lần trước thất bại'
                                            : 'Chờ chuyển khoản'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-right shadow-sm shadow-zinc-900/[0.03]">
                            <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
                                Cần hoàn
                            </p>
                            <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-zinc-950">
                                {formatRefundAmount(refund.amount)}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-zinc-50/50 p-4 sm:p-6">
                    {refund.refundFailureNote ? (
                        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3.5 text-sm leading-5 text-rose-900">
                            <AlertCircle
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <p>
                                <span className="font-semibold">
                                    Lỗi chuyển khoản trước:
                                </span>{' '}
                                {refund.refundFailureNote}
                            </p>
                        </div>
                    ) : null}

                    <RefundTransferCard
                        refund={refund}
                        isConfirmingRefund={isConfirmingRefund}
                        isSavingRecipientAccount={isSavingRecipientAccount}
                        onSaveRecipientAccount={onSaveRecipientAccount}
                        onConfirmRefund={onConfirmRefund}
                    />

                    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.03]">
                        <header className="flex items-start gap-3 border-b border-zinc-100 bg-white px-4 py-3.5 sm:px-5">
                            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                                <AlertCircle
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </span>
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-950">
                                    Chuyển khoản gặp sự cố?
                                </h3>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Ghi lý do để giữ khoản hoàn trong hàng đợi
                                    và xử lý lại sau.
                                </p>
                            </div>
                        </header>
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
                            <div className="grid min-w-0 flex-1 gap-2">
                                <Label
                                    htmlFor={`refund-failure-${refund.sourceType}-${refund.id}`}
                                    className="text-zinc-700"
                                >
                                    Ghi chú nếu chuyển khoản thất bại
                                </Label>
                                <Input
                                    id={`refund-failure-${refund.sourceType}-${refund.id}`}
                                    value={failureNote}
                                    onChange={(event) =>
                                        onFailureNoteChange(event.target.value)
                                    }
                                    maxLength={500}
                                    placeholder="Nhập lý do, tối thiểu 10 ký tự"
                                    className="h-10 rounded-xl border-zinc-200 bg-white"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 shrink-0 rounded-xl border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                disabled={
                                    failureNote.trim().length < 10 ||
                                    isRecordingFailure
                                }
                                onClick={onRecordFailure}
                            >
                                <RotateCcw aria-hidden="true" />
                                {isRecordingFailure
                                    ? 'Đang ghi nhận…'
                                    : 'Ghi nhận sự cố'}
                            </Button>
                        </div>
                    </section>
                </div>

                <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-zinc-200 bg-white px-4 py-3.5 sm:px-6">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-xl border-zinc-200 sm:w-auto sm:min-w-24"
                        onClick={() => onOpenChange(false)}
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
