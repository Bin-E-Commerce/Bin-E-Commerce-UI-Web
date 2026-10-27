// Dialog chi tiết payout hiển thị tài khoản nhận, trạng thái provider và callback thao tác mà không sở hữu truy vấn nghiệp vụ.
'use client';

import { Banknote, CircleDollarSign, Copy, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import type { WithdrawalDialogProps } from '../../types/admin-finance-page.types';
import { formatMoney } from '../../utils/format-finance-money';

// Trình bày chi tiết yêu cầu, trạng thái payOS và các hành động admin được phép theo trạng thái.
export function WithdrawalDialog({
    open,
    onOpenChange,
    isLoading,
    isError,
    detail,
    isPayosWithdrawal,
    payoutReadiness,
    payoutStatus,
    adminNote,
    onAdminNoteChange,
    isWithdrawalPending,
    isWithdrawalError,
    isReadinessPending,
    isReadinessError,
    isPayoutStatusError,
    hasEnoughPayoutBalance,
    onCopyMemo,
    onPayout,
    onReject,
}: WithdrawalDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl sm:max-w-lg">
                <DialogHeader className="shrink-0 border-b border-zinc-100 px-5 py-4 pr-12">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                            <Landmark className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <DialogTitle className="text-base font-semibold tracking-tight text-zinc-950">
                                Chuyển khoản cho seller
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm leading-5 text-zinc-500">
                                Gửi lệnh chi qua payOS Kênh Chi tới tài khoản
                                ngân hàng seller đã cấu hình.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {isLoading ? (
                        <div className="m-5 h-24 animate-pulse rounded-2xl bg-zinc-100" />
                    ) : detail ? (
                        <div className="space-y-3.5 px-4 py-4 sm:px-5">
                            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/70">
                                <div className="flex items-start justify-between gap-4 border-b border-zinc-200/80 px-3.5 py-3">
                                    <div>
                                        <p className="text-xs font-medium text-zinc-500">
                                            Số tiền yêu cầu
                                        </p>
                                        <p className="mt-0.5 text-xl font-bold tracking-tight text-zinc-950 tabular-nums">
                                            {formatMoney(detail.amount)}
                                        </p>
                                    </div>
                                    <span className="inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                                        {detail.status === 'PROCESSING'
                                            ? isPayosWithdrawal
                                                ? payoutStatus?.transactionState ===
                                                  'NOT_FOUND'
                                                    ? 'Đang chờ payOS xác nhận'
                                                    : 'payOS đang xử lý'
                                                : 'Đang đối soát luồng cũ'
                                            : detail.status === 'PAID'
                                              ? 'Đã chuyển'
                                              : detail.status === 'FAILED'
                                                ? 'Chuyển khoản thất bại'
                                                : detail.status}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2.5 px-3.5 py-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200">
                                        <Banknote
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-zinc-900">
                                            {detail.bankName} ·{' '}
                                            {detail.bankCode}
                                        </p>
                                        <p className="mt-0.5 text-sm leading-5 text-zinc-600">
                                            {detail.accountHolder}
                                        </p>
                                        <p className="mt-0.5 break-all font-mono text-xs text-zinc-500">
                                            {detail.accountNumber}
                                        </p>
                                    </div>
                                </div>
                            </section>
                            {detail.status === 'PROCESSING' &&
                                !isPayosWithdrawal && (
                                    <section className="space-y-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-zinc-900">
                                                Nội dung chuyển khoản
                                            </p>
                                            <p className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                                                Bắt buộc
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2">
                                            <code className="min-w-0 break-all font-mono text-xs font-semibold tracking-wide text-zinc-950">
                                                {detail.transferMemo}
                                            </code>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-8 shrink-0 rounded-lg px-2.5 text-xs"
                                                onClick={() =>
                                                    void onCopyMemo()
                                                }
                                            >
                                                <Copy
                                                    className="size-3.5"
                                                    aria-hidden="true"
                                                />
                                                Sao chép
                                            </Button>
                                        </div>
                                        <p className="text-xs leading-4 text-zinc-600">
                                            Đây là yêu cầu đang xử lý theo luồng
                                            SePay/app ngân hàng cũ. Hãy đối
                                            chiếu lịch sử tài khoản nguồn trước;
                                            hệ thống không tự gửi lệnh payOS cho
                                            yêu cầu cũ để tránh chuyển tiền hai
                                            lần.
                                        </p>
                                    </section>
                                )}
                            {detail.status === 'PAID' && (
                                <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                    <p className="text-sm font-semibold text-emerald-900">
                                        payOS xác nhận đã chuyển tiền
                                    </p>
                                    <p className="mt-1 text-sm text-emerald-800">
                                        Mã giao dịch payOS:{' '}
                                        <span className="font-mono font-medium">
                                            {detail.transferReference}
                                        </span>
                                    </p>
                                </section>
                            )}
                            {detail.status === 'FAILED' && (
                                <section className="rounded-xl border border-red-200 bg-red-50 p-3">
                                    <p className="text-sm font-semibold text-red-900">
                                        payOS xác nhận lệnh chi thất bại
                                    </p>
                                    <p className="mt-1 text-sm text-red-800">
                                        Khoản giữ chỗ đã được hoàn lại vào số dư
                                        khả dụng của seller. Seller có thể gửi
                                        yêu cầu rút mới sau khi kiểm tra lại tài
                                        khoản ngân hàng.
                                    </p>
                                </section>
                            )}
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="finance-admin-note"
                                        className="text-sm font-medium text-zinc-800"
                                    >
                                        Ghi chú xử lý
                                    </Label>
                                    <Textarea
                                        id="finance-admin-note"
                                        value={adminNote}
                                        onChange={(event) =>
                                            onAdminNoteChange(
                                                event.target.value,
                                            )
                                        }
                                        maxLength={500}
                                        placeholder="Lý do từ chối hoặc ghi chú audit"
                                        className="min-h-16 resize-y rounded-xl border-zinc-300 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            {isWithdrawalError && (
                                <p
                                    role="alert"
                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                                >
                                    payOS chưa xác nhận kết quả. Yêu cầu vẫn
                                    được giữ ở trạng thái xử lý; hãy kiểm tra
                                    trạng thái trước khi thao tác tiếp.
                                </p>
                            )}
                            {detail.status === 'REQUESTED' && (
                                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                                    {isReadinessPending ? (
                                        <p>
                                            Đang kiểm tra Kênh Chi payOS và số
                                            dư nguồn...
                                        </p>
                                    ) : isReadinessError ? (
                                        <p>
                                            Không thể xác minh số dư hoặc kết
                                            nối Kênh Chi payOS. Kiểm tra cấu
                                            hình payOS và thử tải lại.
                                        </p>
                                    ) : !payoutReadiness?.ready ? (
                                        <p>
                                            Chưa thể gửi tiền: thiếu{' '}
                                            {payoutReadiness?.missing
                                                .map((item) =>
                                                    item === 'CLIENT_ID'
                                                        ? 'PAYOS_PAYOUT_CLIENT_ID'
                                                        : item === 'API_KEY'
                                                          ? 'PAYOS_PAYOUT_API_KEY'
                                                          : 'PAYOS_PAYOUT_CHECKSUM_KEY',
                                                )
                                                .join(' và ')}
                                            . Cần kích hoạt Kênh Chi payOS, liên
                                            kết nguồn tiền và cấu hình các khóa
                                            này trong Order Service.
                                        </p>
                                    ) : (
                                        <div className="space-y-1">
                                            <p>
                                                Kênh Chi payOS sẵn sàng. Số dư
                                                hiện tại:{' '}
                                                <strong>
                                                    {formatMoney(
                                                        payoutReadiness?.balance ??
                                                            '0',
                                                    )}
                                                </strong>
                                                .
                                            </p>
                                            <p>
                                                Nút bên dưới gửi lệnh chi trực
                                                tiếp đến tài khoản seller đã lưu
                                                trong yêu cầu rút.
                                            </p>
                                        </div>
                                    )}
                                    {payoutReadiness?.ready &&
                                        !hasEnoughPayoutBalance && (
                                            <p className="font-medium text-red-800">
                                                Số dư Kênh Chi thấp hơn số tiền
                                                yêu cầu. Hãy nạp nguồn chi trước
                                                khi chuyển.
                                            </p>
                                        )}
                                </div>
                            )}
                            {detail.status === 'PROCESSING' &&
                                isPayosWithdrawal && (
                                    <section className="space-y-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">
                                        <p className="font-semibold">
                                            Trạng thái payOS:{' '}
                                            {payoutStatus?.transactionState ??
                                                (isPayoutStatusError
                                                    ? 'Chưa kết nối được'
                                                    : 'Đang kiểm tra')}
                                        </p>
                                        <p>
                                            Hệ thống tự kiểm tra mỗi 5 giây. Nếu
                                            kết nối bị ngắt, bấm gửi lại an
                                            toàn; payOS dùng cùng mã chống trùng
                                            nên không tạo thêm khoản chi.
                                        </p>
                                    </section>
                                )}
                            <div className="space-y-2 pt-0.5">
                                {(detail.status === 'REQUESTED' ||
                                    (detail.status === 'PROCESSING' &&
                                        isPayosWithdrawal)) && (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Button
                                            type="button"
                                            className="h-10 rounded-xl shadow-sm"
                                            disabled={
                                                isWithdrawalPending ||
                                                isReadinessPending ||
                                                !payoutReadiness?.ready ||
                                                (detail.status ===
                                                    'REQUESTED' &&
                                                    !hasEnoughPayoutBalance)
                                            }
                                            onClick={onPayout}
                                        >
                                            <CircleDollarSign aria-hidden="true" />
                                            {detail.status === 'REQUESTED'
                                                ? 'Chuyển tiền cho seller'
                                                : 'Gửi lại an toàn'}
                                        </Button>
                                        {detail.status === 'REQUESTED' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-10 rounded-xl"
                                                disabled={isWithdrawalPending}
                                                onClick={onReject}
                                            >
                                                Từ chối
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : isError ? (
                        <p role="alert" className="text-sm text-red-700">
                            Không thể xem chi tiết payout. Tài khoản hiện tại có
                            thể chưa được cấp quyền payout.
                        </p>
                    ) : null}
                </div>
                <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-zinc-100 bg-zinc-50/80 px-5 py-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
