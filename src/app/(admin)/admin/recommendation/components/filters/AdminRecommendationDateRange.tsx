// Bộ lọc thời gian dùng chung cho Overview và A/B aggregate; component chỉ render input và phát sự kiện, không tự gọi API.

'use client';

import { CalendarRange, RotateCcw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { RecommendationDateRangeInput } from '../../types/date-range.types';

interface Props {
    value: RecommendationDateRangeInput;
    appliedValue: RecommendationDateRangeInput | null;
    error: string | null;
    loading: boolean;
    onChange: (value: RecommendationDateRangeInput) => void;
    onApply: () => void;
    onPreset: (days: 7 | 30) => void;
    onReset: () => void;
}

// Render bộ lọc có custom range, preset nhanh và trạng thái mặc định; validation chi tiết được giữ ở hook để không trùng business rule.
export function AdminRecommendationDateRange({
    value,
    appliedValue,
    error,
    loading,
    onChange,
    onApply,
    onPreset,
    onReset,
}: Props) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                        <CalendarRange className="size-4" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">Khoảng thời gian phân tích</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Chọn tối đa 31 ngày để xem đầy đủ event và hiệu quả recommendation.
                        </p>
                    </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-500">
                    {appliedValue ? `${appliedValue.from} → ${appliedValue.to}` : 'Mặc định: 7 ngày gần nhất'}
                </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-end">
                <label className="grid gap-1.5 text-xs font-medium text-zinc-600">
                    Từ ngày
                    <input
                        type="date"
                        value={value.from}
                        onChange={(event) => onChange({ ...value, from: event.target.value })}
                        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                    />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-zinc-600">
                    Đến ngày
                    <input
                        type="date"
                        value={value.to}
                        onChange={(event) => onChange({ ...value, to: event.target.value })}
                        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                    />
                </label>

                <div className="flex flex-wrap gap-2">
                    <Button className="h-10" type="button" variant="outline" onClick={() => onPreset(7)} disabled={loading}>
                        7 ngày
                    </Button>
                    <Button className="h-10" type="button" variant="outline" onClick={() => onPreset(30)} disabled={loading}>
                        30 ngày
                    </Button>
                    <Button className="h-10" type="button" onClick={onApply} disabled={loading}>
                        <Search className="size-4" />
                        Áp dụng
                    </Button>
                    <Button className="h-10" type="button" variant="outline" onClick={onReset} disabled={loading}>
                        <RotateCcw className="size-4" />
                        Mặc định
                    </Button>
                </div>
            </div>

            {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
        </div>
    );
}
