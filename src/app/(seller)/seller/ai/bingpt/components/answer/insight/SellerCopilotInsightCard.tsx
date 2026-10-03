// Render insight theo loại dữ liệu; chuẩn hoá/link/thumbnail nằm ở primitive riêng để card chỉ lo composition.
'use client';

import {
    formatInsightNumber,
    formatInsightText,
    SellerProductInsightArrow,
    SellerProductInsightShell,
    SellerProductThumbnail,
} from './insight-card.primitives';

interface SellerCopilotInsightCardProps {
    insight: Record<string, unknown>;
}

// Chọn layout theo type đã whitelist; type lạ được bỏ qua thay vì hiển thị JSON khó hiểu.
export function SellerCopilotInsightCard({
    insight,
}: SellerCopilotInsightCardProps) {
    const type = typeof insight.type === 'string' ? insight.type : '';

    if (type === 'ORDER_QUEUE') {
        return (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <p className="mb-3 text-xs font-semibold text-zinc-950">
                    Việc cần xử lý
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <InsightMetric
                        value={formatInsightNumber(insight.pendingConfirmation)}
                        label="Chờ xác nhận"
                    />
                    <InsightMetric
                        value={formatInsightNumber(insight.pendingShipment)}
                        label="Chờ giao"
                    />
                    <InsightMetric
                        value={formatInsightNumber(insight.pendingReturns)}
                        label="Chờ hoàn"
                    />
                </div>
            </div>
        );
    }

    if (type === 'LOW_STOCK') {
        return (
            <SellerProductInsightShell productId={insight.productId}>
                <SellerProductThumbnail
                    name={formatInsightText(insight.name)}
                    thumbnailUrl={insight.thumbnailUrl}
                />
                <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-950">
                        {formatInsightText(insight.name)}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800">
                        Tồn kho thấp, nên kiểm tra sớm
                    </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-800">
                    Còn {formatInsightNumber(insight.stock)}
                </span>
                <SellerProductInsightArrow />
            </SellerProductInsightShell>
        );
    }

    if (type === 'PRODUCT_PERFORMANCE') {
        return (
            <SellerProductInsightShell productId={insight.productId}>
                <SellerProductThumbnail
                    name={formatInsightText(insight.name)}
                    thumbnailUrl={insight.thumbnailUrl}
                />
                <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-950">
                        {formatInsightText(insight.name)}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                        {formatInsightNumber(insight.quantitySold)} sản phẩm đã
                        bán
                    </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-zinc-950">
                    {formatInsightNumber(insight.revenue)}đ
                </span>
                <SellerProductInsightArrow />
            </SellerProductInsightShell>
        );
    }

    return null;
}

// Render một metric nhỏ của insight ORDER_QUEUE để tránh lặp markup và giữ card chính ngắn.
function InsightMetric({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-lg bg-white p-2 text-center">
            <p className="text-lg font-semibold text-zinc-950">{value}</p>
            <p className="text-[10px] text-zinc-500">{label}</p>
        </div>
    );
}
