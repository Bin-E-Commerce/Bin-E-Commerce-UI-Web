// Card impact của một sản phẩm đã áp dụng ảnh AI.
// Component chỉ nhận view model từ dashboard, không tự gọi API và không tự suy diễn số liệu.

'use client';

import {
    ArrowDownRight,
    ArrowUpRight,
    Eye,
    Package,
    type LucideIcon,
} from 'lucide-react';
import type {
    ImageOptimizationProduct,
    ImageOptimizationProductImpact,
} from '@/services/ai/types/image-optimization.types';
import { formatImpactNumber, formatImpactPercent } from './impact.utils';

interface AiImpactProductCardProps {
    product: ImageOptimizationProduct;
    compact?: boolean;
}

// Hiển thị baseline và ngày hậu tối ưu gần nhất của một product để seller không nhầm số tổng toàn shop với số của từng sản phẩm.
export function AiImpactProductCard({
    product,
    compact = false,
}: AiImpactProductCardProps) {
    const impact = product.impact;

    return (
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            {compact ? (
                <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                        {product.thumbnailUrl ? (
                            <img
                                src={product.thumbnailUrl}
                                alt=""
                                className="size-full object-cover"
                            />
                        ) : (
                            <Package
                                className="size-4 text-zinc-400"
                                aria-hidden="true"
                            />
                        )}
                    </span>
                    <div className="min-w-0">
                        <h3 className="mt-0.5 truncate text-sm font-semibold text-zinc-950">
                            {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                            {renderImpactStatus(impact)}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                        {product.thumbnailUrl ? (
                            <img
                                src={product.thumbnailUrl}
                                alt=""
                                className="size-full object-cover"
                            />
                        ) : (
                            <Package
                                className="size-5 text-zinc-400"
                                aria-hidden="true"
                            />
                        )}
                    </span>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-zinc-950">
                            {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                            {renderImpactStatus(impact)}
                        </p>
                    </div>
                </div>
            )}

            {impact?.views || impact?.sales ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <ImpactMetric
                        icon={Eye}
                        label="Lượt xem"
                        metric={impact.views}
                    />
                    <ImpactMetric
                        icon={Package}
                        label="Lượt bán"
                        metric={impact.sales}
                    />
                </div>
            ) : (
                <p className="mt-4 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
                    Chưa có đủ dữ liệu để so sánh sản phẩm này.
                </p>
            )}
        </article>
    );
}

// Chuyển trạng thái thu thập thành câu ngắn gọn, giữ N theo từng product thay vì dùng một window chung.
function renderImpactStatus(
    impact: ImageOptimizationProductImpact | undefined,
) {
    if (!impact) return 'Đang chờ dữ liệu impact';
    if (impact.status === 'NO_BASELINE')
        return 'Chưa có dữ liệu trước khi tối ưu';
    if (impact.status === 'UNAVAILABLE')
        return 'Analytics tạm thời không phản hồi';
    if (impact.status === 'ROLLED_BACK') return 'Đã khôi phục ảnh gốc';
    if (impact.status === 'COLLECTING') {
        return `Đang theo dõi ${formatElapsedSeconds(impact.elapsedSeconds)} kể từ lúc áp dụng`;
    }
    return `Đã có dữ liệu sau ${formatElapsedSeconds(impact.elapsedSeconds)}`;
}

// Hiển thị thời gian thực đã trôi qua từ lúc apply để seller biết dữ liệu đang được thu thập ngay cả trong cùng một ngày.
function formatElapsedSeconds(value: number): string {
    if (value < 60) return `${value} giây`;
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    if (minutes < 60) return `${minutes} phút ${seconds} giây`;
    const hours = Math.floor(minutes / 60);
    return `${hours} giờ ${minutes % 60} phút`;
}

interface ImpactMetricProps {
    icon: LucideIcon;
    label: string;
    metric: ImageOptimizationProductImpact['views'];
}

// Render một metric độc lập để card product có cùng bố cục dù lượt xem hoặc lượt bán chưa có dữ liệu.
function ImpactMetric({ icon: Icon, label, metric }: ImpactMetricProps) {
    const change = metric?.changePercent;
    const isPositive = change !== null && change !== undefined && change >= 0;

    return (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3">
            <div className="flex items-center justify-between gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200">
                    <Icon className="size-3.5" aria-hidden="true" />
                </span>
                {change !== null && change !== undefined ? (
                    <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}
                    >
                        {isPositive ? (
                            <ArrowUpRight
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        ) : (
                            <ArrowDownRight
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        )}
                        {formatImpactPercent(change)}
                    </span>
                ) : null}
            </div>
            <p className="mt-3 text-xs font-medium text-zinc-500">{label}</p>
            <p className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                {metric
                    ? `${formatImpactNumber(metric.before)} → ${formatImpactNumber(metric.after)}`
                    : '—'}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
                {metric
                    ? `${metric.delta > 0 ? '+' : ''}${formatImpactNumber(metric.delta)} so với mức nền`
                    : 'Chưa có dữ liệu sau khi áp dụng'}
            </p>
        </div>
    );
}
