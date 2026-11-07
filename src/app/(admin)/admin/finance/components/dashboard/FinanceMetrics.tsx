// Các thẻ chỉ số dòng tiền của dashboard admin, hiển thị snapshot đã được API phân quyền trả về.
'use client';

import {
    Banknote,
    BadgeAlert,
    CircleDollarSign,
    Landmark,
    Truck,
    WalletCards,
} from 'lucide-react';
import type { FinanceMetricsProps } from '../../types/dashboard/finance-dashboard.types';
import { formatMoney } from '../../utils/format-finance-money';

// Hiển thị chỉ số dòng tiền và công nợ seller từ snapshot, dùng kiểu cảnh báo riêng cho khoản phải thu.
export function FinanceMetrics({ overview }: FinanceMetricsProps) {
    return (
        <section
            className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7"
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
                    label: 'Khoản phải trả seller',
                    value: overview.sellerPayableBalance,
                    icon: WalletCards,
                },
                {
                    label: 'Công nợ seller',
                    value: overview.sellerDebtBalance ?? '0',
                    icon: BadgeAlert,
                    danger: true,
                    caption: `${overview.sellerDebtShopCount ?? 0} shop nợ · ${formatMoney(overview.overdueSellerDebtBalance ?? '0')} quá hạn · ${overview.overdueSellerDebtShopCount ?? 0} shop · ${overview.sellerDebtLockedShopCount ?? 0} đang khóa`,
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
                    className={`group relative isolate min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${'highlight' in metric ? 'border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 text-white' : 'danger' in metric ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white text-rose-950' : 'border-zinc-200 bg-white text-zinc-950'}`}
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
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${'highlight' in metric ? 'border border-white/10 bg-white/10 text-white' : 'danger' in metric ? 'bg-rose-600 text-white' : 'bg-zinc-950 text-white'}`}
                        >
                            <metric.icon
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        </span>
                        <span
                            className={`text-xs font-medium leading-4 ${'highlight' in metric ? 'text-zinc-200' : 'danger' in metric ? 'text-rose-800' : 'text-zinc-600'}`}
                        >
                            {metric.label}
                        </span>
                    </div>
                    <p
                        className={`relative z-10 mt-3 text-xl font-semibold tracking-tight tabular-nums ${'highlight' in metric ? 'text-white' : 'danger' in metric ? 'text-rose-700' : 'text-zinc-950'}`}
                    >
                        {formatMoney(metric.value)}
                    </p>
                    {'caption' in metric ? (
                        <p className="relative z-10 mt-1 text-[10px] leading-4 text-rose-700/80">
                            {metric.caption}
                        </p>
                    ) : null}
                </article>
            ))}
        </section>
    );
}
