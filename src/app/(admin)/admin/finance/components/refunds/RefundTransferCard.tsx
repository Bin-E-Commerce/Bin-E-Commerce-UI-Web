// Thẻ quản lý thông tin nhận hoàn và VietQR; không tự gửi tiền hay chuyển dữ liệu tài khoản ra ngoài trình duyệt.
'use client';

import { useEffect, useState } from 'react';
import {
    AlertCircle,
    BadgeCheck,
    Building2,
    Check,
    QrCode,
    ScanLine,
    UserRound,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { BANK_OPTIONS } from '@/constants/bank-options.constant';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { RefundTransferCardProps } from '../../types/refunds/refund-transfer-card.types';
import { buildVietQrRefundTransfer } from '../../utils/build-vietqr-refund-transfer.util';

// Trình bày ngân hàng, người nhận, số tiền và nội dung chuyển để admin kiểm tra cùng QR trước khi tự chuyển.
export function RefundTransferCard({
    refund,
    isSavingRecipientAccount,
    isConfirmingRefund,
    onSaveRecipientAccount,
    onConfirmRefund,
}: RefundTransferCardProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [bankCode, setBankCode] = useState(refund.refundBankCode ?? '');
    const [accountHolder, setAccountHolder] = useState(
        refund.refundAccountHolder ?? '',
    );
    const [accountNumber, setAccountNumber] = useState(
        refund.refundAccountNumber ?? '',
    );
    const transfer = buildVietQrRefundTransfer(refund);
    const transferFailureReason =
        transfer?.result.ok === false ? transfer.result.reason : null;
    const selectedBank = BANK_OPTIONS.find(
        (option) => option.value === bankCode,
    );
    // Chỉ cho lưu tài khoản cho payment attempt và khi đủ mã ngân hàng, tên chủ tài khoản, số tài khoản.
    const canSaveRecipientAccount =
        refund.sourceType === 'PAYMENT_ATTEMPT' &&
        Boolean(selectedBank) &&
        accountHolder.trim().length >= 2 &&
        /^\d{6,30}$/.test(accountNumber);
    const recipientMissing =
        refund.sourceType === 'PAYMENT_ATTEMPT' && !refund.refundAccountNumber;

    // Làm mới draft form khi refund queue nhận snapshot mới từ server, để thao tác admin không ghi đè dữ liệu customer vừa sửa.
    useEffect(() => {
        setBankCode(refund.refundBankCode ?? '');
        setAccountHolder(refund.refundAccountHolder ?? '');
        setAccountNumber(refund.refundAccountNumber ?? '');
    }, [
        refund.refundAccountHolder,
        refund.refundAccountNumber,
        refund.refundBankCode,
    ]);

    // Chuẩn hóa dữ liệu trước khi gửi và lấy nhãn từ danh mục cố định để tránh lưu tên ngân hàng do nhập tùy ý.
    function saveRecipientAccount(): void {
        const normalizedAccountHolder = accountHolder.trim();
        const normalizedAccountNumber = accountNumber.trim();
        if (
            !selectedBank ||
            normalizedAccountHolder.length < 2 ||
            !/^\d{6,30}$/.test(normalizedAccountNumber)
        ) {
            return;
        }

        onSaveRecipientAccount({
            bankCode: selectedBank.value,
            bankName: selectedBank.label,
            accountHolder: normalizedAccountHolder,
            accountNumber: normalizedAccountNumber,
        });
    }

    // Chỉ đóng hộp thoại sau khi API ghi nhận hoàn thành công; lỗi được cha thông báo và giữ nguyên để thử lại.
    async function confirmRefund(): Promise<void> {
        if (isConfirmingRefund || recipientMissing) return;
        try {
            await onConfirmRefund();
            setConfirmOpen(false);
        } catch {
            // Mutation đã hiển thị lỗi bằng toast nên không cần phát sinh thêm thông báo trùng.
        }
    }

    return (
        <aside className="h-fit min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-900/[0.03]">
            <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/80 px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                        <QrCode className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Thông tin nhận tiền
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Hoàn cho khách qua ngân hàng
                        </p>
                    </div>
                </div>
                {refund.refundAccountNumber ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        <BadgeCheck className="size-3.5" aria-hidden="true" />
                        Đã có tài khoản
                    </span>
                ) : (
                    <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
                        Thiếu thông tin
                    </span>
                )}
            </header>

            {refund.refundAccountNumber ? (
                <div className="grid min-w-0 gap-4 p-4 md:grid-cols-[minmax(240px,256px)_minmax(0,1fr)]">
                    <div className="space-y-3">
                        {transfer?.result.ok ? (
                            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3.5 text-center">
                                <div className="mx-auto grid w-fit place-items-center rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
                                    <QRCodeSVG
                                        value={transfer.result.payload}
                                        size={208}
                                        level="M"
                                        includeMargin
                                        title={`VietQR hoàn tiền đơn ${refund.orderNumber}`}
                                    />
                                </div>
                                <p className="mt-2 text-xs font-medium leading-5 text-zinc-600">
                                    Quét bằng app ngân hàng để điền lệnh chuyển
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-950">
                                <AlertCircle
                                    className="mt-0.5 size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <p>
                                    {transferFailureReason ===
                                    'UNSUPPORTED_BANK'
                                        ? 'Ngân hàng chưa hỗ trợ VietQR. Dùng thông tin dưới đây để chuyển thủ công.'
                                        : transferFailureReason ===
                                            'INVALID_ACCOUNT'
                                          ? 'Số tài khoản không phù hợp VietQR. Hãy kiểm tra lại trước khi chuyển thủ công.'
                                          : transferFailureReason ===
                                              'INVALID_AMOUNT'
                                            ? 'Số tiền chưa phù hợp định dạng VietQR. Hãy chuyển thủ công đúng số tiền hoàn.'
                                            : transferFailureReason ===
                                                'MEMO_TOO_LONG'
                                              ? 'Nội dung chuyển vượt giới hạn VietQR. Hãy chuyển thủ công và ghi mã đơn.'
                                              : 'Chưa thể tạo VietQR. Hãy dùng thông tin dưới đây để chuyển thủ công.'}
                                </p>
                            </div>
                        )}

                        <p className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600">
                            <ScanLine
                                className="mt-0.5 size-4 shrink-0 text-zinc-700"
                                aria-hidden="true"
                            />
                            QR chỉ điền lệnh, không tự chuyển tiền.
                        </p>
                    </div>

                    <div className="min-w-0 space-y-3">
                        <section className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                                <UserRound
                                    className="size-4 text-zinc-700"
                                    aria-hidden="true"
                                />
                                Tài khoản nhận
                            </div>
                            <dl className="space-y-2.5 text-sm">
                                <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-2.5">
                                    <dt className="shrink-0 text-zinc-500">
                                        Ngân hàng
                                    </dt>
                                    <dd className="min-w-0 text-right font-semibold text-zinc-900">
                                        {refund.refundBankName ||
                                            'Chưa có tên ngân hàng'}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-2.5">
                                    <dt className="shrink-0 text-zinc-500">
                                        Chủ tài khoản
                                    </dt>
                                    <dd className="min-w-0 break-words text-right font-semibold text-zinc-900">
                                        {refund.refundAccountHolder ||
                                            'Chưa có thông tin'}
                                    </dd>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                    <dt className="shrink-0 text-zinc-500">
                                        Số tài khoản
                                    </dt>
                                    <dd className="min-w-0 break-all text-right font-mono font-semibold text-zinc-900">
                                        {refund.refundAccountNumber}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 sm:p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm text-zinc-600">
                                    <Building2
                                        className="size-4 text-zinc-500"
                                        aria-hidden="true"
                                    />
                                    Số tiền hoàn
                                </div>
                                <p className="text-lg font-bold tabular-nums text-zinc-800">
                                    {Number(refund.amount).toLocaleString(
                                        'vi-VN',
                                    )}{' '}
                                    đ
                                </p>
                            </div>
                            {transfer ? (
                                <div className="mt-3 border-t border-zinc-200 pt-3">
                                    <p className="text-xs text-zinc-500">
                                        Nội dung chuyển khoản
                                    </p>
                                    <p className="mt-1 break-all rounded-lg border border-zinc-200 bg-white px-2.5 py-2 font-mono text-xs font-semibold text-zinc-800">
                                        {transfer.transferMemo}
                                    </p>
                                </div>
                            ) : null}
                        </section>
                    </div>
                </div>
            ) : refund.sourceType === 'PAYMENT_ATTEMPT' ? (
                <div className="space-y-4 p-4 sm:p-5">
                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 px-4 py-3.5 text-sm leading-5 text-zinc-950">
                        Hồ sơ chưa lưu tài khoản nhận. Hãy xác minh trực tiếp
                        với khách rồi nhập chính xác thông tin dưới đây để tạo
                        QR.
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor={`refund-bank-${refund.id}`}
                                className="text-sm font-medium text-zinc-700"
                            >
                                Ngân hàng nhận
                            </Label>
                            <Select
                                value={bankCode}
                                onValueChange={(value) => {
                                    // Chỉ lưu mã nằm trong danh mục ngân hàng dùng chung để QR tra đúng BIN.
                                    setBankCode(value ?? '');
                                }}
                            >
                                <SelectTrigger
                                    id={`refund-bank-${refund.id}`}
                                    className="h-10 min-h-10 w-full rounded-xl border-zinc-200 bg-white py-0 shadow-none"
                                >
                                    <SelectValue placeholder="Chọn ngân hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BANK_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor={`refund-holder-${refund.id}`}
                                className="text-sm font-medium text-zinc-700"
                            >
                                Tên chủ tài khoản
                            </Label>
                            <Input
                                id={`refund-holder-${refund.id}`}
                                autoComplete="off"
                                maxLength={100}
                                value={accountHolder}
                                onChange={(event) =>
                                    setAccountHolder(
                                        event.target.value.slice(0, 100),
                                    )
                                }
                                placeholder="Nhập đúng tên trên tài khoản"
                                className="h-10 min-h-10 rounded-xl border-zinc-200 py-0 shadow-none"
                            />
                        </div>
                        <div className="grid gap-1.5 sm:col-span-2">
                            <Label
                                htmlFor={`refund-account-${refund.id}`}
                                className="text-sm font-medium text-zinc-700"
                            >
                                Số tài khoản
                            </Label>
                            <Input
                                id={`refund-account-${refund.id}`}
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={30}
                                value={accountNumber}
                                onChange={(event) => {
                                    // Loại ký tự phân cách khi dán để payload lưu đúng số tài khoản dạng chữ số.
                                    setAccountNumber(
                                        event.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 30),
                                    );
                                }}
                                placeholder="Từ 6 đến 30 chữ số"
                                className="h-10 min-h-10 rounded-xl border-zinc-200 py-0 shadow-none"
                            />
                        </div>
                    </div>
                    <p className="text-xs leading-5 text-zinc-500">
                        Chỉ lưu sau khi đã xác nhận với khách. QR sẽ được tạo
                        cục bộ sau khi lưu thành công.
                    </p>
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-950">
                        <AlertCircle
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden="true"
                        />
                        <p>
                            Chưa có tài khoản nhận tiền. Hãy xác minh thông tin
                            khách trước khi chuyển khoản.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 border-t border-zinc-200 bg-zinc-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0 space-y-1">
                    <p className="text-xs leading-5 text-zinc-600">
                        Chỉ xác nhận sau khi ngân hàng báo chuyển tiền thành
                        công.
                    </p>
                    {recipientMissing ? (
                        <p className="text-xs leading-5 text-amber-800">
                            Cần lưu tài khoản nhận của khách trước khi xác nhận.
                        </p>
                    ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end">
                    {/* Chỉ hiện nút lưu cạnh nút xác nhận khi payment attempt chưa có tài khoản nhận. */}
                    {recipientMissing ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 w-full rounded-xl border-zinc-300 bg-white px-4 text-zinc-800 shadow-sm hover:bg-zinc-100 sm:min-w-44 sm:w-auto"
                            disabled={
                                !canSaveRecipientAccount ||
                                isSavingRecipientAccount
                            }
                            onClick={saveRecipientAccount}
                        >
                            {isSavingRecipientAccount
                                ? 'Đang lưu thông tin...'
                                : 'Lưu tài khoản & tạo QR'}
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        className="h-10 w-full rounded-xl bg-zinc-950 px-4 text-white shadow-sm hover:bg-zinc-800 sm:min-w-44 sm:w-auto"
                        disabled={
                            isConfirmingRefund ||
                            isSavingRecipientAccount ||
                            recipientMissing
                        }
                        onClick={() => setConfirmOpen(true)}
                    >
                        <Check aria-hidden="true" />
                        {isConfirmingRefund
                            ? 'Đang ghi nhận...'
                            : 'Xác nhận đã chuyển'}
                    </Button>
                </div>
            </div>

            <AlertDialog
                open={confirmOpen}
                onOpenChange={(open) => {
                    if (!isConfirmingRefund) setConfirmOpen(open);
                }}
            >
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-950">
                            Xác nhận đã chuyển tiền hoàn?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <span className="block">
                                Xác nhận bạn đã chuyển đủ{' '}
                                <strong className="text-zinc-900">
                                    {Number(refund.amount).toLocaleString(
                                        'vi-VN',
                                    )}{' '}
                                    đ
                                </strong>{' '}
                                cho đơn {refund.orderNumber}.
                            </span>
                            <span className="block">
                                Hệ thống sẽ đóng khoản hoàn và cập nhật sổ tài
                                chính. Thao tác này không tự chuyển tiền.
                            </span>
                            {refund.refundAccountNumber ? (
                                <span className="block rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700">
                                    {refund.refundBankName} ·{' '}
                                    {refund.refundAccountNumber}
                                </span>
                            ) : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isConfirmingRefund}
                            className="mt-0"
                        >
                            Kiểm tra lại
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            disabled={isConfirmingRefund}
                            onClick={() => void confirmRefund()}
                            className="rounded-xl bg-zinc-950 text-white hover:bg-zinc-800"
                        >
                            {isConfirmingRefund
                                ? 'Đang ghi nhận...'
                                : 'Đã chuyển, xác nhận hoàn'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    );
}
