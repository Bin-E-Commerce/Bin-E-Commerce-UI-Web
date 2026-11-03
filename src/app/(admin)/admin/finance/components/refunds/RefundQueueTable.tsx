// Danh sách refund dạng bảng có phân trang; phần này chỉ hiển thị tóm tắt và mở chi tiết.
'use client';

import { AlertCircle, Landmark, RefreshCw, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { AdminFinanceRefund } from '@/services/admin/types/finance.types';
import type { RefundQueueTableProps } from '../../types/refunds/refund-queue.types';
import { FinanceTablePagination } from '../shared/FinanceTablePagination';

// Định dạng số tiền VND từ snapshot API mà không tự tính lại khoản phải hoàn.
function formatRefundAmount(value: string): string {
    return `${Number(value).toLocaleString('vi-VN')} đ`;
}

// Nêu loại hồ sơ, còn phương thức thanh toán được hiển thị riêng để không lặp nhãn Pay2S.
function refundSourceLabel(refund: AdminFinanceRefund): string {
    if (refund.sourceType === 'PAYMENT_ATTEMPT') return 'Hoàn thanh toán';
    if (refund.sourceType === 'ORDER_RETURN') return 'Khách trả hàng';
    return 'Khiếu nại chưa nhận hàng';
}

// Trình bày từng khoản hoàn thành hàng để admin quét nhanh rồi mở popup khi cần thao tác.
export function RefundQueueTable({
    refunds,
    total,
    page,
    pageSize,
    isLoading,
    isFetching,
    isError,
    onRefresh,
    onPageChange,
    onSelectRefund,
}: RefundQueueTableProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.04]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 bg-gradient-to-r from-white via-white to-zinc-50/80 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                        <RotateCcw className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-semibold tracking-tight text-zinc-950">
                            Hoàn tiền cần xử lý
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Chọn một đơn để xem thông tin nhận tiền và ghi nhận
                            kết quả chuyển khoản.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm">
                        {isError
                            ? 'Không tải được'
                            : isLoading
                              ? 'Đang tải…'
                              : `${total} khoản hoàn`}
                    </span>
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label="Làm mới danh sách hoàn tiền"
                        className="size-9 rounded-xl border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
                        onClick={onRefresh}
                        disabled={isFetching}
                    >
                        <RefreshCw
                            className={isFetching ? 'animate-spin' : undefined}
                            aria-hidden="true"
                        />
                    </Button>
                </div>
            </div>

            {isError ? (
                <p
                    role="alert"
                    className="px-5 py-10 text-center text-sm text-red-700"
                >
                    Không thể tải hàng đợi hoàn tiền. Hãy kiểm tra quyền tài
                    chính rồi thử lại.
                </p>
            ) : isLoading ? (
                <div
                    role="status"
                    aria-label="Đang tải hàng đợi hoàn tiền"
                    className="space-y-3 px-5 py-5"
                >
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-16 animate-pulse rounded-xl bg-zinc-100"
                        />
                    ))}
                </div>
            ) : refunds.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-12 text-center">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                        <Landmark className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-zinc-800">
                        Không có khoản hoàn nào đang chờ xử lý
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Các khoản hoàn mới sẽ xuất hiện trong danh sách này.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[960px] text-left text-sm">
                        <thead className="bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            <tr>
                                <th className="w-[30%] px-5 py-3.5">
                                    Đơn hàng
                                </th>
                                <th className="w-[18%] px-5 py-3.5">
                                    Khoản cần hoàn
                                </th>
                                <th className="w-[20%] px-5 py-3.5">
                                    Trạng thái
                                </th>
                                <th className="w-[19%] px-5 py-3.5">
                                    Ngày phát sinh
                                </th>
                                <th className="w-[150px] px-5 py-3.5 text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100/80">
                            {refunds.map((refund) => {
                                const isFailed =
                                    refund.status === 'REFUND_FAILED';
                                const createdAt = new Date(refund.createdAt);

                                return (
                                    <tr
                                        key={`${refund.sourceType}-${refund.id}`}
                                        className="group transition-colors hover:bg-zinc-50/70"
                                    >
                                        <td className="px-5 py-4 align-middle">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 transition-colors group-hover:bg-white">
                                                    {isFailed ? (
                                                        <AlertCircle
                                                            className="size-4 text-rose-600"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        <Landmark
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-zinc-950">
                                                        Đơn {refund.orderNumber}
                                                    </p>
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600">
                                                            {refundSourceLabel(
                                                                refund,
                                                            )}
                                                        </span>
                                                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold text-zinc-700">
                                                            {refund.paymentMethod ===
                                                            'PAY2S'
                                                                ? 'Pay2S'
                                                                : 'COD'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 truncate text-xs text-zinc-500">
                                                        {refund.providerTransactionId
                                                            ? `Mã giao dịch: ${refund.providerTransactionId}`
                                                            : refund.reason}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <p className="font-semibold tracking-tight text-zinc-950 tabular-nums">
                                                {formatRefundAmount(
                                                    refund.amount,
                                                )}
                                            </p>
                                            {refund.refundFailureNote ? (
                                                <p className="mt-1 text-xs text-rose-700">
                                                    Có lỗi chuyển khoản cần xem
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {refund.reason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <span
                                                className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${isFailed ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}
                                            >
                                                {isFailed
                                                    ? 'Chuyển lần trước thất bại'
                                                    : 'Chờ chuyển khoản'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 align-middle">
                                            <p className="font-medium text-zinc-700">
                                                {createdAt.toLocaleDateString(
                                                    'vi-VN',
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {createdAt.toLocaleTimeString(
                                                    'vi-VN',
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-right align-middle">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                aria-label={`Xem và xử lý hoàn tiền đơn ${refund.orderNumber}`}
                                                className="h-9 rounded-lg border-zinc-200 bg-white px-3 text-xs font-medium shadow-sm transition-colors hover:border-zinc-900 hover:bg-zinc-950 hover:text-white"
                                                onClick={() =>
                                                    onSelectRefund(refund)
                                                }
                                            >
                                                Xem / xử lý
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!isLoading && !isError && total > 0 ? (
                <FinanceTablePagination
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    isFetching={isFetching}
                    itemLabel="khoản hoàn"
                    onPageChange={onPageChange}
                />
            ) : null}
        </section>
    );
}
