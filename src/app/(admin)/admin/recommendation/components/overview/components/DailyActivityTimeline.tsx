// Render timeline theo ngày: thẻ gọn trên màn hình nhỏ và bảng nhiều cột trên màn hình rất rộng.

import type { DailyActivity } from '../types';
import { formatDateLabel } from '../overview.utils';

interface Props {
    daily: DailyActivity[];
    activeDays: number;
    maxTotalEvents: number;
    maxEventTypeCount: number;
}

interface MetricProps {
    label: string;
    value: number;
    maxEvents: number;
}

// Hiển thị dữ liệu ngày ở dạng thẻ mobile hoặc bảng desktop nhưng dùng chung một timeline đã chuẩn hóa.
export function DailyActivityTimeline({
    daily,
    activeDays,
    maxTotalEvents,
    maxEventTypeCount,
}: Props) {
    return (
        <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Hiển thị {daily.length} ngày trong khoảng đã chọn</span>
                <span>{activeDays} ngày có dữ liệu</span>
            </div>
            <div
                className="mt-3 max-h-[28rem] overflow-y-auto rounded-xl border border-zinc-100 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-950 [&::-webkit-scrollbar-track]:bg-zinc-100"
                style={{
                    scrollbarColor: '#18181b #f4f4f5',
                    scrollbarWidth: 'thin',
                }}
            >
                <div className="p-2 2xl:hidden">
                    <div className="space-y-2">
                        {daily.map((item) => (
                            <article
                                key={item.day}
                                className={`rounded-xl border border-zinc-200 p-3 ${isEmptyDay(item) ? 'opacity-70' : ''}`}
                            >
                                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                                    <span className="text-sm font-semibold text-zinc-900">
                                        {formatDateLabel(item.day)}
                                    </span>
                                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                                        {item.events.toLocaleString('vi-VN')}{' '}
                                        tổng event
                                    </span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <MobileDailyMetric
                                        label="Xem sản phẩm"
                                        value={item.productViews}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <MobileDailyMetric
                                        label="Impression"
                                        value={item.impressions}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <MobileDailyMetric
                                        label="Click"
                                        value={item.clicks}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <MobileDailyMetric
                                        label="Tìm kiếm"
                                        value={item.searches}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <MobileDailyMetric
                                        label="Thêm giỏ"
                                        value={item.cartAdds}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <MobileDailyMetric
                                        label="Xóa giỏ"
                                        value={item.cartRemovals}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <MobileDailyMetric
                                        label="Mua thành công"
                                        value={item.purchaseCompleted}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <MobileDailyMetric
                                        label="Trả hàng"
                                        value={item.purchaseReturned}
                                        maxEvents={maxEventTypeCount}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
                <div className="hidden overflow-x-auto 2xl:block">
                    <div className="min-w-[82rem]">
                        <div className="sticky top-0 z-10 grid grid-cols-[5.5rem_repeat(9,minmax(5.5rem,1fr))] gap-3 border-b border-zinc-100 bg-zinc-50 px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                            <span>Ngày</span>
                            <span>Tổng tương tác</span>
                            <span>Lượt xem</span>
                            <span>Impression</span>
                            <span>Click</span>
                            <span>Tìm kiếm</span>
                            <span>Thêm giỏ</span>
                            <span>Xóa giỏ</span>
                            <span>Mua</span>
                            <span>Trả hàng</span>
                        </div>
                        <div className="divide-y divide-zinc-100">
                            {daily.map((item) => (
                                <div
                                    key={item.day}
                                    className={`grid grid-cols-[5.5rem_repeat(9,minmax(5.5rem,1fr))] gap-3 px-3 py-3 ${isEmptyDay(item) ? 'opacity-70' : 'hover:bg-zinc-50'}`}
                                >
                                    <span className="pt-1 text-xs font-medium text-zinc-500">
                                        {formatDateLabel(item.day)}
                                    </span>
                                    <DailyMetricCell
                                        label="tổng"
                                        value={item.events}
                                        maxEvents={maxTotalEvents}
                                    />
                                    <DailyMetricCell
                                        label="xem"
                                        value={item.productViews}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <DailyMetricCell
                                        label="hiện"
                                        value={item.impressions}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <DailyMetricCell
                                        label="click"
                                        value={item.clicks}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <DailyMetricCell
                                        label="tìm"
                                        value={item.searches}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <DailyMetricCell
                                        label="thêm"
                                        value={item.cartAdds}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <DailyMetricCell
                                        label="xóa"
                                        value={item.cartRemovals}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <DailyMetricCell
                                        label="mua"
                                        value={item.purchaseCompleted}
                                        maxEvents={maxEventTypeCount}
                                    />
                                    <DailyMetricCell
                                        label="trả"
                                        value={item.purchaseReturned}
                                        maxEvents={maxEventTypeCount}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Kiểm tra ngày rỗng theo cùng quy tắc với hai cách trình bày mobile và desktop.
function isEmptyDay(item: DailyActivity): boolean {
    return (
        item.events === 0 &&
        item.purchaseCompleted === 0 &&
        item.purchaseReturned === 0
    );
}

// Render một event type trong bảng ngày kèm thanh tỷ trọng để admin so sánh volume.
function DailyMetricCell({ label, value, maxEvents }: MetricProps) {
    const width =
        value > 0 ? `${Math.max(8, (value / maxEvents) * 100)}%` : '0%';

    return (
        <div className="min-w-[5.5rem]">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-400">{label}</span>
                <span className="text-xs font-semibold text-zinc-800">
                    {value.toLocaleString('vi-VN')}
                </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                    className="h-full rounded-full bg-zinc-950"
                    style={{ width }}
                />
            </div>
        </div>
    );
}

// Render chỉ số ngày thành ô gọn hai cột để mobile không bị tràn ngang.
function MobileDailyMetric({ label, value, maxEvents }: MetricProps) {
    const width =
        value > 0 ? `${Math.max(8, (value / maxEvents) * 100)}%` : '0%';

    return (
        <div className="rounded-lg bg-zinc-50 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] text-zinc-500">
                    {label}
                </span>
                <span className="text-xs font-semibold text-zinc-900">
                    {value.toLocaleString('vi-VN')}
                </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-200">
                <div
                    className="h-full rounded-full bg-zinc-950"
                    style={{ width }}
                />
            </div>
        </div>
    );
}
