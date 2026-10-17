// Empty state dành cho seller mới; không thay bằng số liệu demo để tránh hiểu sai dữ liệu vận hành.

import { ArrowUpRight, Store } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Gợi ý bước đầu cho shop mới mà không hiển thị số liệu demo gây nhầm lẫn.
export function SellerDashboardEmptyState() {
    return (
        <Card size="sm" className="border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/70 shadow-sm">
            <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <Store className="size-5" />
                </span>
                <h1 className="mt-5 text-xl font-semibold text-zinc-950">
                    Bắt đầu vận hành shop
                </h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Dashboard sẽ hiển thị doanh thu, đơn hàng và tồn kho ngay
                    khi shop có dữ liệu hoạt động.
                </p>
                <Link
                    href="/seller/products/new"
                    className={buttonVariants({ className: 'mt-5 gap-2' })}
                >
                    Thêm sản phẩm
                    <ArrowUpRight className="size-4" />
                </Link>
            </CardContent>
        </Card>
    );
}
