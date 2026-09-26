// Top sản phẩm dùng dữ liệu product read model và không hiển thị doanh thu nếu backend chưa có metric đáng tin cậy.

import Image from 'next/image';
import { ArrowUpRight, ImageOff, Package } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import type { SellerDashboardSnapshot } from '@/services/seller';
import {
    formatDashboardMoney,
    formatDashboardNumber,
} from '../utils/dashboard-formatters';

interface SellerDashboardTopProductsProps {
    snapshot: SellerDashboardSnapshot;
}

export function SellerDashboardTopProducts({
    snapshot,
}: SellerDashboardTopProductsProps) {
    return (
        <Card
            size="sm"
            className="border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
            <CardHeader className="flex flex-row items-center gap-2.5 border-b border-zinc-100 px-4 pb-3 pt-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                    <Package className="size-4" />
                </span>
                <div className="min-w-0">
                    <CardTitle className="text-base font-semibold text-zinc-950">
                        Sản phẩm bán tốt
                    </CardTitle>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        Sản phẩm có số lượng bán cao nhất
                    </p>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
                {snapshot.topProducts.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-zinc-500">
                        Chưa có sản phẩm hoạt động.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {snapshot.topProducts.map((product) => (
                            <Link
                                key={product.productId}
                                href={`/seller/products/${product.productId}`}
                                className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-50"
                            >
                                <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400">
                                    {product.thumbnailUrl ? (
                                        <Image
                                            src={product.thumbnailUrl}
                                            alt={product.name}
                                            fill
                                            sizes="36px"
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <ImageOff className="size-4" />
                                    )}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] font-medium text-zinc-800">
                                        {product.name}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] text-zinc-500">
                                        Đã bán{' '}
                                        {formatDashboardNumber(
                                            product.quantitySold,
                                        )}{' '}
                                        · Còn{' '}
                                        {product.stock === null
                                            ? 'Chưa có dữ liệu'
                                            : formatDashboardNumber(
                                                  product.stock,
                                              )}
                                    </span>
                                </span>
                                <span className="flex shrink-0 items-center gap-2">
                                    {product.revenue !== null ? (
                                        <span className="hidden text-[11px] font-medium text-zinc-600 sm:block">
                                            {formatDashboardMoney(
                                                product.revenue,
                                            )}
                                        </span>
                                    ) : null}
                                    <ArrowUpRight className="size-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
                <div className="mt-auto border-t border-zinc-100 p-3">
                    <Link
                        href="/seller/products"
                        className={buttonVariants({
                            variant: 'outline',
                            size: 'sm',
                            className: 'h-8 w-full gap-2 text-xs',
                        })}
                    >
                        Quản lý sản phẩm
                        <ArrowUpRight className="size-4" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
