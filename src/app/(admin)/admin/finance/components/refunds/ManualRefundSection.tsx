// Biểu mẫu xác nhận refund Pay2S giữ nguyên các trường bằng chứng và chỉ bật xác nhận khi trang xác nhận dữ liệu đã đủ.
'use client';

import { CircleDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ManualRefundSectionProps } from '../../types/admin-finance-page.types';

// Thu thập đầy đủ mã hồ sơ, số tiền và bằng chứng trước khi gọi callback xác nhận refund.
export function ManualRefundSection({
    refundCaseType,
    setRefundCaseType,
    refundTargetId,
    setRefundTargetId,
    refundAmount,
    setRefundAmount,
    refundReference,
    setRefundReference,
    refundProofAssetId,
    setRefundProofAssetId,
    refundProofUrl,
    setRefundProofUrl,
    canSubmitRefund,
    isRefundError,
    isRefundPending,
    onSubmitRefund,
}: ManualRefundSectionProps) {
    return (
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm xl:col-span-2">
            <header className="flex items-start gap-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-5 py-5 md:px-7">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                    <CircleDollarSign className="size-5" aria-hidden="true" />
                </span>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                        Xác nhận hoàn tiền thủ công Pay2S
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-5 text-zinc-500">
                        Dùng mã hồ sơ hoàn cho return thông thường hoặc mã đơn
                        hàng cho giao dịch Pay2S đến muộn.
                    </p>
                </div>
            </header>
            <div className="p-5 md:p-7">
                <div className="grid gap-x-5 gap-y-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium text-zinc-800">
                            Loại hồ sơ hoàn
                        </Label>
                        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-zinc-100 p-1">
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    refundCaseType === 'RETURN'
                                        ? 'default'
                                        : 'outline'
                                }
                                className="rounded-lg"
                                onClick={() => setRefundCaseType('RETURN')}
                            >
                                Return thông thường
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    refundCaseType === 'LATE_PAYMENT'
                                        ? 'default'
                                        : 'outline'
                                }
                                className="rounded-lg"
                                onClick={() =>
                                    setRefundCaseType('LATE_PAYMENT')
                                }
                            >
                                Pay2S đến muộn
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="finance-refund-target-id"
                            className="text-sm font-medium text-zinc-800"
                        >
                            {refundCaseType === 'RETURN'
                                ? 'Return request ID'
                                : 'Order ID'}
                        </Label>
                        <Input
                            id="finance-refund-target-id"
                            className="h-11 rounded-xl bg-zinc-50/70 px-3.5 focus-visible:bg-white"
                            value={refundTargetId}
                            onChange={(event) =>
                                setRefundTargetId(event.target.value)
                            }
                            placeholder="Nhập UUID hồ sơ cần hoàn"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="finance-refund-amount"
                            className="text-sm font-medium text-zinc-800"
                        >
                            Số tiền hoàn (₫)
                        </Label>
                        <Input
                            id="finance-refund-amount"
                            className="h-11 rounded-xl bg-zinc-50/70 px-3.5 focus-visible:bg-white"
                            inputMode="numeric"
                            value={refundAmount}
                            onChange={(event) =>
                                setRefundAmount(event.target.value)
                            }
                            placeholder="Ví dụ: 120000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="finance-refund-reference"
                            className="text-sm font-medium text-zinc-800"
                        >
                            Mã giao dịch chuyển khoản
                        </Label>
                        <Input
                            id="finance-refund-reference"
                            className="h-11 rounded-xl bg-zinc-50/70 px-3.5 focus-visible:bg-white"
                            value={refundReference}
                            onChange={(event) =>
                                setRefundReference(event.target.value)
                            }
                            placeholder="Mã giao dịch ngân hàng"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="finance-refund-proof-asset"
                            className="text-sm font-medium text-zinc-800"
                        >
                            Proof asset ID
                        </Label>
                        <Input
                            id="finance-refund-proof-asset"
                            className="h-11 rounded-xl bg-zinc-50/70 px-3.5 focus-visible:bg-white"
                            value={refundProofAssetId}
                            onChange={(event) =>
                                setRefundProofAssetId(event.target.value)
                            }
                            placeholder="ID file bằng chứng"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label
                            htmlFor="finance-refund-proof-url"
                            className="text-sm font-medium text-zinc-800"
                        >
                            URL bằng chứng
                        </Label>
                        <Input
                            id="finance-refund-proof-url"
                            className="h-11 rounded-xl bg-zinc-50/70 px-3.5 focus-visible:bg-white"
                            type="url"
                            value={refundProofUrl}
                            onChange={(event) =>
                                setRefundProofUrl(event.target.value)
                            }
                            placeholder="https://..."
                        />
                    </div>
                </div>
                <footer className="mt-6 flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div aria-live="polite">
                        {isRefundError ? (
                            <p role="alert" className="text-sm text-red-700">
                                Không thể ghi nhận refund. Kiểm tra ID, số tiền
                                và trạng thái hồ sơ rồi thử lại.
                            </p>
                        ) : (
                            <p className="text-xs text-zinc-500">
                                Điền đủ thông tin và bằng chứng chuyển khoản để
                                xác nhận.
                            </p>
                        )}
                    </div>
                    <Button
                        type="button"
                        size="lg"
                        className="w-full rounded-xl px-6 sm:w-auto sm:min-w-48"
                        disabled={!canSubmitRefund}
                        onClick={onSubmitRefund}
                    >
                        {isRefundPending
                            ? 'Đang ghi nhận...'
                            : 'Xác nhận đã hoàn'}
                    </Button>
                </footer>
            </div>
        </article>
    );
}
