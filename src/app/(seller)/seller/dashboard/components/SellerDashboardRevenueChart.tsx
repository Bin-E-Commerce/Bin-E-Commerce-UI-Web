// Biểu đồ dashboard dùng snapshot đã tải, hiển thị doanh thu và số đơn theo ngày Việt Nam.
// Component không gọi API riêng và chỉ trình bày dữ liệu đã được Seller Service tổng hợp.

'use client';

import {
    Area,
    Bar,
    CartesianGrid,
    ComposedChart,
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

interface SellerDashboardRevenueChartProps {
    snapshot: SellerDashboardSnapshot;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload?: { date: string; grossRevenue: number; orderCount: number };
    }>;
}

// Tooltip hiển thị doanh thu và số đơn của một ngày, không phụ thuộc format mặc định của Recharts.
function DashboardChartTooltip({ active, payload }: ChartTooltipProps) {
    if (!active || !payload?.length || !payload[0]?.payload) return null;

    const point = payload[0].payload;
    return (
        <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md">
            <p className="font-semibold text-zinc-950">
                {formatDashboardDay(point.date)}
            </p>
            <p className="mt-1 text-zinc-600">
                Doanh thu: {formatDashboardMoney(point.grossRevenue)}
            </p>
            <p className="text-zinc-500">
                Đơn hàng: {formatDashboardNumber(point.orderCount)}
            </p>
        </div>
    );
}

// Render hai series với hai thang đo để số đơn nhỏ không bị chìm trong trục doanh thu lớn.
function ComposedDashboardChart({
    data,
}: {
    data: SellerDashboardSnapshot['revenueTrend'];
}) {
    return (
        <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
            <defs>
                <linearGradient
                    id="seller-dashboard-revenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
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
            <Tooltip
                content={<DashboardChartTooltip />}
                cursor={{ stroke: '#a1a1aa' }}
            />
            <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="grossRevenue"
                stroke="#18181b"
                strokeWidth={2}
                fill="url(#seller-dashboard-revenue)"
                dot={false}
                activeDot={{ r: 4, fill: '#18181b' }}
            />
            <Bar
                yAxisId="orders"
                dataKey="orderCount"
                fill="#a1a1aa"
                fillOpacity={0.65}
                radius={[3, 3, 0, 0]}
                barSize={8}
            />
        </ComposedChart>
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
            className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
            <CardHeader className="flex-row items-start justify-between gap-3 border-b border-zinc-100 px-4 pb-3 pt-3">
                <div>
                    <CardTitle className="text-base font-semibold text-zinc-950">
                        Doanh thu và đơn hàng
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        Xu hướng trong{' '}
                        {snapshot.range.key.replace('d', ' ngày')}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-zinc-950" />
                        Doanh thu
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-zinc-400" />
                        Số đơn
                    </span>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-3">
                {hasData ? (
                    <ChartContainer className="h-[220px]">
                        <ComposedDashboardChart data={snapshot.revenueTrend} />
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
