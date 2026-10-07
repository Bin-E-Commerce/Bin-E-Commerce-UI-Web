// Render insight theo loại dữ liệu; chuẩn hoá/link/thumbnail nằm ở primitive riêng để card chỉ lo composition.
'use client';

import {
    formatInsightNumber,
    formatInsightText,
    SellerProductInsightArrow,
    SellerProductInsightShell,
    SellerProductThumbnail,
} from './shared/insight-card.primitives';
import { SellerCopilotProfileCard } from './profile/SellerCopilotProfileCard';
import { SellerCopilotRevenueChart } from './revenue/SellerCopilotRevenueChart';
import { SellerCopilotOrderDetailsCard } from './orders/SellerCopilotOrderDetailsCard';
import { SellerCopilotProductCatalogCard } from './products/SellerCopilotProductCatalogCard';
import { SellerCopilotStockSummaryCard } from './products/SellerCopilotStockSummaryCard';
import type { SellerCopilotInsight } from '@/services/seller/types/seller-copilot-insight.types';

interface SellerCopilotInsightCardProps {
    insight: SellerCopilotInsight;
}

// Chọn component theo discriminant của payload đã whitelist; visual không hợp lệ không thể trở thành HTML tùy ý.
export function SellerCopilotInsightCard({
    insight,
}: SellerCopilotInsightCardProps) {
    const type = insight.type;

    if (type === 'REVENUE_TREND') {
        return <SellerCopilotRevenueChart insight={insight} />;
    }

    if (type === 'SELLER_PROFILE') {
        return <SellerCopilotProfileCard insight={insight} />;
    }

    if (type === 'PRODUCT_CATALOG') {
        return <SellerCopilotProductCatalogCard insight={insight} />;
    }

    if (type === 'PRODUCTS_WITHOUT_REVENUE') {
        // Dùng đúng shell/thumbnail của các insight sản phẩm để danh sách không doanh thu đồng bộ với top/sold cards.
        return (
            <section
                className="grid gap-2"
                aria-label="Sản phẩm chưa có doanh thu trong kỳ"
            >
                {insight.items.map((product) => (
                    <SellerProductInsightShell
                        key={product.productId}
                        productId={product.productId}
                    >
                        <SellerProductThumbnail
                            name={formatInsightText(product.name)}
                            thumbnailUrl={product.thumbnailUrl}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-zinc-950">
                                {formatInsightText(product.name)}
                            </p>
                            <p className="mt-1 text-[11px] text-zinc-500">
                                Chưa phát sinh doanh thu trong kỳ
                            </p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-zinc-700">
                            0 ₫
                        </span>
                        <SellerProductInsightArrow />
                    </SellerProductInsightShell>
                ))}
                {insight.hasMore ? (
                    <p className="text-xs text-zinc-500">
                        Danh sách còn sản phẩm chưa tải; kết quả trên chỉ gồm
                        các sản phẩm đã kiểm tra.
                    </p>
                ) : null}
            </section>
        );
    }

    if (type === 'PRODUCT_STOCK_SUMMARY') {
        return <SellerCopilotStockSummaryCard insight={insight} />;
    }

    if (
        type === 'ORDER_DETAILS' ||
        type === 'RETURN_ORDERS' ||
        type === 'ACTIONABLE_ORDERS' ||
        type === 'CANCELLED_ORDERS' ||
        type === 'DELIVERED_ORDERS' ||
        type === 'COMPLETED_ORDERS'
    ) {
        return <SellerCopilotOrderDetailsCard insight={insight} />;
    }

    if (type === 'ORDER_STATUS_COUNT') {
        // Câu hỏi đếm chỉ hiển thị aggregate toàn shop; không đưa danh sách đơn gần nhất giới hạn vào gây lệch số.
        return (
            <section
                className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3"
                aria-label="Số đơn hoàn thành"
            >
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Đơn hàng hoàn thành
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                        Tổng số đơn đã hoàn tất
                    </p>
                </div>
                <p className="shrink-0 text-right">
                    <span className="text-2xl font-semibold tabular-nums text-zinc-950">
                        {formatInsightNumber(insight.count)}
                    </span>{' '}
                    <span className="ml-1 text-xs text-zinc-500">đơn</span>
                </p>
            </section>
        );
    }

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
                    <p
                        className={`mt-1 text-[11px] ${insight.stock === 0 ? 'text-red-700' : 'text-amber-800'}`}
                    >
                        {insight.stock === 0
                            ? 'Đã hết hàng'
                            : 'Tồn kho thấp, nên kiểm tra sớm'}
                    </p>
                    {insight.variantName ? (
                        <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                            Phân loại: {insight.variantName}
                        </p>
                    ) : null}
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
