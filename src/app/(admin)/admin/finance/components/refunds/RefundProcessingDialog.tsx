// Popup xử lý hoặc xem lịch sử hoàn; chuyển khoản vẫn do admin tự thực hiện qua ngân hàng.
'use client';

import { useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    BadgeCheck,
    Check,
    CircleDollarSign,
    RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

// Điều phối popup theo trạng thái, giữ focus trong header và xác minh người nhận.
// Hồ sơ đã hoàn chỉ đọc; các khoản còn mở mới được tạo QR hoặc chốt giao dịch.
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
    // Đưa focus bàn phím vào tiêu đề trong header cố định, không vào input đầu tiên ở cuối nội dung cuộn.
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmedRecipientKey, setConfirmedRecipientKey] = useState('');

    // Đóng confirm và xóa xác minh cũ khi đổi hồ sơ/trạng thái/tài khoản.
    // Việc này ngăn xác nhận cũ được áp dụng lên một khoản khác.
    useEffect(() => {
        setConfirmOpen(false);
        setConfirmedRecipientKey('');
    }, [
        refund?.id,
        refund?.status,
        refund?.refundOutTransactionId,
        refund?.refundBankCode,
        refund?.refundAccountHolder,
        refund?.refundAccountNumber,
    ]);

    if (!refund) return null;

    const isFailed = refund.status === 'REFUND_FAILED';
    const isRefunded = refund.status === 'REFUNDED';
    // Candidate OUT được ưu tiên trạng thái xác minh và khóa nút báo thất bại để tránh chuyển khoản lần hai.
    const isOutDetected = Boolean(refund.refundOutTransactionId);
    const recipientMissing =
        refund.sourceType === 'PAYMENT_ATTEMPT' && !refund.refundAccountNumber;
    // Xác nhận gắn với đúng khoản OUT và đúng thông tin nhận để mọi thay đổi buộc admin đối chiếu lại.
    const recipientConfirmationKey = JSON.stringify([
        refund.id,
        refund.refundOutTransactionId ?? '',
        refund.refundBankCode ?? '',
        refund.refundAccountHolder ?? '',
        refund.refundAccountNumber ?? '',
    ]);
    const recipientConfirmed =
        isOutDetected && confirmedRecipientKey === recipientConfirmationKey;
    const canConfirmRefund =
        isOutDetected && recipientConfirmed && !recipientMissing;

    // Chỉ gửi lệnh chốt khi candidate OUT còn mở và tài khoản nhận đã được đối chiếu.
    // Nếu polling cập nhật hồ sơ thành REFUNDED trong lúc popup mở thì từ chối thao tác lặp.
    async function confirmRefund(): Promise<void> {
        if (isRefunded || isConfirmingRefund || !canConfirmRefund) return;
        try {
            await onConfirmRefund();
            setConfirmOpen(false);
        } catch {
            // Mutation đã hiển thị lỗi bằng toast nên giữ dialog mở để admin xem lại.
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                initialFocus={titleRef}
                className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-0 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.38)] sm:max-w-5xl"
            >
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
                                <DialogTitle
                                    ref={titleRef}
                                    tabIndex={-1}
                                    className="truncate text-base font-semibold tracking-tight text-zinc-950"
                                >
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
                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isRefunded ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : isOutDetected ? 'border-amber-200 bg-amber-50 text-amber-900' : isFailed ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}
                                    >
                                        {isRefunded
                                            ? 'Đã chuyển'
                                            : isOutDetected
                                              ? 'Chờ xác minh người nhận'
                                              : isFailed
                                                ? 'Chuyển lần trước thất bại'
                                                : 'Chờ chuyển khoản'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-right shadow-sm shadow-zinc-900/[0.03]">
                            <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
                                {isRefunded ? 'Đã hoàn' : 'Cần hoàn'}
                            </p>
                            <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-zinc-950">
                                {formatRefundAmount(refund.amount)}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-zinc-50/50 p-4 sm:p-6">
                    {/* Hồ sơ đã chốt chỉ đọc; loại bỏ QR, nhập tài khoản và mọi thao tác có thể tạo lần chuyển mới. */}
                    {isRefunded ? (
                        <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                                    <BadgeCheck
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold text-emerald-950">
                                        Khoản hoàn đã chuyển
                                    </h3>
                                    <p className="mt-1 text-sm leading-5 text-emerald-900">
                                        Giao dịch đã được ghi nhận hoàn tất. Mã
                                        QR và các thao tác chuyển tiền đã được
                                        khóa.
                                    </p>
                                </div>
                            </div>
                            <dl className="grid gap-3 rounded-xl border border-emerald-200/80 bg-white/80 p-3 text-sm sm:grid-cols-3">
                                <div>
                                    <dt className="text-xs text-zinc-500">
                                        Số tiền
                                    </dt>
                                    <dd className="mt-1 font-semibold tabular-nums text-zinc-950">
                                        {formatRefundAmount(refund.amount)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-zinc-500">
                                        Thời điểm hoàn tất
                                    </dt>
                                    <dd className="mt-1 font-medium text-zinc-800">
                                        {refund.refundProcessedAt
                                            ? new Date(
                                                  refund.refundProcessedAt,
                                              ).toLocaleString('vi-VN')
                                            : 'Không có thời điểm lưu'}
                                    </dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="text-xs text-zinc-500">
                                        Người nhận
                                    </dt>
                                    <dd className="mt-1 break-words font-medium text-zinc-800">
                                        {refund.refundBankName ||
                                            refund.refundAccountHolder ||
                                            'Theo thông tin đã xác minh'}
                                    </dd>
                                    {refund.refundAccountNumber ? (
                                        <dd className="mt-0.5 font-mono text-xs text-zinc-600">
                                            ••••{' '}
                                            {refund.refundAccountNumber.slice(
                                                -4,
                                            )}
                                        </dd>
                                    ) : null}
                                </div>
                            </dl>
                            {refund.refundOutTransactionNumber ? (
                                <p className="break-all text-xs text-emerald-900">
                                    Mã giao dịch:{' '}
                                    {refund.refundOutTransactionNumber}
                                </p>
                            ) : null}
                        </section>
                    ) : null}

                    {!isRefunded &&
                    refund.refundFailureNote &&
                    !isOutDetected ? (
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

                    {!isRefunded ? (
                        <RefundTransferCard
                            refund={refund}
                            isSavingRecipientAccount={isSavingRecipientAccount}
                            recipientConfirmed={recipientConfirmed}
                            onRecipientConfirmedChange={(confirmed) =>
                                setConfirmedRecipientKey(
                                    confirmed ? recipientConfirmationKey : '',
                                )
                            }
                            onSaveRecipientAccount={onSaveRecipientAccount}
                        />
                    ) : null}

                    {/* Khi đã có giao dịch OUT, không cho ghi nhận lỗi/chuyển lại trong cùng một khoản hoàn. */}
                    {!isOutDetected && !isRefunded ? (
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
                                        Ghi lý do để giữ khoản hoàn trong hàng
                                        đợi và xử lý lại sau.
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
                                            onFailureNoteChange(
                                                event.target.value,
                                            )
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
                    ) : null}
                </div>

                <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-zinc-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    {isOutDetected &&
                    !recipientConfirmed &&
                    !recipientMissing ? (
                        <p className="text-xs leading-5 text-zinc-500">
                            Đối chiếu tài khoản nhận để bật xác nhận hoàn.
                        </p>
                    ) : null}
                    <div className="flex w-full flex-col-reverse gap-2 sm:ml-auto sm:w-auto sm:flex-row">
                        {/* Nút chốt nằm cạnh Đóng và chỉ xuất hiện sau khi admin xác minh giao dịch OUT. */}
                        {canConfirmRefund && !isRefunded ? (
                            <Button
                                type="button"
                                className="h-10 w-full rounded-xl bg-zinc-950 px-4 text-white shadow-sm hover:bg-zinc-800 sm:w-auto"
                                disabled={
                                    isConfirmingRefund ||
                                    isSavingRecipientAccount
                                }
                                onClick={() => setConfirmOpen(true)}
                            >
                                <Check aria-hidden="true" />
                                {isConfirmingRefund
                                    ? 'Đang ghi nhận...'
                                    : 'Xác nhận đã chuyển'}
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 w-full rounded-xl border-zinc-200 sm:w-auto sm:min-w-24"
                            onClick={() => onOpenChange(false)}
                        >
                            Đóng
                        </Button>
                    </div>
                </DialogFooter>

                <AlertDialog
                    open={confirmOpen}
                    onOpenChange={(open) => {
                        if (!isConfirmingRefund) setConfirmOpen(open);
                    }}
                >
                    <AlertDialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl border-zinc-200 p-0 shadow-2xl">
                        <AlertDialogHeader className="gap-0 px-5 pb-4 pt-5 text-left sm:px-6 sm:pt-6">
                            <div className="flex items-start gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
                                    <CircleDollarSign
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </div>
                                <div className="min-w-0 pt-0.5">
                                    <AlertDialogTitle className="text-lg font-semibold tracking-tight text-zinc-950">
                                        Xác nhận đã chuyển tiền hoàn?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="mt-1.5 leading-5 text-zinc-600">
                                        Kiểm tra lại khoản hoàn và người nhận
                                        trước khi ghi nhận giao dịch.
                                    </AlertDialogDescription>
                                </div>
                            </div>
                        </AlertDialogHeader>

                        <div className="space-y-3 px-5 pb-5 sm:px-6">
                            {/* Tóm tắt số tiền và tài khoản để admin đối chiếu trước khi chốt; nút xác nhận chỉ cập nhật trạng thái và sổ tài chính. */}
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
                                <div className="flex items-end justify-between gap-3">
                                    <span className="text-sm text-zinc-600">
                                        Số tiền cần hoàn
                                    </span>
                                    <strong className="text-xl font-bold tracking-tight text-zinc-950">
                                        {formatRefundAmount(refund.amount)}
                                    </strong>
                                </div>
                                <div className="mt-3 border-t border-zinc-200 pt-3">
                                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                        Đơn hàng
                                    </span>
                                    <p className="mt-1 break-all text-sm font-semibold text-zinc-900">
                                        {refund.orderNumber}
                                    </p>
                                </div>
                            </div>

                            {refund.refundAccountNumber ? (
                                <div className="rounded-xl border border-zinc-200 px-4 py-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                        Tài khoản nhận tiền
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                                        {refund.refundBankName || 'Ngân hàng'}
                                    </p>
                                    {refund.refundAccountHolder ? (
                                        <p className="mt-0.5 text-sm text-zinc-600">
                                            {refund.refundAccountHolder}
                                        </p>
                                    ) : null}
                                    <p className="mt-1 font-mono text-sm text-zinc-700">
                                        {refund.refundAccountNumber}
                                    </p>
                                </div>
                            ) : null}

                            <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-950">
                                <AlertCircle
                                    aria-hidden="true"
                                    className="mt-0.5 size-4 shrink-0 text-amber-700"
                                />
                                <p>
                                    Chỉ xác nhận sau khi ngân hàng báo chuyển
                                    tiền thành công. Hệ thống không tự chuyển
                                    tiền.
                                </p>
                            </div>
                        </div>

                        <AlertDialogFooter className="border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:px-6">
                            <AlertDialogCancel
                                disabled={isConfirmingRefund}
                                className="mt-0 h-10 rounded-xl border-zinc-200 bg-white px-4"
                            >
                                Kiểm tra lại
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                disabled={isConfirmingRefund}
                                onClick={() => void confirmRefund()}
                                className="h-10 rounded-xl bg-zinc-950 px-4 text-white shadow-sm hover:bg-zinc-800"
                            >
                                {isConfirmingRefund
                                    ? 'Đang ghi nhận...'
                                    : 'Đã chuyển, xác nhận hoàn'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}
