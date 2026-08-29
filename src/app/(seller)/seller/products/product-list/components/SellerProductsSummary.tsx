import { Boxes, CircleOff, PackageCheck, PackageSearch } from 'lucide-react';

import type { SellerProductSummary } from '@/services/product';

interface SellerProductsSummaryProps {
    summary: SellerProductSummary;
}

// Tóm tắt các chỉ số người bán cần kiểm tra trước khi đi vào từng dòng sản phẩm.
export function SellerProductsSummary({
    summary,
}: SellerProductsSummaryProps) {
    return (
        <section className="grid grid-cols-2 border-b border-zinc-200 bg-white lg:grid-cols-4">
            <div className="flex min-h-24 items-center gap-3 border-b border-r border-zinc-200 px-4 py-4 lg:border-b-0 sm:px-6">
                <PackageSearch className="size-5 text-zinc-400" />
                <div>
                    <p className="text-xs text-zinc-500">Tổng sản phẩm</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">
                        {summary.total}
                    </p>
                </div>
            </div>
            <div className="flex min-h-24 items-center gap-3 border-b border-zinc-200 px-4 py-4 lg:border-b-0 lg:border-r sm:px-6">
                <PackageCheck className="size-5 text-zinc-400" />
                <div>
                    <p className="text-xs text-zinc-500">Đang hoạt động</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">
                        {summary.active}
                    </p>
                </div>
            </div>
            <div className="flex min-h-24 items-center gap-3 border-r border-zinc-200 px-4 py-4 sm:px-6">
                <Boxes className="size-5 text-zinc-400" />
                <div>
                    <p className="text-xs text-zinc-500">Bản nháp</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">
                        {summary.draft}
                    </p>
                </div>
            </div>
            <div className="flex min-h-24 items-center gap-3 px-4 py-4 sm:px-6">
                <CircleOff className="size-5 text-zinc-400" />
                <div>
                    <p className="text-xs text-zinc-500">Hết hàng</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">
                        {summary.outOfStock}
                    </p>
                </div>
            </div>
        </section>
    );
}
