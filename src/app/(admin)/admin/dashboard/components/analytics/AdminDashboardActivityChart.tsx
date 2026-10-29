// Area chart theo dõi hoạt động vận hành thật từ Seller, Auth và Order Service.
'use client';

import type { ReactNode } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import type {
    AdminDashboardActivityChartProps,
    AdminDashboardActivityMetric,
} from '../../types/analytics/admin-dashboard-activity-chart.types';

// Mỗi workflow có một sắc trầm riêng để phân biệt rõ mà vẫn hài hòa với giao diện đen/trắng.
const ACTIVITY_SERIES: Array<{
    dataKey: AdminDashboardActivityMetric;
    label: string;
    color: string;
}> = [
    {
        dataKey: 'sellerApplications',
        label: 'Hồ sơ yêu cầu',
        color: '#18181b',
    },
    { dataKey: 'newUsers', label: 'User mới', color: '#6b4e71' },
    { dataKey: 'walletDeposits', label: 'Nạp ví seller', color: '#9a6b3d' },
    {
        dataKey: 'withdrawalRequests',
        label: 'Yêu cầu rút tiền',
        color: '#a04f5a',
    },
];

// Nới trần theo đỉnh dữ liệu để đường cong tự nhiên có khoảng thở và không bị cắt sát mép chart.
function getActivityYAxisMax(dataMax: number): number {
    return Math.max(1, Math.ceil(dataMax * 1.18));
}

// Chuẩn hóa nhãn ngày do Recharts truyền dạng ReactNode; nhãn lạ được giữ nguyên để tooltip không lỗi.
function formatActivityDateLabel(label: ReactNode): string {
    const day = typeof label === 'string' ? label : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        return String(label ?? '');
    }

    return `Ngày ${day.slice(8, 10)}/${day.slice(5, 7)}/${day.slice(0, 4)}`;
}

// Hiển thị riêng các chuỗi đã được cấp quyền và giữ dữ liệu từng service tách biệt khi một nguồn lỗi.
export function AdminDashboardActivityChart({
    overview,
    state,
    hasPartialError,
}: AdminDashboardActivityChartProps) {
    const daily = overview?.daily ?? [];
    const series = ACTIVITY_SERIES.filter((item) =>
        overview?.availableSeries.includes(item.dataKey),
    );
    // Biểu đồ có dữ liệu nếu ít nhất một nghiệp vụ được phép xem đã phát sinh trong kỳ.
    const hasActivity = daily.some((item) =>
        series.some((itemSeries) => item[itemSeries.dataKey] > 0),
    );

    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3.5 sm:px-6">
                <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-zinc-950">
                        Hoạt động vận hành
                    </h2>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        {series.length} chỉ số nghiệp vụ theo ngày
                    </p>
                </div>
                <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-600">
                    30 ngày gần nhất
                </span>
            </header>

            {state === 'loading' ? (
                <div
                    aria-label="Đang tải hoạt động vận hành"
                    className="m-5 h-[320px] animate-pulse rounded-xl bg-zinc-50 sm:h-[380px] lg:h-[420px]"
                />
            ) : state === 'error' ? (
                <p role="alert" className="px-6 py-10 text-sm text-red-700">
                    Không tải được dữ liệu hoạt động vận hành.
                </p>
            ) : !overview || daily.length === 0 || !hasActivity ? (
                <p className="px-6 py-10 text-center text-sm text-zinc-500">
                    Chưa có hồ sơ, user hoặc giao dịch ví mới trong 30 ngày gần
                    nhất.
                </p>
            ) : (
                <div className="px-3 pb-4 pt-3 sm:px-5">
                    <ChartContainer className="h-[320px] w-full sm:h-[380px] lg:h-[420px]">
                        <AreaChart
                            data={daily}
                            margin={{
                                top: 20,
                                right: 12,
                                left: -16,
                                bottom: 4,
                            }}
                        >
                            <defs>
                                {/* Tô cùng màu với đường, đậm ở đỉnh và nhạt dần về đáy để vẫn đọc được lưới. */}
                                {series.map((itemSeries) => (
                                    <linearGradient
                                        key={itemSeries.dataKey}
                                        id={`dashboard-${itemSeries.dataKey}-gradient`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={itemSeries.color}
                                            stopOpacity={0.55}
                                        />
                                        <stop
                                            offset="52%"
                                            stopColor={itemSeries.color}
                                            stopOpacity={0.25}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={itemSeries.color}
                                            stopOpacity={0.05}
                                        />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                stroke="#e4e4e7"
                                strokeDasharray="3 3"
                            />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                minTickGap={24}
                                tick={{ fill: '#71717a', fontSize: 11 }}
                                tickFormatter={(day: string) =>
                                    `${day.slice(8, 10)}/${day.slice(5, 7)}`
                                }
                            />
                            <YAxis
                                width={48}
                                allowDecimals={false}
                                domain={[0, getActivityYAxisMax]}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                tickFormatter={(value: number) =>
                                    value.toLocaleString('vi-VN')
                                }
                            />
                            <Tooltip
                                cursor={{ stroke: '#d4d4d8' }}
                                contentStyle={{
                                    borderRadius: 12,
                                    borderColor: '#e4e4e7',
                                    boxShadow: '0 8px 24px rgb(24 24 27 / 8%)',
                                    fontSize: 12,
                                }}
                                labelFormatter={formatActivityDateLabel}
                                formatter={(value, name) => [
                                    Number(value ?? 0).toLocaleString('vi-VN'),
                                    name,
                                ]}
                            />
                            {series.map((itemSeries) => (
                                <Area
                                    key={itemSeries.dataKey}
                                    type="natural"
                                    dataKey={itemSeries.dataKey}
                                    name={itemSeries.label}
                                    stroke={itemSeries.color}
                                    strokeWidth={2}
                                    fill={`url(#dashboard-${itemSeries.dataKey}-gradient)`}
                                    dot={false}
                                    activeDot={false}
                                />
                            ))}
                        </AreaChart>
                    </ChartContainer>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 border-t border-zinc-100 px-2 pt-3">
                        {series.map((itemSeries) => (
                            <div
                                key={itemSeries.dataKey}
                                className="inline-flex items-center gap-1.5 text-xs"
                            >
                                <span
                                    aria-hidden="true"
                                    className="h-0.5 w-4 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: itemSeries.color,
                                    }}
                                />
                                <span className="text-zinc-500">
                                    {itemSeries.label}
                                </span>
                                <strong className="font-medium tabular-nums text-zinc-800">
                                    {overview.totals[
                                        itemSeries.dataKey
                                    ].toLocaleString('vi-VN')}
                                </strong>
                            </div>
                        ))}
                        {hasPartialError ? (
                            <p className="basis-full text-xs text-amber-700">
                                Một số dữ liệu chưa tải được; các chỉ số còn lại
                                vẫn đang hiển thị.
                            </p>
                        ) : null}
                    </div>
                </div>
            )}
        </section>
    );
}
