// Khu vực chỉ đọc hiển thị các khoản thu/chi đã ghi sổ của nền tảng.
'use client';

import { ArrowDownLeft, ArrowUpRight, Landmark } from 'lucide-react';
import type { PlatformLedgerSectionProps } from '../../types/ledger/platform-ledger.types';
import { getLedgerLabel } from '../../utils/get-ledger-label';
import { formatMoney } from '../../utils/format-finance-money';
import { FinanceSectionHeader } from '../shared/FinanceSectionHeader';
import { FinanceTablePagination } from '../shared/FinanceTablePagination';
import { FinanceTableToolbar } from '../shared/FinanceTableToolbar';

// Trình bày lịch sử thu/chi để admin tra cứu; component không tạo hoặc sửa giao dịch.
export function PlatformLedgerSection({
    ledger,
    page,
    pageSize,
    total,
    isLoading,
    isFetching,
    isError,
    search,
    onSearchChange,
    onPageChange,
}: PlatformLedgerSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.04]">
            <FinanceSectionHeader
                icon={Landmark}
                title="Dòng tiền hệ thống"
                description="Lịch sử các khoản thu và chi đã được ghi nhận trên hệ thống. Khu vực này chỉ dùng để xem thông tin."
                countLabel={
                    isError
                        ? 'Không tải được dữ liệu'
                        : isLoading
                          ? 'Đang tải…'
                          : `${total} giao dịch`
                }
            />
            <FinanceTableToolbar
                searchValue={search}
                searchLabel="Tìm giao dịch dòng tiền"
                searchPlaceholder="Tìm theo loại giao dịch, mã tham chiếu, đơn hoặc shop"
                onSearchChange={onSearchChange}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/70 px-5 py-3.5 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-zinc-500">
                    Lịch sử thu / chi
                </p>
                <div className="flex items-center gap-4 text-xs text-zinc-600">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Thu vào (+)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-rose-500" />
                        Chi ra (−)
                    </span>
                </div>
            </div>
            {/* Tách tải/lỗi khỏi rỗng để không cho admin hiểu nhầm chưa có ledger khi trang đang đổi. */}
            {isError ? (
                <p
                    role="alert"
                    className="px-5 py-10 text-center text-sm text-red-700"
                >
                    Không tải được lịch sử dòng tiền. Vui lòng thử tải lại
                    trang.
                </p>
            ) : isLoading ? (
                <div
                    role="status"
                    aria-label="Đang tải giao dịch nền tảng"
                    className="space-y-3 px-5 py-5"
                >
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-14 animate-pulse rounded-xl bg-zinc-100"
                        />
                    ))}
                </div>
            ) : ledger.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-12 text-center">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                        <Landmark className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-zinc-800">
                        {search
                            ? 'Không tìm thấy giao dịch phù hợp'
                            : 'Chưa có giao dịch nào'}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {search
                            ? 'Thử thay đổi từ khóa tìm kiếm.'
                            : 'Giao dịch thu hoặc chi của hệ thống sẽ hiển thị tại đây.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            <tr>
                                <th className="w-[34%] px-5 py-3.5 sm:px-6">
                                    Giao dịch
                                </th>
                                <th className="w-[30%] px-5 py-3.5">
                                    Mã tham chiếu
                                </th>
                                <th className="w-[20%] px-5 py-3.5">
                                    Thời gian
                                </th>
                                <th className="w-[200px] px-5 py-3.5 text-right sm:px-6">
                                    Giá trị giao dịch
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100/80">
                            {ledger.map((entry) => {
                                // Số dương là tiền vào, số âm là tiền ra; màu và biểu tượng giúp phân biệt nhanh mà không cần thao tác.
                                const amount = Number(entry.amount);
                                const isIncome = amount > 0;
                                const isExpense = amount < 0;
                                return (
                                    <tr
                                        key={entry.id}
                                        className="transition-colors hover:bg-sky-50/40"
                                    >
                                        <td className="px-5 py-4 align-middle sm:px-6">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <span
                                                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ${isIncome ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : isExpense ? 'bg-rose-50 text-rose-700 ring-rose-100' : 'bg-zinc-100 text-zinc-600 ring-zinc-200'}`}
                                                >
                                                    {isIncome ? (
                                                        <ArrowDownLeft
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                    ) : isExpense ? (
                                                        <ArrowUpRight
                                                            className="size-4"
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
                                                    <p className="font-semibold text-zinc-900">
                                                        {getLedgerLabel(
                                                            entry.kind,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-zinc-500">
                                                        {entry.orderId
                                                            ? `Đơn ${entry.orderId.slice(0, 8).toUpperCase()}`
                                                            : entry.shopId
                                                              ? `Shop ${entry.shopId.slice(0, 8).toUpperCase()}`
                                                              : 'Nền tảng'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <span className="max-w-[340px] break-all font-mono text-xs leading-5 text-zinc-700">
                                                {entry.reference ?? (
                                                    <span className="font-sans text-zinc-400">
                                                        Chưa có mã tham chiếu
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 align-middle">
                                            <p className="font-medium text-zinc-700">
                                                {new Date(
                                                    entry.createdAt,
                                                ).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {new Date(
                                                    entry.createdAt,
                                                ).toLocaleTimeString('vi-VN')}
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right align-middle sm:px-6">
                                            <p
                                                className={`font-semibold tabular-nums ${isIncome ? 'text-emerald-700' : isExpense ? 'text-rose-700' : 'text-zinc-700'}`}
                                            >
                                                {amount > 0 ? '+' : ''}
                                                {formatMoney(entry.amount)}
                                            </p>
                                            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                                                {isIncome
                                                    ? 'Thu vào'
                                                    : isExpense
                                                      ? 'Chi ra'
                                                      : 'Không đổi'}
                                            </p>
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
                    itemLabel="giao dịch"
                    onPageChange={onPageChange}
                />
            ) : null}
        </section>
    );
}
