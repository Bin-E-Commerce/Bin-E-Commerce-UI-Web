// Các thẻ chỉ số dòng tiền của dashboard admin, hiển thị snapshot đã được API phân quyền trả về.
'use client';

import {
    Banknote,
    CircleDollarSign,
    Clock3,
    Landmark,
    Truck,
    WalletCards,
} from 'lucide-react';
import type { FinanceMetricsProps } from '../../types/dashboard/finance-dashboard.types';
import { formatMoney } from '../../utils/format-finance-money';

// Hiển thị snapshot tài chính; tổng hoàn đang chờ tách riêng khỏi khoản seller đã chốt.
export function FinanceMetrics({ overview }: FinanceMetricsProps) {
    return (
        <section
            className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
            aria-label="Tổng quan dòng tiền"
        >
            {[
                {
                    label: 'Số dư nền tảng',
                    value: overview.platformBalance,
                    icon: Landmark,
                    highlight: true,
                },
                {
                    label: 'Phải trả seller (đã chốt)',
                    value: overview.sellerPayableBalance,
                    icon: WalletCards,
                    pendingRefundValue: overview.pendingRefundBalance,
                },
                {
                    label: 'Đang giữ cho yêu cầu rút',
                    value: overview.reservedWithdrawalBalance,
                    icon: Banknote,
                },
                {
                    label: 'Quỹ vận chuyển đang giữ',
                    value: overview.shippingFundBalance ?? '0',
                    icon: Truck,
                },
                {
                    label: 'Phí hoàn khách còn phải trả',
                    value: overview.customerReturnShippingReceivable,
                    icon: CircleDollarSign,
                },
                {
                    label: 'Tổng nạp ví seller',
                    value: overview.depositTotal,
                    icon: CircleDollarSign,
                },
            ].map((metric) => (
                <article
                    key={metric.label}
                    className={`group relative isolate min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${'highlight' in metric ? 'border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 text-white' : 'border-zinc-200 bg-white text-zinc-950'}`}
                >
                    {'highlight' in metric ? (
                        <>
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full border border-white/20"
                            />
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-1 top-4 size-20 rounded-full bg-white/10 blur-2xl"
                            />
                        </>
                    ) : null}
                    <div className="relative z-10 flex min-h-9 items-center gap-2.5">
                        <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${'highlight' in metric ? 'border border-white/10 bg-white/10 text-white' : 'bg-zinc-950 text-white'}`}
                        >
                            <metric.icon
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        </span>
                        <span
                            className={`text-xs font-medium leading-4 ${'highlight' in metric ? 'text-zinc-200' : 'text-zinc-600'}`}
                        >
                            {metric.label}
                        </span>
                    </div>
                    <p
                        className={`relative z-10 mt-3 text-xl font-semibold tracking-tight tabular-nums ${'highlight' in metric ? 'text-white' : 'text-zinc-950'}`}
                    >
                        {formatMoney(metric.value)}
                    </p>
                    {/* Hiện tiền hoàn trong chính card seller nhưng tách khỏi số phải trả để tránh hiểu nhầm hai khoản là một. */}
                    {'pendingRefundValue' in metric ? (
                        <div className="relative z-10 mt-3 border-t border-zinc-100 pt-2.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium leading-4 text-amber-700">
                                    <Clock3
                                        className="size-3.5 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <span>Hoàn tiền đang xử lý</span>
                                </span>
                                <span className="shrink-0 text-xs font-semibold tabular-nums text-amber-800">
                                    {formatMoney(metric.pendingRefundValue)}
                                </span>
                            </div>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                                Chưa tính vào khoản phải trả seller.
                            </p>
                        </div>
                    ) : null}
                </article>
            ))}
        </section>
    );
}
