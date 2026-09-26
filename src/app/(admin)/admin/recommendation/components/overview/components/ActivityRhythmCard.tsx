// Tóm tắt hoạt động theo ngày và chuyển dữ liệu sang biểu đồ responsive.

import { CalendarDays } from 'lucide-react';

import type { RecommendationAdminOverview as Overview } from '@/services/admin';

import { createDailyTimeline, formatDateLabel } from '../overview.utils';
import { DailyPerformanceChart } from './DailyPerformanceChart';

interface Props {
    overview: Overview | null;
}

// Tính độ phủ, trung bình và ngày cao điểm từ aggregate; timeline đầy đủ chỉ dùng để tính trung bình theo range.
export function ActivityRhythmCard({ overview }: Props) {
    const totals = overview?.totals;
    const daily = overview?.daily ?? [];
    const dailyTimeline = createDailyTimeline(daily, overview?.range);
    const activeDays = daily.filter(
        (item) =>
            item.events > 0 ||
            item.purchaseCompleted > 0 ||
            item.purchaseReturned > 0,
    ).length;
    const peakDay = daily.length
        ? daily.reduce((current, item) =>
              item.events > current.events ? item : current,
          )
        : null;
    const averageEvents = dailyTimeline.length
        ? Math.round(
              dailyTimeline.reduce((sum, item) => sum + item.events, 0) /
                  dailyTimeline.length,
          )
        : 0;

    return (
        <section className="grid min-w-0 gap-4">
            <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                                <CalendarDays className="size-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-zinc-950">
                                    Nhịp hoạt động
                                </h2>
                                <p className="mt-0.5 text-xs text-zinc-400">
                                    Theo từng ngày
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-zinc-500">
                            Toàn bộ event tương tác trong khoảng thời gian đã
                            chọn.
                        </p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                        {totals?.totalInteractions?.toLocaleString('vi-VN') ??
                            totals?.events.toLocaleString('vi-VN') ??
                            0}{' '}
                        tín hiệu
                    </span>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <SummaryTile
                        label="Ngày có dữ liệu"
                        value={`${activeDays}/${dailyTimeline.length}`}
                    />
                    <SummaryTile
                        label="Trung bình event/ngày"
                        value={averageEvents.toLocaleString('vi-VN')}
                    />
                    <SummaryTile
                        label="Ngày nổi bật"
                        value={peakDay ? formatDateLabel(peakDay.day) : '—'}
                    />
                </div>

                <DailyPerformanceChart
                    daily={dailyTimeline}
                    activeDays={activeDays}
                />
            </div>
        </section>
    );
}

// Hiển thị chỉ số phụ của activity để admin nắm độ phủ dữ liệu trước khi đọc biểu đồ.
function SummaryTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-zinc-50 px-3 py-2.5">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 truncate text-lg font-semibold text-zinc-950">
                {value}
            </p>
        </div>
    );
}
