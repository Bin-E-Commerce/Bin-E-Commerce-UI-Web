// Biểu đồ dashboard dùng snapshot đã tải, hiển thị doanh thu và số đơn theo ngày Việt Nam.
// Component không gọi API riêng và chỉ trình bày dữ liệu đã được Seller Service tổng hợp.

'use client';

import {
    Area,
    AreaChart,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SellerDashboardSnapshot } from '@/services/seller';
import {
    formatDashboardDay,
    formatDashboardMoney,
    formatDashboardNumber,
} from '../utils/dashboard-formatters';

// Dùng sắc đen và tím khói nhất quán giữa đường, vùng tô, tooltip và chú giải.
const REVENUE_CHART_COLORS = {
    revenue: '#18181b',
    orders: '#6b4e71',
} as const;

interface SellerDashboardRevenueChartProps {
    snapshot: SellerDashboardSnapshot;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload?: { date: string; grossRevenue: number; orderCount: number };
    }>;
}

// Tooltip gom hai series về cùng một ngày, định dạng riêng đơn vị và khớp màu với đường biểu đồ.
function DashboardChartTooltip({ active, payload }: ChartTooltipProps) {
    if (!active || !payload?.length || !payload[0]?.payload) return null;

    const point = payload[0].payload;
    return (
        <div className="grid min-w-40 gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs shadow-lg">
            <p className="font-semibold text-zinc-950">
                {formatDashboardDay(point.date)}
            </p>
            <div className="grid gap-1.5">
                <p className="flex items-center justify-between gap-4 text-zinc-600">
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="size-2 rounded-full"
                            style={{
                                backgroundColor: REVENUE_CHART_COLORS.revenue,
                            }}
                        />
                        Doanh thu
                    </span>
                    <span className="font-medium tabular-nums text-zinc-950">
                        {formatDashboardMoney(point.grossRevenue)}
                    </span>
                </p>
                <p className="flex items-center justify-between gap-4 text-zinc-600">
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="size-2 rounded-full"
                            style={{
                                backgroundColor: REVENUE_CHART_COLORS.orders,
                            }}
                        />
                        Số đơn
                    </span>
                    <span className="font-medium tabular-nums text-zinc-950">
                        {formatDashboardNumber(point.orderCount)}
                    </span>
                </p>
            </div>
        </div>
    );
}

// Vẽ hai vùng độc lập với gradient riêng; trục số đơn ẩn bên phải giữ đúng tỷ lệ mà không chen nhãn.
function RevenueOrdersAreaChart({
    data,
}: {
    data: SellerDashboardSnapshot['revenueTrend'];
}) {
    return (
        <AreaChart
            accessibilityLayer
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
            <defs>
                <linearGradient
                    id="seller-revenue-area-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="5%"
                        stopColor={REVENUE_CHART_COLORS.revenue}
                        stopOpacity={0.55}
                    />
                    <stop
                        offset="52%"
                        stopColor={REVENUE_CHART_COLORS.revenue}
                        stopOpacity={0.25}
                    />
                    <stop
                        offset="95%"
                        stopColor={REVENUE_CHART_COLORS.revenue}
                        stopOpacity={0.05}
                    />
                </linearGradient>
                <linearGradient
                    id="seller-orders-area-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="5%"
                        stopColor={REVENUE_CHART_COLORS.orders}
                        stopOpacity={0.55}
                    />
                    <stop
                        offset="52%"
                        stopColor={REVENUE_CHART_COLORS.orders}
                        stopOpacity={0.25}
                    />
                    <stop
                        offset="95%"
                        stopColor={REVENUE_CHART_COLORS.orders}
                        stopOpacity={0.05}
                    />
                </linearGradient>
            </defs>
            <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e4e4e7"
            />
            <XAxis
                dataKey="date"
                tickFormatter={formatDashboardDay}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tickMargin={8}
                tick={{ fill: '#71717a', fontSize: 11 }}
            />
            <YAxis
                yAxisId="revenue"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickFormatter={(value: number) =>
                    value >= 1_000_000
                        ? `${Math.round(value / 1_000_000)}tr`
                        : value >= 1_000
                          ? `${Math.round(value / 1_000)}k`
                          : String(value)
                }
            />
            <YAxis yAxisId="orders" orientation="right" hide />
            <Tooltip content={<DashboardChartTooltip />} cursor={false} />
            <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="grossRevenue"
                stroke={REVENUE_CHART_COLORS.revenue}
                strokeWidth={2}
                fill="url(#seller-revenue-area-gradient)"
                dot={false}
                activeDot={{
                    r: 4,
                    fill: REVENUE_CHART_COLORS.revenue,
                }}
            />
            <Area
                yAxisId="orders"
                dataKey="orderCount"
                type="monotone"
                stroke={REVENUE_CHART_COLORS.orders}
                strokeWidth={2}
                fill="url(#seller-orders-area-gradient)"
                dot={false}
                activeDot={{
                    r: 4,
                    fill: REVENUE_CHART_COLORS.orders,
                }}
            />
        </AreaChart>
    );
}

// Hiển thị xu hướng theo range đã chọn và giữ trạng thái rỗng khi backend chưa có giao dịch hợp lệ.
export function SellerDashboardRevenueChart({
    snapshot,
}: SellerDashboardRevenueChartProps) {
    const hasData = snapshot.revenueTrend.some(
        (point) => point.grossRevenue > 0 || point.orderCount > 0,
    );

    return (
        <Card
            size="sm"
            className="border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/90 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
        >
            <CardHeader className="grid-cols-1 items-center gap-3 border-b border-slate-200/80 px-4 pb-3 pt-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                    <CardTitle className="text-base font-semibold text-zinc-950">
                        Doanh thu và đơn hàng
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        Xu hướng trong{' '}
                        {snapshot.range.key.replace('d', ' ngày')}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 text-[11px] text-zinc-500 sm:justify-self-end">
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className="size-2 rounded-full"
                            style={{
                                backgroundColor: REVENUE_CHART_COLORS.revenue,
                            }}
                        />
                        Doanh thu
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className="size-2 rounded-full"
                            style={{
                                backgroundColor: REVENUE_CHART_COLORS.orders,
                            }}
                        />
                        Số đơn
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
                {hasData ? (
                    <ChartContainer className="h-[220px]">
                        <RevenueOrdersAreaChart data={snapshot.revenueTrend} />
                    </ChartContainer>
                ) : (
                    <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 text-center">
                        <div>
                            <p className="text-sm font-medium text-zinc-700">
                                Chưa có giao dịch trong khoảng thời gian này
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                Biểu đồ sẽ tự cập nhật khi shop phát sinh đơn
                                hợp lệ.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
