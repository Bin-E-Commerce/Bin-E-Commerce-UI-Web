// Hiển thị aggregate tồn kho đã tính ở Product Service; component không tự cộng variant hoặc đoán trạng thái sản phẩm.
'use client';

import { formatInsightNumber } from '../shared/insight-card.primitives';
import type { ExtractSellerCopilotStockSummary } from '../../../../types/answer/insight.types';

// Tách biệt số bản ghi catalog, sản phẩm đang bán, sản phẩm có hàng và tổng đơn vị để câu hỏi đếm không nhập nhằng.
export function SellerCopilotStockSummaryCard({
    insight,
}: {
    insight: ExtractSellerCopilotStockSummary;
}) {
    return (
        <section
            className="grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2"
            aria-label="Tóm tắt sản phẩm và tồn kho"
        >
            <Metric
                label="Sản phẩm trong catalog"
                value={insight.catalogProducts}
            />
            <Metric label="Sản phẩm đang bán" value={insight.activeProducts} />
            <Metric label="Sản phẩm còn hàng" value={insight.inStockProducts} />
            <Metric label="Tổng đơn vị tồn kho" value={insight.stockUnits} />
        </section>
    );
}

// Dùng tabular number để các aggregate dễ so sánh khi card hiển thị thành lưới.
function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-950">
                {formatInsightNumber(value)}
            </p>
        </div>
    );
}
