// Badge impact giải thích baseline và ngày quan sát mới nhất ngay trong product list.

'use client';

import { Activity, ArrowDownRight, ArrowUpRight, Clock3, Info } from 'lucide-react';
import type { ImageOptimizationProductImpact } from '@/services/ai/types/image-optimization.types';
import { formatImpactNumber, formatImpactPercent, getImpactStatusTone } from './impact.utils';

interface ProductImpactBadgeProps {
    impact?: ImageOptimizationProductImpact;
}

// Render cả tín hiệu collecting khi đã có baseline; seller thấy số liệu ngay trong lúc đang thu thập N ngày.
export function ProductImpactBadge({ impact }: ProductImpactBadgeProps) {
    if (!impact) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500">
                <Info className="size-3.5" aria-hidden="true" />
                Chưa có dữ liệu
            </span>
        );
    }

    const tone = getImpactStatusTone(impact.status);
    const hasMetric = Boolean(impact.views && impact.sales);
    const viewChange = impact.views?.changePercent;
    const isDeclining = viewChange !== null && viewChange !== undefined && viewChange < 0;
    const toneClass =
        isDeclining
            ? 'bg-rose-50 text-rose-700'
            : tone === 'positive'
              ? 'bg-emerald-50 text-emerald-700'
              : tone === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-zinc-100 text-zinc-600';

    if (hasMetric) {
        return (
            <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full px-3 py-1.5 text-xs font-semibold ${toneClass}`}>
                {isDeclining ? (
                    <ArrowDownRight className="size-3.5" aria-hidden="true" />
                ) : (
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                )}
                {formatImpactPercent(viewChange)} lượt xem
                <span className="text-current/30">•</span>
                {impact.sales && impact.sales.delta >= 0 ? '+' : ''}{formatImpactNumber(impact.sales?.delta)} lượt bán
                {impact.status === 'COLLECTING' ? (
                    <span className="text-current/60">· {formatElapsedSeconds(impact.elapsedSeconds)}</span>
                ) : null}
            </span>
        );
    }

    if (impact.status === 'COLLECTING') {
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${toneClass}`}>
                <Clock3 className="size-3.5" aria-hidden="true" />
                Đang theo dõi {formatElapsedSeconds(impact.elapsedSeconds)}
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${toneClass}`}>
            <Activity className="size-3.5" aria-hidden="true" />
            {impact.status === 'NO_BASELINE'
                ? 'Chưa đủ dữ liệu lịch sử'
                : impact.status === 'ROLLED_BACK'
                  ? 'Đã khôi phục ảnh gốc'
                  : 'Đang cập nhật số liệu'}
        </span>
    );
}

// Hiển thị mốc theo giây/phút thay vì theo ngày để phản ánh dữ liệu vừa phát sinh sau apply.
function formatElapsedSeconds(value: number): string {
    if (value < 60) return `${value} giây`;
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    if (minutes < 60) return `${minutes} phút ${seconds} giây`;
    return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`;
}
