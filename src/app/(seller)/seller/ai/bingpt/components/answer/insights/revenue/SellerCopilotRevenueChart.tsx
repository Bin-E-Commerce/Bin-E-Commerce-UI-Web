// Biểu đồ doanh thu theo ngày cho câu trả lời có insight đã được backend đối chiếu với dashboard.
// Component chỉ trực quan hóa các điểm nhận được; không tự tính doanh thu, khoảng thời gian hay dữ liệu thiếu.
'use client';

import {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import type { ExtractSellerCopilotRevenueTrend } from '../../../../types/answer/insight.types';

interface SellerCopilotRevenueChartProps {
    insight: ExtractSellerCopilotRevenueTrend;
}

const TREND_DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
});
const VND_FORMATTER = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

// Định dạng tiền VND có phân tách hàng nghìn, dùng chung cho nhãn trục và tooltip để tránh ký hiệu compact khó hiểu.
function formatRevenue(value: number): string {
    return VND_FORMATTER.format(value);
}

// Chuẩn hóa ngày-only lẫn ISO timestamp về lịch Việt Nam, rồi tự ghép DD/MM để trình duyệt không đổi dấu phân cách.
function formatTrendDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        // Không để timestamp lỗi tạo nhãn dạng cắt chuỗi; giá trị gốc chỉ được giữ lại khi vốn đã là ngày ngắn.
        return /^\d{2}[/-]\d{2}$/u.test(value) ? value : '—';
    }

    // Dùng formatToParts để lấy ngày theo múi giờ Việt Nam nhưng cố định dấu / thay vì phụ thuộc locale/browser.
    const dateParts = TREND_DATE_FORMATTER.formatToParts(date);
    const day = dateParts.find((part) => part.type === 'day')?.value;
    const month = dateParts.find((part) => part.type === 'month')?.value;
    return day && month ? `${day}/${month}` : '—';
}

// Render chart chỉ khi component được gọi bằng insight REVENUE_TREND đã có điểm dữ liệu hợp lệ.
export function SellerCopilotRevenueChart({
    insight,
}: SellerCopilotRevenueChartProps) {
    return (
        <section
            className="rounded-xl border border-zinc-200 bg-white p-4"
            aria-label="Biểu đồ doanh thu theo ngày"
        >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-900">
                    Doanh thu theo ngày
                </h3>
                <p className="text-xs text-zinc-500">
                    {formatTrendDate(insight.range.from)} –{' '}
                    {formatTrendDate(insight.range.to)}
                </p>
            </div>
            <ChartContainer className="h-56">
                <LineChart
                    accessibilityLayer
                    data={insight.points}
                    margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
                >
                    <CartesianGrid vertical={false} stroke="#e4e4e7" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatTrendDate}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                        tick={{ fontSize: 11, fill: '#71717a' }}
                    />
                    <YAxis
                        width={96}
                        tickFormatter={formatRevenue}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: '#71717a' }}
                    />
                    <Tooltip
                        labelFormatter={(value) =>
                            formatTrendDate(String(value))
                        }
                        formatter={(value) => formatRevenue(Number(value ?? 0))}
                        contentStyle={{
                            borderRadius: 12,
                            borderColor: '#e4e4e7',
                            fontSize: 12,
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="grossRevenue"
                        name="Doanh thu"
                        stroke="#000000"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 4, fill: '#000000' }}
                    />
                </LineChart>
            </ChartContainer>
        </section>
    );
}
