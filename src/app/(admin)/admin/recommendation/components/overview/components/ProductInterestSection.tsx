// Bảng xếp hạng sản phẩm được quan tâm dựa trên tổng tương tác đã aggregate từ recommendation events.

import { PackageOpen } from 'lucide-react';
import Image from 'next/image';

import type { TopProduct } from '../types';

interface Props {
    products: TopProduct[];
}

// Hiển thị danh sách sản phẩm nổi bật và trạng thái rỗng khi khoảng thời gian chưa có tương tác.
export function ProductInterestSection({ products }: Props) {
    const maxEvents = Math.max(...products.map((product) => product.events), 1);

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-white px-5 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                            <PackageOpen
                                className="size-5"
                                aria-hidden="true"
                            />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-950">
                                Sản phẩm được quan tâm
                            </h2>
                            <p className="mt-1 max-w-2xl text-sm leading-5 text-zinc-500">
                                Xếp hạng theo tổng số lần người dùng tương tác
                                với sản phẩm được gợi ý.
                            </p>
                        </div>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm">
                        Top {products.length} sản phẩm
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="w-full min-w-0 xl:min-w-[680px]">
                    <div className="hidden grid-cols-[minmax(0,1fr)_12rem_5rem] gap-3 border-b border-zinc-100 bg-zinc-50/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 xl:grid sm:px-6">
                        <span>Sản phẩm</span>
                        <span>Hoạt động</span>
                        <span className="text-right">Tỷ lệ click</span>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        {products.map((product, index) => (
                            <ProductInterestRow
                                key={product.productId}
                                product={product}
                                rank={index + 1}
                                maxEvents={maxEvents}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="px-4 py-12 text-center">
                    <PackageOpen className="mx-auto size-9 text-zinc-300" />
                    <p className="mt-3 text-sm font-semibold text-zinc-700">
                        Chưa có dữ liệu sản phẩm
                    </p>
                    <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-zinc-500">
                        Khi recommendation phát sinh impression hoặc click, sản
                        phẩm nổi bật sẽ xuất hiện ở đây.
                    </p>
                </div>
            ) : null}
        </section>
    );
}

interface ProductInterestRowProps {
    product: TopProduct;
    rank: number;
    maxEvents: number;
}

// Trình bày một sản phẩm kèm vị trí xếp hạng, volume tương tác, click và thêm giỏ.
function ProductInterestRow({
    product,
    rank,
    maxEvents,
}: ProductInterestRowProps) {
    const clickRate =
        product.events > 0 ? (product.clicks / product.events) * 100 : 0;
    const activityWidth = `${Math.max(6, (product.events / maxEvents) * 100)}%`;
    const productName = product.productName ?? 'Chưa đồng bộ tên sản phẩm';

    return (
        <div className="grid min-w-0 gap-4 px-5 py-4 transition-colors hover:bg-zinc-50/70 xl:grid-cols-[minmax(0,1fr)_12rem_5rem] xl:items-center xl:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
                <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rank <= 3 ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-500'}`}
                >
                    {rank}
                </span>
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={productName}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="size-full object-contain"
                        />
                    ) : (
                        <PackageOpen className="size-6 text-zinc-300" />
                    )}
                </div>
                <div className="min-w-0 max-w-full">
                    <p
                        className="line-clamp-2 max-w-[32rem] text-[13px] font-semibold leading-5 text-zinc-900"
                        title={productName}
                    >
                        {productName}
                    </p>
                </div>
            </div>

            <div className="ml-10 min-w-0 xl:ml-0">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-zinc-800">
                        {product.events.toLocaleString('vi-VN')}{' '}
                        <span className="font-normal text-zinc-500">
                            tương tác
                        </span>
                    </span>
                    <span className="text-xs text-zinc-500">
                        {product.clicks.toLocaleString('vi-VN')} click{' '}
                        <span className="text-zinc-300">·</span>{' '}
                        {product.cartAdds.toLocaleString('vi-VN')} giỏ
                    </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                        className="h-full rounded-full bg-zinc-950 transition-[width]"
                        style={{ width: activityWidth }}
                    />
                </div>
            </div>

            <div className="ml-10 flex items-center justify-between gap-3 xl:ml-0 xl:block xl:text-right">
                <span className="text-xs text-zinc-500 xl:hidden">
                    Tỷ lệ click
                </span>
                <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-sm font-bold text-zinc-900">
                    {clickRate.toFixed(1)}%
                </span>
            </div>
        </div>
    );
}
