// Các thẻ chỉ số dòng tiền của dashboard admin, hiển thị snapshot đã được API phân quyền trả về.
'use client';

import {
    Banknote,
    CircleDollarSign,
    Landmark,
    Truck,
    WalletCards,
} from 'lucide-react';
import type { FinanceMetricsProps } from '../../types/admin-finance-page.types';
import { formatMoney } from '../../utils/format-finance-money';

// Hiển thị sáu chỉ số dòng tiền từ snapshot và giữ quy tắc định dạng số tiền thống nhất.
export function FinanceMetrics({ overview }: FinanceMetricsProps) {
    return (
        <section
            className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
            aria-label="Tổng quan dòng tiền"
        >
            {[
                {
                    label: 'Số dư nền tảng mô phỏng',
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
                    label: 'Đang giữ cho yêu cầu rút',
                    value: overview.reservedWithdrawalBalance,
                    icon: Banknote,
                },
                {
                    label: 'Quỹ vận chuyển đang giữ',
                    value: overview.shippingFundBalance ?? '0',
                    icon: Truck,
                    description:
                        'Tạm tính theo phí thu khách, cần đối chiếu GHN.',
                },
                {
                    label: 'Phí hoàn khách còn phải trả',
                    value: overview.customerReturnShippingReceivable,
                    icon: CircleDollarSign,
                },
                {
                    label: 'Tổng nạp Pay2S Sandbox',
                    value: overview.sandboxDepositTotal,
                    icon: CircleDollarSign,
                },
            ].map((metric) => (
                <article
                    key={metric.label}
                    className={`group relative min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${'highlight' in metric ? 'border-zinc-900 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white' : 'border-zinc-200 bg-white text-zinc-950'}`}
                >
                    <div className="flex min-h-9 items-center gap-2.5">
                        <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${'highlight' in metric ? 'bg-white/10 text-white' : 'bg-zinc-950 text-white'}`}
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
                        className={`mt-3 text-xl font-semibold tracking-tight tabular-nums ${'highlight' in metric ? 'text-white' : 'text-zinc-950'}`}
                    >
                        {formatMoney(metric.value)}
                    </p>
                    {'description' in metric ? (
                        <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                            {metric.description}
                        </p>
                    ) : null}
                </article>
            ))}
        </section>
    );
}
