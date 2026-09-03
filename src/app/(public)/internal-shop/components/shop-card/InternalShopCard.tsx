// Card nhận diện một shop nội bộ trên trang khám phá.
// Component chỉ trình bày public profile và điều hướng; số liệu sản phẩm được đọc ở trang shop đích.

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Store, Users } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { PublicShopListItem } from '@/services/seller';

interface InternalShopCardProps {
    item: PublicShopListItem;
}

// Định dạng tháng tham gia để người dùng có thêm ngữ cảnh về thời gian hoạt động của shop.
function formatJoinMonth(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
}

// Hiển thị shop bằng avatar, trạng thái, vị trí và follower để customer nhanh chóng chọn shop có thể test mua hàng.
export function InternalShopCard({ item }: InternalShopCardProps) {
    const { shop, stats } = item;
    const location = [shop.location.district, shop.location.province]
        .filter(Boolean)
        .join(', ');
    const joinedAt = formatJoinMonth(shop.createdAt);

    return (
        <Card className="group flex h-full w-full max-w-[500px] flex-col gap-0 justify-self-start overflow-hidden border-zinc-200 bg-white py-0 shadow-sm transition-[border-color,box-shadow] hover:border-zinc-300 hover:shadow-md">
            <CardContent className="flex flex-1 flex-col px-5 py-5">
                <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                        {shop.logoUrl ? (
                            <Image
                                src={shop.logoUrl}
                                alt={shop.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        ) : (
                            <Store className="absolute inset-0 m-auto h-7 w-7 text-zinc-400" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="truncate text-lg font-bold leading-6 tracking-tight text-zinc-950">
                                    {shop.name}
                                </h2>
                                <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Hoạt động
                                </span>
                            </div>
                            <Link
                                href={`/shop/${shop.slug}`}
                                className={cn(
                                    buttonVariants({
                                        size: 'sm',
                                        variant: 'outline',
                                    }),
                                    'shrink-0 border-zinc-300 px-3 text-zinc-800 shadow-none hover:border-zinc-900 hover:bg-zinc-50',
                                )}
                            >
                                Xem shop
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                        <p className="mt-2 truncate text-sm leading-5 text-zinc-500">
                            {shop.description ||
                                'Khám phá sản phẩm và trải nghiệm quy trình mua hàng trên Bin E-Commerce.'}
                        </p>
                    </div>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-3 border-t border-zinc-100 pt-5 text-xs">
                    <div className="min-w-0">
                        <p className="text-zinc-400">Người theo dõi</p>
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-zinc-900">
                            <Users className="h-3.5 w-3.5 text-zinc-500" />
                            {stats.followerCount.toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className="min-w-0">
                        <p className="text-zinc-400">Khu vực</p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        tabIndex={0}
                                        className="mt-1 inline-flex max-w-full cursor-help items-center gap-1 truncate rounded-sm font-semibold text-zinc-900 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                    >
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                                        {location || 'Toàn quốc'}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {location || 'Toàn quốc'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="min-w-0">
                        <p className="text-zinc-400">Tham gia</p>
                        <p className="mt-1 inline-flex items-center gap-1 font-semibold text-zinc-900">
                            <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                            {joinedAt}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
