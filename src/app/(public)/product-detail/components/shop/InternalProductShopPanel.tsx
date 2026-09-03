// Card nhận diện shop nội bộ trên trang chi tiết sản phẩm.
// Component chỉ đọc public profile để hiển thị thông tin và điều hướng sang trang shop.
// Component không sở hữu logic mua hàng, follow hoặc cập nhật dữ liệu shop.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Store, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { productService } from '@/services/product';
import { publicShopService } from '@/services/seller';
import {
    formatLastActive,
    formatShopJoinDate,
} from '../../../shop/[slug]/utils/shop-formatters';

// Tải profile shop độc lập với product detail để lỗi profile không làm mất phần mua hàng.
// Query có key riêng và stale time ngắn để dữ liệu nhận diện được cập nhật mà không tạo request lặp.
export function InternalProductShopPanel({ shopId }: { shopId: string }) {
    const shopQuery = useQuery({
        queryKey: ['shops', 'product-panel', shopId],
        queryFn: () => publicShopService.getBySlug(shopId),
        staleTime: 60_000,
    });
    const profile = shopQuery.data;
    const shop = profile?.shop;
    const activity = profile?.activity;
    const stats = profile?.stats;
    // Tải summary độc lập để chỉ số đánh giá phản ánh toàn shop, không suy diễn từ sản phẩm hiện tại.
    const shopSummaryQuery = useQuery({
        queryKey: ['shops', 'summary', shopId],
        queryFn: () => productService.getShopSummary(shopId),
        staleTime: 60_000,
    });

    if (shopQuery.isPending) {
        return (
            <div className="mx-auto mt-3 h-32 max-w-7xl animate-pulse rounded-2xl bg-zinc-100 px-4 sm:px-6 lg:px-8" />
        );
    }

    if (!shop) return null;

    const location =
        shop.location.district && shop.location.province
            ? `${shop.location.district}, ${shop.location.province}`
            : 'Bin E-Commerce';

    // Dấu chấm vẫn phản ánh trạng thái online hiện tại, còn nội dung hiển thị thời điểm hoạt động gần nhất.
    // Cách tách hai tín hiệu này giúp tránh dùng nhãn chung chung và vẫn fallback an toàn khi backend thiếu timestamp.
    const activityLabel = activity?.lastActiveAt
        ? formatLastActive(activity.lastActiveAt)
        : activity?.isOnline
          ? 'Đang online'
          : 'Chưa cập nhật';

    return (
        <section className="mx-auto mt-4 w-full max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-stretch">
                    <div className="flex min-w-0 items-center gap-4 lg:w-[36%] lg:border-r lg:border-zinc-100 lg:pr-8">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 ring-4 ring-zinc-50">
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

                        <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-3">
                                <Link
                                    href={`/shop/${shop.slug}`}
                                    aria-label={`Xem shop ${shop.name}`}
                                    className="group/name min-w-0"
                                >
                                    <h2 className="truncate text-lg font-bold tracking-tight text-zinc-950 transition-colors group-hover/name:text-zinc-600 sm:text-xl">
                                        {shop.name}
                                    </h2>
                                </Link>
                                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-600">
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${activity?.isOnline ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                                        aria-hidden="true"
                                    />
                                    {activityLabel}
                                </span>
                            </div>
                            <p className="mt-1 flex max-w-full items-center gap-1.5 truncate text-sm text-zinc-500">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {location}
                            </p>
                            <Link
                                href={`/shop/${shop.slug}`}
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        size: 'sm',
                                    }),
                                    'mt-3 flex w-fit border-zinc-300 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white',
                                )}
                            >
                                Xem shop
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-0">
                        <ShopMetric
                            label="Số lượng đánh giá"
                            value={(
                                shopSummaryQuery.data?.reviewCount ?? 0
                            ).toLocaleString('vi-VN')}
                        />
                        <ShopMetric
                            label="Người theo dõi"
                            value={(stats?.followerCount ?? 0).toLocaleString(
                                'vi-VN',
                            )}
                            icon={<Users className="h-3.5 w-3.5" />}
                        />
                        <ShopMetric
                            label="Khu vực"
                            value={shop.location.province ?? 'Chưa cập nhật'}
                        />
                        <ShopMetric
                            label="Tham gia"
                            value={formatShopJoinDate(shop.createdAt)}
                            compact
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

interface ShopMetricProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
    compact?: boolean;
}

// Hiển thị một chỉ số shop nội bộ với cùng nhịp thị giác như card shop nguồn.
function ShopMetric({ label, value, icon, compact = false }: ShopMetricProps) {
    return (
        <div className="min-w-0 border-zinc-100 first:border-l-0 sm:border-l sm:pl-6">
            <p className="text-sm text-zinc-500">{label}</p>
            <p
                className={`mt-1 inline-flex max-w-full items-center gap-1.5 font-semibold text-zinc-950 ${compact ? 'whitespace-nowrap text-sm' : 'text-base'}`}
            >
                {icon ? <span className="text-zinc-950">{icon}</span> : null}
                {value}
            </p>
        </div>
    );
}
