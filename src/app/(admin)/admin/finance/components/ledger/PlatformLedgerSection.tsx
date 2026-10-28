// Bảng sổ tiền cho phép chọn các dòng hợp lệ và gửi yêu cầu nhóm hoặc đối soát qua callback của trang.
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Landmark } from 'lucide-react';
import type { PlatformLedgerSectionProps } from '../../types/ledger/platform-ledger.types';
import { getLedgerLabel } from '../../utils/get-ledger-label';
import { formatMoney } from '../../utils/format-finance-money';
import { FinanceTablePagination } from '../shared/FinanceTablePagination';

// Hiển thị sổ ledger và ủy quyền chọn dòng, tạo nhóm, đối soát về trang sở hữu mutation.
export function PlatformLedgerSection({
    ledger,
    page,
    pageSize,
    total,
    isLoading,
    isFetching,
    isError,
    onPageChange,
    selectedLedgerIds,
    settlementBatchId,
    isBatchPending,
    isReconcilePending,
    onToggleLedgerSelection,
    onCreateBatch,
    onReconcileBatch,
}: PlatformLedgerSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.04]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 bg-gradient-to-r from-white via-white to-zinc-50/80 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                        <Landmark className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-semibold tracking-tight text-zinc-950">
                            Sổ tiền nền tảng
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Chỉ nhóm giao dịch tiền đã thu/chi để rà soát; khoản
                            phải thu chưa thu không được tính vào số dư tiền
                            mặt.
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm sm:inline-flex">
                        {isError
                            ? 'Không tải được'
                            : isLoading
                              ? 'Đang tải…'
                              : `${total} giao dịch`}
                    </span>
                    {settlementBatchId && (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-lg border-zinc-200 px-3 text-xs font-medium shadow-sm"
                            disabled={isReconcilePending}
                            onClick={() => onReconcileBatch(settlementBatchId)}
                        >
                            Đối soát đợt vừa tạo
                        </Button>
                    )}
                    <Button
                        type="button"
                        className="h-9 rounded-lg px-3 text-xs font-medium shadow-sm"
                        disabled={!selectedLedgerIds.length || isBatchPending}
                        onClick={() => onCreateBatch()}
                    >
                        Tạo đợt ({selectedLedgerIds.length})
                    </Button>
                </div>
            </div>
            {/* Tách tải/lỗi khỏi rỗng để không cho admin hiểu nhầm chưa có ledger khi trang đang đổi. */}
            {isError ? (
                <p
                    role="alert"
                    className="px-5 py-10 text-center text-sm text-red-700"
                >
                    Không tải được sổ tiền. Hãy bấm Làm mới để thử lại.
                </p>
            ) : isLoading ? (
                <div
                    role="status"
                    aria-label="Đang tải sổ tiền nền tảng"
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
                        Chưa phát sinh dòng tiền
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Các khoản thu và chi nền tảng sẽ hiển thị tại đây.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1040px] text-left text-sm">
                        <thead className="bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            <tr>
                                <th className="w-16 px-5 py-3.5">Chọn</th>
                                <th className="w-[28%] px-5 py-3.5">
                                    Giao dịch
                                </th>
                                <th className="w-[27%] px-5 py-3.5">
                                    Tham chiếu
                                </th>
                                <th className="w-[20%] px-5 py-3.5">
                                    Thời gian
                                </th>
                                <th className="w-[180px] px-5 py-3.5 text-right">
                                    Số tiền
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100/80">
                            {ledger.map((entry) => (
                                <tr
                                    key={entry.id}
                                    className="group transition-colors hover:bg-zinc-50/70"
                                >
                                    <td className="px-5 py-4 align-middle">
                                        <Checkbox
                                            aria-label={`Chọn ${getLedgerLabel(entry.kind)} để đối soát`}
                                            checked={selectedLedgerIds.includes(
                                                entry.id,
                                            )}
                                            disabled={
                                                Boolean(
                                                    entry.settlementBatchId,
                                                ) ||
                                                entry.kind ===
                                                    'CUSTOMER_RETURN_SHIPPING_RECEIVABLE' ||
                                                entry.kind.startsWith(
                                                    'SHIPPING_FUND_',
                                                )
                                            }
                                            onCheckedChange={(checked) =>
                                                onToggleLedgerSelection(
                                                    entry,
                                                    checked,
                                                )
                                            }
                                        />
                                    </td>
                                    <td className="px-5 py-4 align-middle">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 transition-colors group-hover:bg-white">
                                                <Landmark
                                                    className="size-3.5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-zinc-900">
                                                    {getLedgerLabel(entry.kind)}
                                                    {entry.kind ===
                                                        'CUSTOMER_RETURN_SHIPPING_RECEIVABLE' && (
                                                        <span className="ml-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                                            Chưa thu
                                                        </span>
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
                                        <div className="flex min-w-0 flex-col items-start gap-1.5">
                                            <span className="max-w-[340px] break-all font-mono text-xs leading-5 text-zinc-700">
                                                {entry.reference ?? '—'}
                                            </span>
                                            {entry.settlementBatchId ? (
                                                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
                                                    Đã nhóm
                                                </span>
                                            ) : null}
                                        </div>
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
                                    <td
                                        className={`whitespace-nowrap px-5 py-4 text-right align-middle font-semibold tabular-nums ${Number(entry.amount) < 0 ? 'text-rose-700' : 'text-zinc-950'}`}
                                    >
                                        {Number(entry.amount) > 0 ? '+' : ''}
                                        {formatMoney(entry.amount)}
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
                    itemLabel="giao dịch"
                    onPageChange={onPageChange}
                />
            ) : null}
        </section>
    );
}
