// Chọn trạng thái rỗng hoặc hiển thị timeline responsive cho các chỉ số event theo ngày.

import type { DailyActivity } from '../types';
import { DailyActivityTimeline } from './DailyActivityTimeline';

interface Props {
    daily: DailyActivity[];
    activeDays: number;
}

// Hiển thị thông báo khi toàn khoảng không có event; nếu có dữ liệu thì chuyển thang đo sang timeline.
export function DailyPerformanceChart({ daily, activeDays }: Props) {
    const maxTotalEvents = Math.max(...daily.map((item) => item.events), 1);
    const maxEventTypeCount = Math.max(
        ...daily.flatMap((item) => [
            item.productViews,
            item.impressions,
            item.clicks,
            item.searches,
            item.cartAdds,
            item.cartRemovals,
            item.purchaseCompleted,
            item.purchaseReturned,
        ]),
        1,
    );

    if (daily.length === 0 || activeDays === 0) {
        return (
            <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-zinc-700">
                    Chưa có event recommendation trong khoảng thời gian này.
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                    Khi có impression hoặc click đủ attribution, biểu đồ sẽ tự cập nhật.
                </p>
            </div>
        );
    }

    return (
        <DailyActivityTimeline
            daily={daily}
            activeDays={activeDays}
            maxTotalEvents={maxTotalEvents}
            maxEventTypeCount={maxEventTypeCount}
        />
    );
}
