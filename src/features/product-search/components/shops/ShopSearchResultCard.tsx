// Thẻ kết quả shop chỉ hiển thị hồ sơ public và liên kết đến storefront tương ứng.
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Store, Users } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ShopSearchResultCardProps } from '../../types/shop-search.types';

// Tóm tắt tên, khu vực và lượng theo dõi để người mua nhận ra đúng shop trước khi mở trang.
export function ShopSearchResultCard({ item }: ShopSearchResultCardProps) {
    const { shop, stats } = item;
    const location = [shop.location.district, shop.location.province]
        .filter(Boolean)
        .join(', ');

    return (
        <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-neutral-200 bg-white py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-950/5">
            <CardContent className="flex h-full flex-col p-5">
                <div className="flex items-center gap-4">
                    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                        {shop.logoUrl ? (
                            <Image
                                src={shop.logoUrl}
                                alt={`Logo ${shop.name}`}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        ) : (
                            <Store className="size-7 text-neutral-900" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900">
                            Cửa hàng
                        </p>
                        <h2 className="mt-1 truncate text-lg font-bold tracking-tight text-neutral-950">
                            {shop.name}
                        </h2>
                    </div>
                </div>

                <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-neutral-600">
                    {shop.description ||
                        'Xem các sản phẩm và thông tin từ cửa hàng này.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5 text-neutral-900" />
                        {stats.followerCount.toLocaleString('vi-VN')} người theo
                        dõi
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0 text-neutral-900" />
                        <span className="truncate">
                            {location || 'Toàn quốc'}
                        </span>
                    </span>
                </div>

                <Link
                    href={`/shop/${encodeURIComponent(shop.slug)}`}
                    aria-label={`Xem cửa hàng ${shop.name}`}
                    className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'mt-5 h-10 w-full justify-between rounded-xl border-neutral-200 font-semibold text-neutral-700 transition-colors group-hover:border-neutral-300 group-hover:bg-neutral-100 group-hover:text-neutral-800',
                    )}
                >
                    Xem cửa hàng
                    <ArrowUpRight className="size-4" />
                </Link>
            </CardContent>
        </Card>
    );
}
