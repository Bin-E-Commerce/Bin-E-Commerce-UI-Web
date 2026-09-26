// Các hàm thuần định dạng và dựng timeline cho overview; không làm thay đổi dữ liệu aggregate gốc từ API.

import type { DailyActivity } from './types';

// Định dạng tỷ lệ API trả về dạng số thập phân thành phần trăm cho bảng performance.
export function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

// Hiển thị ngày theo lịch UTC mà API sử dụng, tránh lệch ngày theo timezone máy của admin.
export function formatDateLabel(day: string): string {
    const date = new Date(`${day}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return day;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

// Sắp xếp bản sao timeline theo ngày mới nhất trước để không mutate snapshot nhận từ API.
function sortDailyNewestFirst(daily: DailyActivity[]): DailyActivity[] {
    return [...daily].sort((left, right) => right.day.localeCompare(left.day));
}

// Bổ sung ngày trống trong range để phân biệt ngày không phát sinh event với ngày API thiếu dữ liệu.
export function createDailyTimeline(
    daily: DailyActivity[],
    range?: { from: string; to: string },
): DailyActivity[] {
    if (!range) return sortDailyNewestFirst(daily);

    const dailyByDate = new Map(daily.map((item) => [item.day, item]));
    const start = new Date(range.from);
    const end = new Date(range.to);
    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        start > end
    ) {
        return sortDailyNewestFirst(daily);
    }

    const cursor = new Date(
        Date.UTC(
            start.getUTCFullYear(),
            start.getUTCMonth(),
            start.getUTCDate(),
        ),
    );
    const endDate = new Date(
        Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
    );
    const timeline: DailyActivity[] = [];

    // Duyệt theo ngày UTC để giữ khớp với trường day ISO mà Recommendation Service trả về.
    while (cursor <= endDate) {
        const day = cursor.toISOString().slice(0, 10);
        timeline.push(
            dailyByDate.get(day) ?? {
                day,
                events: 0,
                productViews: 0,
                impressions: 0,
                clicks: 0,
                searches: 0,
                cartAdds: 0,
                cartRemovals: 0,
                purchaseCompleted: 0,
                purchaseReturned: 0,
            },
        );
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return timeline.reverse();
}
