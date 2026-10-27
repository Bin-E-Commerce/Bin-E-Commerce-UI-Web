// Bảng sổ tiền cho phép chọn các dòng hợp lệ và gửi yêu cầu nhóm hoặc đối soát qua callback của trang.
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { PlatformLedgerSectionProps } from '../../types/admin-finance-page.types';
import { getLedgerLabel } from '../../utils/get-ledger-label';
import { formatMoney } from '../../utils/format-finance-money';

// Hiển thị sổ ledger và ủy quyền chọn dòng, tạo nhóm, đối soát về trang sở hữu mutation.
export function PlatformLedgerSection({
    ledger,
    selectedLedgerIds,
    settlementBatchId,
    isBatchPending,
    isReconcilePending,
    onToggleLedgerSelection,
    onCreateBatch,
    onReconcileBatch,
}: PlatformLedgerSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                <div>
                    <h2 className="font-semibold text-zinc-950">
                        Sổ tiền nền tảng
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                        Chỉ nhóm giao dịch tiền đã thu/chi để rà soát; khoản
                        phải thu chưa thu không được tính vào số dư tiền mặt.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {settlementBatchId && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isReconcilePending}
                            onClick={() => onReconcileBatch(settlementBatchId)}
                        >
                            Đối soát đợt vừa tạo
                        </Button>
                    )}
                    <Button
                        type="button"
                        disabled={!selectedLedgerIds.length || isBatchPending}
                        onClick={() => onCreateBatch()}
                    >
                        Tạo đợt ({selectedLedgerIds.length})
                    </Button>
                </div>
            </div>
            {ledger.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-zinc-500">
                    Chưa phát sinh dòng tiền trong sổ mô phỏng.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                            <tr>
                                <th className="px-5 py-3">Nhóm</th>
                                <th className="px-5 py-3">Giao dịch</th>
                                <th className="px-5 py-3">Tham chiếu</th>
                                <th className="px-5 py-3">Thời gian</th>
                                <th className="px-5 py-3 text-right">
                                    Số tiền
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {ledger.map((entry) => (
                                <tr key={entry.id}>
                                    <td className="px-5 py-4">
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
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-zinc-900">
                                            {getLedgerLabel(entry.kind)}
                                            {entry.kind ===
                                                'CUSTOMER_RETURN_SHIPPING_RECEIVABLE' && (
                                                <span className="ml-2 text-xs font-medium text-amber-700">
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
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-zinc-500">
                                        {entry.reference ?? '—'}
                                        {entry.settlementBatchId ? (
                                            <span className="ml-2 text-emerald-700">
                                                Đã nhóm
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-5 py-4 text-zinc-500">
                                        {new Date(
                                            entry.createdAt,
                                        ).toLocaleString('vi-VN')}
                                    </td>
                                    <td
                                        className={`px-5 py-4 text-right font-semibold tabular-nums ${Number(entry.amount) < 0 ? 'text-rose-700' : 'text-zinc-950'}`}
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
        </section>
    );
}
