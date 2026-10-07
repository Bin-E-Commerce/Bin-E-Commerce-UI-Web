// Hiển thị catalog đã scope theo shop với ảnh, mô tả, giá và tồn theo từng phân loại.
// Card chỉ trình bày snapshot backend; không tự tìm ảnh, đoán tồn hay biến top seller thành danh sách.
'use client';

import {
    formatInsightNumber,
    SellerProductThumbnail,
} from '../shared/insight-card.primitives';
import type { ExtractSellerCopilotProductCatalog } from '../../../../types/answer/insight.types';

// Status không hợp lệ/không biết vẫn được hiển thị trung tính thay vì gắn nhãn “đang bán” sai.
function getProductStatusPresentation(status: string): {
    label: string;
    className: string;
} {
    if (status === 'ACTIVE') {
        return {
            label: 'Đang bán',
            className: 'bg-emerald-50 text-emerald-700',
        };
    }
    if (status === 'INACTIVE') {
        return {
            label: 'Ngừng bán',
            className: 'bg-zinc-100 text-zinc-600',
        };
    }
    if (status === 'DRAFT') {
        return {
            label: 'Bản nháp',
            className: 'bg-amber-50 text-amber-700',
        };
    }
    return { label: 'Đang cập nhật', className: 'bg-zinc-100 text-zinc-600' };
}

// Card con gom thông tin nhận diện và các hàng SKU; option name/value được render riêng để người bán nhìn rõ size/màu.
function ProductCatalogItem({
    item,
}: {
    item: ExtractSellerCopilotProductCatalog['items'][number];
}) {
    const status = getProductStatusPresentation(item.status);

    return (
        <article className="min-w-0 rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex min-w-0 items-start gap-3">
                <div className="size-16 shrink-0 [&>span]:size-16 [&>span]:rounded-xl">
                    <SellerProductThumbnail
                        name={item.name}
                        thumbnailUrl={item.thumbnailUrl}
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="min-w-0 flex-1 text-sm font-semibold text-zinc-950">
                            {item.name}
                        </h4>
                        <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                        >
                            {status.label}
                        </span>
                    </div>
                    {item.description ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                            {item.description}
                        </p>
                    ) : null}
                    <p className="mt-2 text-xs text-zinc-600">
                        {item.variantCount} phân loại
                        {' · '}
                        Còn {formatInsightNumber(item.availableTotal)} sản phẩm
                        {' · '}
                        Đã bán {formatInsightNumber(item.totalSold)}
                    </p>
                </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 bg-zinc-50 px-3 py-2 text-[11px] font-medium text-zinc-500">
                    <span>Phân loại / SKU</span>
                    <span className="text-right">Tồn khả dụng</span>
                    <span className="text-right">Giá bán</span>
                </div>
                {item.variants.map((variant) => (
                    <div
                        key={variant.variantId}
                        className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-zinc-100 px-3 py-2.5"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-zinc-800">
                                {variant.options.length
                                    ? variant.options
                                          .map(
                                              (option) =>
                                                  `${option.name}: ${option.value}`,
                                          )
                                          .join(' · ')
                                    : variant.name}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                                SKU {variant.sellerSku || variant.sku}
                                {variant.reserved > 0
                                    ? ` · ${formatInsightNumber(variant.reserved)} đang giữ`
                                    : ''}
                            </p>
                        </div>
                        <span className="text-right text-xs font-semibold text-zinc-800">
                            {formatInsightNumber(variant.available)}
                        </span>
                        <span className="whitespace-nowrap text-right text-xs font-medium text-zinc-700">
                            {formatInsightNumber(variant.price)} ₫
                        </span>
                    </div>
                ))}
                {!item.variants.length ? (
                    <p className="border-t border-zinc-100 px-3 py-3 text-xs text-zinc-500">
                        Chưa có dữ liệu phân loại sản phẩm.
                    </p>
                ) : null}
            </div>
            {item.hasMoreVariants ? (
                <p className="mt-2 text-[11px] text-zinc-500">
                    Đang hiển thị {item.variants.length} trong{' '}
                    {item.variantCount} phân loại.
                </p>
            ) : null}
        </article>
    );
}

// Render số sản phẩm thực sự có trong snapshot; nếu backend chạm giới hạn, card nói rõ còn phần chưa tải.
export function SellerCopilotProductCatalogCard({
    insight,
}: {
    insight: ExtractSellerCopilotProductCatalog;
}) {
    return (
        <section
            className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4"
            aria-label="Danh sách sản phẩm và tồn kho"
        >
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-950">
                        Danh sách sản phẩm
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                        Giá và tồn kho theo từng phân loại
                    </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
                    {insight.totalCount} sản phẩm
                </span>
            </header>
            <div className="grid gap-3 lg:grid-cols-2">
                {insight.items.map((item) => (
                    <ProductCatalogItem key={item.productId} item={item} />
                ))}
            </div>
            {insight.hasMore ? (
                <p className="mt-3 text-xs text-zinc-500">
                    Đang hiển thị {insight.items.length} trong{' '}
                    {insight.totalCount} sản phẩm chưa bị xóa.
                </p>
            ) : null}
        </section>
    );
}
