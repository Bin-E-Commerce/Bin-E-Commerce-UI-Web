// Dialog payout trình bày tài khoản nhận, QR VietQR và bước admin xác minh giao dịch.
// File không tự đổi trạng thái; trang cha gọi mutation và backend là nguồn chuẩn của trạng thái payout.
'use client';

import {
    Banknote,
    CircleAlert,
    CircleCheck,
    CircleDollarSign,
    Copy,
    Landmark,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { WithdrawalDialogProps } from '../../types/payouts/seller-withdrawals.types';
import { formatMoney } from '../../utils/format-finance-money';
import { buildVietQrTransferPayload } from '../../utils/build-vietqr-transfer-payload.util';

// Trình bày thông tin payout và hướng dẫn admin xác minh người nhận trước khi chốt.
// Mọi chuyển trạng thái vẫn do callback của trang cha xử lý, dialog chỉ giữ trải nghiệm thao tác.
export function WithdrawalDialog({
    open,
    onOpenChange,
    isLoading,
    isError,
    detail,
    payoutReadiness,
    manualTransferAcknowledged,
    recipientConfirmed,
    adminNote,
    onAdminNoteChange,
    onManualTransferAcknowledgedChange,
    onRecipientConfirmedChange,
    isWithdrawalPending,
    isWithdrawalError,
    isReadinessPending,
    isReadinessError,
    onCopyMemo,
    onStartProcessing,
    onConfirmTransfer,
    onReject,
}: WithdrawalDialogProps) {
    // Reference cũ đánh dấu payout đã khởi chạy bởi tích hợp trước; không cho tạo thêm khoản chi Pay2S.
    const isLegacyProcessing = Boolean(
        detail?.status === 'PROCESSING' &&
        (!detail.processedAt || detail.transferReference) &&
        !detail.pay2sTransactionId,
    );
    // Màu trạng thái giúp admin nhận biết readiness nhưng không ảnh hưởng điều kiện hay luồng xử lý payout.
    const readinessToneClassName = isReadinessError
        ? 'border-red-200 bg-red-50/70 text-red-950'
        : isReadinessPending
          ? 'border-zinc-200 bg-zinc-50 text-zinc-800'
          : payoutReadiness?.ready
            ? 'border-zinc-200 bg-zinc-50 text-zinc-800'
            : 'border-amber-200 bg-amber-50/80 text-amber-950';
    // Từ chối dùng màu đỏ; hoàn tất/đã nhận webhook trung tính, còn yêu cầu chờ dùng màu cảnh báo.
    const statusToneClassName =
        detail?.status === 'REJECTED'
            ? 'border-red-200 bg-red-50 text-red-800'
            : detail?.status === 'PAID'
              ? 'border-zinc-300 bg-zinc-100 text-zinc-800'
              : detail?.status === 'PROCESSING' && detail.pay2sTransactionId
                ? 'border-zinc-200 bg-zinc-50 text-zinc-700'
                : 'border-amber-200 bg-amber-50 text-amber-800';
    // Bỏ qua khoảng trắng để nút từ chối chỉ mở khóa khi có nội dung lý do thực sự.
    const hasRejectionReason = adminNote.trim().length > 0;
    // Chỉ dựng QR sau khi payout đã PROCESSING; request mới và luồng legacy chưa thể nhận OUT an toàn.
    const transferQrResult =
        detail?.status === 'PROCESSING' &&
        !detail.pay2sTransactionId &&
        !isLegacyProcessing
            ? buildVietQrTransferPayload(detail)
            : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-0 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.38)] sm:max-w-5xl">
                <DialogHeader className="shrink-0 border-b border-zinc-100 bg-white px-5 py-5 pr-14 sm:px-6">
                    <div className="flex items-start gap-3.5">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                            <Landmark className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 pt-0.5">
                            <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-950">
                                Chuyển khoản cho seller
                            </DialogTitle>
                            <DialogDescription className="mt-1.5 max-w-xl text-[13px] leading-5 text-zinc-500">
                                Admin chuyển bằng app ngân hàng. Pay2S chỉ đối
                                soát giao dịch tiền ra, không tự gửi tiền.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {isLoading ? (
                        <div className="m-5 h-24 animate-pulse rounded-2xl bg-zinc-100" />
                    ) : detail ? (
                        <div
                            className={`grid grid-cols-1 items-stretch gap-4 px-4 py-5 sm:px-6 ${
                                detail.status === 'REJECTED'
                                    ? 'lg:grid-cols-1'
                                    : 'lg:grid-cols-2'
                            }`}
                        >
                            {/* Trạng thái đã từ chối dùng một cột để lý do nằm thành hàng riêng bên dưới thông tin payout. */}
                            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.03]">
                                <div className="flex items-start justify-between gap-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-4 sm:px-5">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                            Số tiền yêu cầu
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 tabular-nums sm:text-[28px]">
                                            {formatMoney(detail.amount)}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1.5 text-[10px] font-bold tracking-wide shadow-sm ${statusToneClassName}`}
                                    >
                                        {detail.status === 'PROCESSING'
                                            ? detail.pay2sTransactionId
                                                ? 'Đã nhận giao dịch OUT'
                                                : 'Chờ giao dịch OUT'
                                            : detail.status === 'PAID'
                                              ? 'Đã xác nhận đã chuyển'
                                              : detail.status === 'REQUESTED'
                                                ? 'Chờ xử lý'
                                                : detail.status}
                                    </span>
                                </div>
                                <div className="px-4 py-4 sm:px-5">
                                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                                        Tài khoản nhận
                                    </p>
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200">
                                            <Banknote
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-zinc-950">
                                                {detail.bankName}
                                            </p>
                                            <p className="mt-0.5 text-sm leading-5 text-zinc-600">
                                                {detail.accountHolder}
                                            </p>
                                            <p className="mt-1 break-all font-mono text-[13px] font-medium tracking-wide text-zinc-600">
                                                {detail.accountNumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {(detail.status === 'REQUESTED' ||
                                detail.status === 'PROCESSING') && (
                                <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-950">
                                                Nội dung chuyển khoản
                                            </p>
                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                {detail.pay2sTransactionId
                                                    ? 'Nội dung dùng để đối chiếu giao dịch đã nhận'
                                                    : 'Sao chép chính xác khi chuyển khoản'}
                                            </p>
                                        </div>
                                        {/* Khi đã có OUT, memo chỉ còn là dữ liệu đối chiếu; trước đó admin cần giữ nguyên lúc chuyển. */}
                                        <p
                                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                                detail.pay2sTransactionId
                                                    ? 'border-zinc-200 bg-zinc-50 text-zinc-700'
                                                    : 'border-amber-200 bg-amber-50 text-amber-800'
                                            }`}
                                        >
                                            {detail.pay2sTransactionId
                                                ? 'Mã đối soát'
                                                : 'Giữ nguyên memo'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-stretch justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 p-2.5 sm:flex-row sm:items-center sm:gap-3">
                                        <code className="min-w-0 break-all px-1 font-mono text-xs font-semibold leading-5 tracking-wide text-zinc-900">
                                            {detail.transferMemo}
                                        </code>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-9 shrink-0 rounded-lg border-zinc-300 bg-white px-3 text-xs shadow-sm"
                                            onClick={onCopyMemo}
                                        >
                                            <Copy
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                            Sao chép
                                        </Button>
                                    </div>
                                    {/* Chỉ cho chuyển khi payout đã PROCESSING; memo đã khớp thì cảnh báo tránh gửi trùng. */}
                                    <p className="text-xs leading-5 text-zinc-500">
                                        {detail.status === 'REQUESTED'
                                            ? 'Bấm “Bắt đầu chuyển thủ công” trước; QR sẽ hiện khi yêu cầu sang trạng thái Đang xử lý.'
                                            : detail.pay2sTransactionId
                                              ? 'Pay2S đã nhận giao dịch OUT. Không chuyển thêm; hãy xác minh người nhận trước khi xác nhận.'
                                              : isLegacyProcessing
                                                ? 'Yêu cầu thuộc luồng cũ; hãy kiểm tra lịch sử ngân hàng và giữ nguyên memo này nếu cần đối soát.'
                                                : 'Quét mã VietQR bên dưới, kiểm tra người nhận, số tiền và nội dung trong app ngân hàng trước khi chuyển.'}
                                    </p>
                                </section>
                            )}
                            {/* QR chiếm trọn hàng và chỉ xuất hiện trước khi Pay2S nhận OUT để admin không quét rồi gửi trùng. */}
                            {detail.status === 'PROCESSING' &&
                                !detail.pay2sTransactionId &&
                                !isLegacyProcessing && (
                                    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03] lg:col-span-2 sm:p-5">
                                        {transferQrResult?.ok ? (
                                            <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
                                                <div className="mx-auto rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                                                    <QRCodeSVG
                                                        value={
                                                            transferQrResult.payload
                                                        }
                                                        size={196}
                                                        level="M"
                                                        includeMargin
                                                        title="Mã VietQR chuyển tiền cho seller"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-zinc-950">
                                                            Quét mã bằng app
                                                            ngân hàng
                                                        </p>
                                                        <p className="mt-1 text-sm leading-5 text-zinc-600">
                                                            Mã đã điền sẵn ngân
                                                            hàng/tài khoản nhận,
                                                            số tiền và nội dung
                                                            đối soát.
                                                        </p>
                                                    </div>
                                                    <dl className="grid gap-x-5 gap-y-2 rounded-xl bg-zinc-50 p-3 text-sm sm:grid-cols-2">
                                                        <div>
                                                            <dt className="text-xs text-zinc-500">
                                                                Ngân hàng
                                                            </dt>
                                                            <dd className="mt-0.5 font-medium text-zinc-900">
                                                                {
                                                                    detail.bankName
                                                                }
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-xs text-zinc-500">
                                                                Chủ tài khoản
                                                            </dt>
                                                            <dd className="mt-0.5 font-medium text-zinc-900">
                                                                {
                                                                    detail.accountHolder
                                                                }
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-xs text-zinc-500">
                                                                Số tài khoản
                                                            </dt>
                                                            <dd className="mt-0.5 break-all font-mono text-zinc-900">
                                                                {
                                                                    detail.accountNumber
                                                                }
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-xs text-zinc-500">
                                                                Số tiền
                                                            </dt>
                                                            <dd className="mt-0.5 font-semibold tabular-nums text-zinc-950">
                                                                {formatMoney(
                                                                    detail.amount,
                                                                )}
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-5 text-amber-950">
                                                        Hãy kiểm tra tên người
                                                        nhận và số tiền ở màn
                                                        xác nhận của ngân hàng
                                                        trước khi tự chuyển.
                                                        Quét mã không tự gửi
                                                        tiền.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-950">
                                                {transferQrResult?.reason ===
                                                'UNSUPPORTED_BANK'
                                                    ? 'Ngân hàng này chưa được xác nhận hỗ trợ VietQR. Hãy chuyển thủ công bằng thông tin người nhận và memo ở trên.'
                                                    : transferQrResult?.reason ===
                                                        'MEMO_TOO_LONG'
                                                      ? 'Memo của yêu cầu cũ dài hơn giới hạn QR an toàn. Hãy chuyển thủ công và giữ nguyên memo để Pay2S đối soát.'
                                                      : transferQrResult?.reason ===
                                                          'INVALID_ACCOUNT'
                                                        ? 'Số tài khoản không phù hợp định dạng VietQR. Hãy kiểm tra hồ sơ seller và chuyển thủ công.'
                                                        : transferQrResult?.reason ===
                                                            'INVALID_AMOUNT'
                                                          ? 'Số tiền không phù hợp định dạng chuyển khoản VietQR. Hãy chuyển thủ công theo số tiền yêu cầu.'
                                                          : 'Không thể tạo QR từ memo hiện tại. Hãy chuyển thủ công và giữ nguyên nội dung đối soát.'}
                                            </div>
                                        )}
                                    </section>
                                )}
                            {/* Ở trạng thái chờ xử lý, giữ thông tin tiền và memo ở hàng trên; cấu hình webhook và ghi chú lần lượt chiếm hai hàng rộng bên dưới. */}
                            {detail.status === 'REQUESTED' && (
                                <section
                                    className={`space-y-3 rounded-2xl border p-4 text-sm shadow-sm shadow-zinc-950/[0.02] lg:col-span-2 ${readinessToneClassName}`}
                                >
                                    {isReadinessPending ? (
                                        <p className="font-medium leading-5">
                                            Đang kiểm tra cấu hình webhook
                                            Pay2S...
                                        </p>
                                    ) : isReadinessError ? (
                                        <p className="font-medium leading-5">
                                            Không thể kiểm tra webhook Pay2S.
                                            Tải lại trang hoặc kiểm tra Order
                                            Service.
                                        </p>
                                    ) : !payoutReadiness?.ready ? (
                                        <p className="font-medium leading-5">
                                            Chưa thể bắt đầu: thiếu{' '}
                                            {payoutReadiness?.missing
                                                .map((item) =>
                                                    item === 'WEBHOOK_TOKEN'
                                                        ? 'PAY2S_PAYOUT_WEBHOOK_TOKEN'
                                                        : 'PAY2S_PAYOUT_SOURCE_ACCOUNT_NUMBER',
                                                )
                                                .join(' và ')}
                                            . Cấu hình Hook Pay2S và tài khoản
                                            nguồn trong Order Service trước.
                                        </p>
                                    ) : (
                                        <p className="font-medium leading-5">
                                            Webhook Pay2S đã sẵn sàng. Bấm bắt
                                            đầu chỉ chuyển yêu cầu sang trạng
                                            thái xử lý; admin vẫn phải chuyển
                                            tiền bằng app ngân hàng.
                                        </p>
                                    )}
                                    <div className="flex items-start gap-3 rounded-xl border border-black/5 bg-white/75 p-3.5 shadow-sm shadow-black/[0.02]">
                                        <Checkbox
                                            id="finance-manual-transfer-acknowledged"
                                            checked={manualTransferAcknowledged}
                                            onCheckedChange={(checked) =>
                                                onManualTransferAcknowledgedChange(
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="finance-manual-transfer-acknowledged"
                                            className="cursor-pointer text-[13px] font-medium leading-5 text-zinc-800"
                                        >
                                            Tôi đã kiểm tra đúng tên ngân hàng,
                                            số tài khoản và chủ tài khoản
                                            seller; hiểu hệ thống không tự
                                            chuyển tiền.
                                        </Label>
                                    </div>
                                </section>
                            )}

                            {/* Biến xác nhận OUT thành một dải toàn hàng để tận dụng chiều rộng và tách rõ dữ liệu đối soát khỏi ghi chú. */}
                            {detail.status === 'PROCESSING' &&
                                detail.pay2sTransactionId && (
                                    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50/80 p-4 text-sm text-zinc-900 shadow-sm shadow-zinc-950/[0.03] lg:col-span-2 sm:p-5">
                                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                                                    <CircleCheck
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-zinc-950">
                                                        Pay2S đã nhận giao dịch
                                                        tiền ra
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-zinc-500">
                                                        Đối soát được giao dịch;
                                                        admin cần xác minh người
                                                        nhận trong app ngân
                                                        hàng.
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800">
                                                Chờ xác minh người nhận
                                            </span>
                                        </header>

                                        {/* Ba ô dữ liệu cùng hàng giúp tận dụng không gian, còn màn hình nhỏ tự xếp dọc để mã giao dịch không bị ép. */}
                                        <dl className="grid gap-3 sm:grid-cols-3">
                                            <div className="min-w-0 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                                                <dt className="text-xs font-medium text-zinc-500">
                                                    Số tiền nhận diện
                                                </dt>
                                                <dd className="mt-1.5 font-semibold tabular-nums text-zinc-950">
                                                    {formatMoney(
                                                        detail.pay2sTransferAmount ??
                                                            '0',
                                                    )}
                                                </dd>
                                            </div>
                                            <div className="min-w-0 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                                                <dt className="text-xs font-medium text-zinc-500">
                                                    Mã giao dịch Pay2S
                                                </dt>
                                                <dd className="mt-1.5 break-all font-mono text-xs leading-5 text-zinc-900">
                                                    {detail.pay2sTransactionNumber ??
                                                        detail.pay2sTransactionId}
                                                </dd>
                                            </div>
                                            <div className="min-w-0 rounded-xl border border-zinc-200 bg-white px-4 py-3">
                                                <dt className="text-xs font-medium text-zinc-500">
                                                    Thời điểm nhận
                                                </dt>
                                                <dd className="mt-1.5 text-xs font-medium leading-5 text-zinc-900">
                                                    {detail.pay2sTransferDetectedAt
                                                        ? new Date(
                                                              detail.pay2sTransferDetectedAt,
                                                          ).toLocaleString(
                                                              'vi-VN',
                                                          )
                                                        : 'Vừa xong'}
                                                </dd>
                                            </div>
                                        </dl>

                                        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-5 text-amber-950">
                                            <CircleAlert
                                                className="mt-0.5 size-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <p>
                                                Webhook Pay2S không xác minh
                                                được tài khoản nhận. Hãy kiểm
                                                tra tiền đã vào đúng tài khoản
                                                seller trước khi xác nhận.
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm shadow-zinc-950/[0.02]">
                                            <Checkbox
                                                id="finance-recipient-confirmed"
                                                checked={recipientConfirmed}
                                                onCheckedChange={(checked) =>
                                                    onRecipientConfirmedChange(
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="finance-recipient-confirmed"
                                                className="cursor-pointer text-sm leading-5 text-zinc-800"
                                            >
                                                Tôi đã kiểm tra giao dịch trong
                                                app ngân hàng và xác nhận tiền
                                                đến đúng tài khoản seller phía
                                                trên.
                                            </Label>
                                        </div>
                                    </section>
                                )}

                            {/* Cảnh báo và ghi chú trải toàn chiều ngang để nằm thành hai hàng riêng, dễ đọc và xử lý. */}
                            {detail.status === 'PROCESSING' &&
                                !detail.pay2sTransactionId && (
                                    <section
                                        className={`flex items-start gap-3.5 rounded-2xl border p-4 shadow-sm lg:col-span-2 ${
                                            isLegacyProcessing
                                                ? 'border-red-200 bg-red-50/70 text-red-950'
                                                : 'border-amber-200 bg-amber-50/80 text-amber-950'
                                        }`}
                                    >
                                        <span
                                            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
                                                isLegacyProcessing
                                                    ? 'bg-white text-red-700 ring-red-200'
                                                    : 'bg-white text-amber-700 ring-amber-200'
                                            }`}
                                        >
                                            <CircleAlert
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <div className="min-w-0 pt-0.5">
                                            <p className="text-sm font-semibold">
                                                {isLegacyProcessing
                                                    ? 'Cần rà soát giao dịch thủ công'
                                                    : 'Đang chờ Pay2S xác nhận giao dịch OUT'}
                                            </p>
                                            <p className="mt-1 text-sm leading-5">
                                                {isLegacyProcessing
                                                    ? 'Yêu cầu này thuộc luồng xử lý cũ hoặc đã có mã tham chiếu. Không chuyển lại để tránh trả trùng; hãy kiểm tra lịch sử ngân hàng trước khi xử lý tiếp.'
                                                    : 'Sau khi chuyển trong app ngân hàng, giữ nguyên memo phía trên và chờ webhook Pay2S.'}
                                            </p>
                                        </div>
                                    </section>
                                )}

                            {detail.status === 'PAID' && (
                                <section className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03] sm:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                                <CircleCheck
                                                    className="size-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="min-w-0 pt-0.5">
                                                <p className="text-sm font-semibold leading-5 text-zinc-950">
                                                    Admin đã xác nhận chuyển
                                                    đúng tài khoản
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                                    Giao dịch đã được đối soát
                                                    và xác minh người nhận.
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1.5 text-[10px] font-bold tracking-wide shadow-sm ${statusToneClassName}`}
                                        >
                                            Hoàn tất
                                        </span>
                                    </div>
                                    <dl className="grid gap-2 sm:grid-cols-2">
                                        <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
                                            <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                                Mã giao dịch Pay2S
                                            </dt>
                                            <dd className="mt-1 break-all font-mono text-xs font-medium text-zinc-900">
                                                {detail.transferReference}
                                            </dd>
                                        </div>
                                        {detail.recipientConfirmedAt && (
                                            <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
                                                <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                                    Thời điểm xác nhận
                                                </dt>
                                                <dd className="mt-1 text-xs font-medium text-zinc-900">
                                                    {new Date(
                                                        detail.recipientConfirmedAt,
                                                    ).toLocaleString('vi-VN')}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </section>
                            )}

                            {detail.status === 'REJECTED' ? (
                                <section className="space-y-2 rounded-2xl border border-red-200 bg-red-50/50 p-4 sm:p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-red-950">
                                            Lý do từ chối
                                        </p>
                                        <span className="rounded-full border border-red-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                                            Đã lưu
                                        </span>
                                    </div>
                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700">
                                        {detail.adminNote?.trim() ||
                                            'Yêu cầu này chưa có lý do từ chối được lưu.'}
                                    </p>
                                </section>
                            ) : (
                                <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03] lg:col-span-2 sm:p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <Label
                                            htmlFor="finance-admin-note"
                                            className="text-sm font-semibold text-zinc-900"
                                        >
                                            {detail.status === 'REQUESTED'
                                                ? 'Lý do từ chối / ghi chú xử lý'
                                                : 'Ghi chú xử lý'}
                                        </Label>
                                        <span
                                            className={`text-[11px] ${
                                                detail.status === 'REQUESTED'
                                                    ? 'font-medium text-red-700'
                                                    : 'text-zinc-400'
                                            }`}
                                        >
                                            {detail.status === 'REQUESTED'
                                                ? 'Bắt buộc nếu từ chối'
                                                : 'Tùy chọn - audit nội bộ'}
                                        </span>
                                    </div>
                                    <Textarea
                                        id="finance-admin-note"
                                        value={adminNote}
                                        onChange={(event) =>
                                            onAdminNoteChange(
                                                event.target.value,
                                            )
                                        }
                                        maxLength={500}
                                        placeholder={
                                            detail.status === 'REQUESTED'
                                                ? 'Nhập lý do từ chối hoặc ghi chú xử lý...'
                                                : 'Ghi chú audit'
                                        }
                                        className="min-h-24 w-full resize-y rounded-xl border-zinc-200 bg-zinc-50/60 px-3.5 py-3 text-sm shadow-inner shadow-zinc-950/[0.02] placeholder:text-zinc-400 focus-visible:bg-white"
                                    />
                                    {detail.status === 'REQUESTED' && (
                                        <p className="text-xs leading-5 text-zinc-500">
                                            Nếu từ chối, lý do sẽ được lưu vào
                                            lịch sử xử lý yêu cầu.
                                        </p>
                                    )}
                                </div>
                            )}

                            {isWithdrawalError && (
                                <p
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800"
                                >
                                    Không thể cập nhật yêu cầu. Hãy tải lại
                                    trạng thái trước khi thao tác tiếp.
                                </p>
                            )}
                        </div>
                    ) : isError ? (
                        <p role="alert" className="m-5 text-sm text-red-700">
                            Không thể xem chi tiết payout. Tài khoản hiện tại có
                            thể chưa được cấp quyền payout.
                        </p>
                    ) : null}
                </div>
                <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-zinc-200 bg-white px-4 py-3.5 sm:px-6">
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
                        {detail?.status === 'REQUESTED' && (
                            <>
                                <Button
                                    type="button"
                                    className="col-span-2 h-10 rounded-xl shadow-sm sm:order-3 sm:col-span-1 sm:min-w-48"
                                    disabled={
                                        isWithdrawalPending ||
                                        isReadinessPending ||
                                        !payoutReadiness?.ready ||
                                        !manualTransferAcknowledged
                                    }
                                    onClick={onStartProcessing}
                                >
                                    <CircleDollarSign aria-hidden="true" />
                                    Bắt đầu chuyển thủ công
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructiveSolid"
                                    className="h-10 rounded-xl sm:order-2 sm:min-w-24"
                                    disabled={
                                        isWithdrawalPending ||
                                        !hasRejectionReason
                                    }
                                    onClick={onReject}
                                >
                                    Từ chối
                                </Button>
                            </>
                        )}
                        {detail?.status === 'PROCESSING' &&
                            detail.pay2sTransactionId && (
                                <Button
                                    type="button"
                                    className="col-span-2 h-10 rounded-xl shadow-sm sm:order-3 sm:col-span-1 sm:min-w-52"
                                    disabled={
                                        isWithdrawalPending ||
                                        !recipientConfirmed
                                    }
                                    onClick={onConfirmTransfer}
                                >
                                    Xác nhận đã chuyển đúng tài khoản
                                </Button>
                            )}
                        <Button
                            type="button"
                            variant="outline"
                            className="col-span-2 h-10 rounded-xl border-zinc-200 sm:order-1 sm:col-span-1 sm:min-w-24"
                            onClick={() => onOpenChange(false)}
                        >
                            Đóng
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
