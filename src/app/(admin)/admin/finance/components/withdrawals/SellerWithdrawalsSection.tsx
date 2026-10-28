// Bảng yêu cầu rút tiền chỉ hiển thị thông tin tài khoản đã che và mở chi tiết theo lựa chọn của admin.
'use client';

import { Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SellerWithdrawalsSectionProps } from '../../types/payouts/seller-withdrawals.types';
import { formatMoney } from '../../utils/format-finance-money';
import { FinanceTablePagination } from '../shared/FinanceTablePagination';

// Danh sách rút tiền giữ thông tin tóm tắt, tô xanh giao dịch đã chuyển và phát id để tải chi tiết nhạy cảm.
export function SellerWithdrawalsSection({
    withdrawals,
    pendingWithdrawals,
    page,
    pageSize,
    total,
    isLoading,
    isFetching,
    isError,
    onPageChange,
    onSelectWithdrawal,
}: SellerWithdrawalsSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.04]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 bg-gradient-to-r from-white via-white to-zinc-50/80 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                        <Landmark className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-semibold tracking-tight text-zinc-950">
                            Yêu cầu rút tiền seller
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                            {pendingWithdrawals} yêu cầu đang chờ hoặc xử lý;
                            tiền đã giữ chỗ trong ví seller.
                        </p>
                    </div>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm">
                    {isError
                        ? 'Không tải được'
                        : isLoading
                          ? 'Đang tải…'
                          : `${total} yêu cầu`}
                </span>
            </div>
            {/* Giữ riêng trạng thái tải/lỗi để không hiển thị nhầm danh sách trống khi API phân trang chưa trả về. */}
            {isError ? (
                <p
                    role="alert"
                    className="px-5 py-10 text-center text-sm text-red-700"
                >
                    Không tải được yêu cầu rút tiền. Hãy bấm Làm mới để thử lại.
                </p>
            ) : isLoading ? (
                <div
                    role="status"
                    aria-label="Đang tải yêu cầu rút tiền"
                    className="space-y-3 px-5 py-5"
                >
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-14 animate-pulse rounded-xl bg-zinc-100"
                        />
                    ))}
                </div>
            ) : withdrawals.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-12 text-center">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                        <Landmark className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-zinc-800">
                        Chưa có yêu cầu rút tiền
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Các yêu cầu mới của seller sẽ xuất hiện tại đây.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            <tr>
                                <th className="w-[15%] px-5 py-3.5">Số tiền</th>
                                <th className="w-[29%] px-5 py-3.5">
                                    Tài khoản nhận
                                </th>
                                <th className="w-[24%] px-5 py-3.5">
                                    Trạng thái
                                </th>
                                <th className="w-[20%] px-5 py-3.5">
                                    Ngày gửi
                                </th>
                                <th className="w-[160px] px-5 py-3.5 text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100/80">
                            {withdrawals.map((withdrawal) => (
                                <tr
                                    key={withdrawal.id}
                                    className="group transition-colors hover:bg-zinc-50/70"
                                >
                                    <td className="px-5 py-4 align-middle">
                                        <p className="font-semibold tracking-tight text-zinc-950 tabular-nums">
                                            {formatMoney(withdrawal.amount)}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 align-middle">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 transition-colors group-hover:bg-white">
                                                <Landmark
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-zinc-900">
                                                    {withdrawal.bankName}
                                                </p>
                                                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2">
                                                    <span className="truncate text-xs font-medium text-zinc-700">
                                                        {
                                                            withdrawal.accountHolder
                                                        }
                                                    </span>
                                                    <span className="inline-flex shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-zinc-500">
                                                        {
                                                            withdrawal.accountNumberMasked
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 align-middle">
                                        <span
                                            className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${
                                                withdrawal.status ===
                                                'REQUESTED'
                                                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                                                    : withdrawal.status ===
                                                        'PROCESSING'
                                                      ? 'border-zinc-300 bg-zinc-100 text-zinc-800'
                                                      : withdrawal.status ===
                                                          'PAID'
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : withdrawal.status ===
                                                                'REJECTED' ||
                                                            withdrawal.status ===
                                                                'FAILED'
                                                          ? 'border-red-200 bg-red-50 text-red-700'
                                                          : 'border-zinc-200 bg-white text-zinc-700'
                                            }`}
                                        >
                                            {/* Chỉ dịch nhãn trình bày; giữ nguyên mã trạng thái API để không ảnh hưởng xử lý. */}
                                            {withdrawal.status === 'REQUESTED'
                                                ? 'Chờ xử lý'
                                                : withdrawal.status ===
                                                    'PROCESSING'
                                                  ? 'Chờ chuyển khoản / đối soát'
                                                  : withdrawal.status === 'PAID'
                                                    ? 'Đã chuyển tiền'
                                                    : withdrawal.status ===
                                                        'REJECTED'
                                                      ? 'Đã từ chối'
                                                      : withdrawal.status ===
                                                          'FAILED'
                                                        ? 'Thất bại'
                                                        : withdrawal.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 align-middle">
                                        <p className="font-medium text-zinc-700">
                                            {new Date(
                                                withdrawal.createdAt,
                                            ).toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {new Date(
                                                withdrawal.createdAt,
                                            ).toLocaleTimeString('vi-VN')}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-right align-middle">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-9 rounded-lg border-zinc-200 bg-white px-3 text-xs font-medium shadow-sm transition-colors hover:border-zinc-900 hover:bg-zinc-950 hover:text-white"
                                            onClick={() =>
                                                onSelectWithdrawal(
                                                    withdrawal.id,
                                                )
                                            }
                                        >
                                            Xem / xử lý
                                        </Button>
                                    </td>
                                </tr>
                            ))}
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
                    itemLabel="yêu cầu rút tiền"
                    onPageChange={onPageChange}
                />
            ) : null}
        </section>
    );
}
