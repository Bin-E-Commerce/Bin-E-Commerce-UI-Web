// Trình bày KPI tổng hợp và số lượng từng loại hành vi trong khoảng thời gian đang chọn.

import {
    Activity,
    Eye,
    MousePointerClick,
    PackageCheck,
    Radio,
    RotateCcw,
    Search,
    ShoppingCart,
    Trash2,
    UsersRound,
} from 'lucide-react';

import type { RecommendationAdminOverview as Overview } from '@/services/admin';

import { formatPercent } from '../overview.utils';

interface Props {
    overview: Overview | null;
}

// Hiển thị KPI chính cùng event breakdown; các số thiếu được xem là 0 để dashboard không bị khuyết ô.
export function OverviewMetrics({ overview }: Props) {
    const totals = overview?.totals;
    const eventBreakdown = totals?.eventBreakdown ?? {
        productViews: 0,
        impressions: totals?.impressions ?? 0,
        clicks: totals?.clicks ?? 0,
        searches: 0,
        cartAdds: totals?.cartAdds ?? 0,
        cartRemovals: 0,
        purchaseCompleted: 0,
        purchaseReturned: 0,
    };
    const summaryCards = [
        {
            label: 'Tổng tín hiệu',
            description: 'Tất cả event trong khoảng đã chọn',
            value: (
                totals?.totalInteractions ??
                totals?.events ??
                0
            ).toLocaleString('vi-VN'),
            icon: Activity,
        },
        {
            label: 'CTR recommendation',
            description: 'Tỷ lệ click trên impression có attribution',
            value: formatPercent(totals?.clickThroughRate ?? 0),
            icon: MousePointerClick,
        },
        {
            label: 'Click → giỏ',
            description: 'Tỷ lệ click recommendation dẫn đến thêm giỏ',
            value: formatPercent(totals?.clickToCartRate ?? 0),
            icon: ShoppingCart,
        },
        {
            label: 'Actor duy nhất',
            description: 'User hoặc guest session có event gợi ý',
            value: (totals?.uniqueActors ?? 0).toLocaleString('vi-VN'),
            icon: UsersRound,
        },
    ];
    const behaviorMetrics = [
        {
            label: 'Xem sản phẩm',
            value: eventBreakdown.productViews,
            icon: Eye,
        },
        { label: 'Impression', value: eventBreakdown.impressions, icon: Radio },
        {
            label: 'Click',
            value: eventBreakdown.clicks,
            icon: MousePointerClick,
        },
        { label: 'Tìm kiếm', value: eventBreakdown.searches, icon: Search },
        {
            label: 'Thêm vào giỏ',
            value: eventBreakdown.cartAdds,
            icon: ShoppingCart,
        },
        {
            label: 'Xóa khỏi giỏ',
            value: eventBreakdown.cartRemovals,
            icon: Trash2,
        },
        {
            label: 'Mua thành công',
            value: eventBreakdown.purchaseCompleted,
            icon: PackageCheck,
        },
        {
            label: 'Trả hàng',
            value: eventBreakdown.purchaseReturned,
            icon: RotateCcw,
        },
    ];

    return (
        <>
            <section className="space-y-3">
                <div>
                    <h2 className="text-base font-semibold text-zinc-950">
                        Tổng quan
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Các chỉ số chính trong khoảng thời gian đang chọn.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map(
                        ({ label, description, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3 text-zinc-500">
                                    <div>
                                        <span className="text-sm">{label}</span>
                                        <p className="mt-1 text-xs leading-4 text-zinc-400">
                                            {description}
                                        </p>
                                    </div>
                                    <Icon className="mt-0.5 size-4 shrink-0" />
                                </div>
                                <p className="mt-4 text-2xl font-semibold text-zinc-950">
                                    {value}
                                </p>
                            </div>
                        ),
                    )}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-base font-semibold text-zinc-950">
                            Hành vi theo loại
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Tất cả tín hiệu người dùng phát sinh trong khoảng
                            thời gian đã chọn.
                        </p>
                    </div>
                    <span className="text-xs text-zinc-400">
                        8 loại hành vi
                    </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {behaviorMetrics.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                                    <Icon
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                <span className="truncate text-sm font-medium text-zinc-700">
                                    {label}
                                </span>
                            </div>
                            <span className="shrink-0 text-lg font-semibold text-zinc-950">
                                {value.toLocaleString('vi-VN')}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
