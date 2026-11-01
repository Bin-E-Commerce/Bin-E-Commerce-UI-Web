// Header nhận diện shop public và các chỉ số seller có thể công khai.

'use client';

import Image from 'next/image';
import { CalendarDays, MapPin, Store, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicShopResponse } from '@/services/seller';
import type { ShopCatalogSummary } from '@/services/product';
import {
    formatLastActive,
    formatShopCount,
    formatShopJoinDate,
} from '../utils/shop-formatters';

interface ShopHeaderProps {
    profile: PublicShopResponse;
    summary?: ShopCatalogSummary;
    followPending: boolean;
    onFollow: () => void;
}

// Hiển thị trạng thái shop rõ ràng, kể cả khi shop bị suspended/closed để customer hiểu lý do không có catalog.
export function ShopHeader({
    profile,
    summary,
    followPending,
    onFollow,
}: ShopHeaderProps) {
    const { shop, stats, activity } = profile;
    const isAvailable = shop.status === 'active';

    // Dấu chấm phản ánh trạng thái online hiện tại, còn nội dung dùng timestamp để cho biết lần hoạt động gần nhất.
    // Khi backend chưa có timestamp, component vẫn giữ fallback dễ hiểu thay vì hiển thị badge trạng thái dư thừa.
    const activityLabel = activity.lastActiveAt
        ? formatLastActive(activity.lastActiveAt)
        : activity.isOnline
          ? 'Đang online'
          : 'Chưa cập nhật';

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4 sm:gap-6">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 sm:h-24 sm:w-24">
                        {shop.logoUrl ? (
                            <Image
                                src={shop.logoUrl}
                                alt={shop.name}
                                fill
                                sizes="96px"
                                className="object-cover"
                            />
                        ) : (
                            <Store className="absolute inset-0 m-auto h-9 w-9 text-zinc-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                {shop.name}
                            </h1>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    className={`h-2 w-2 rounded-full ${activity.isOnline ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                                />
                                {activityLabel}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {shop.location.district &&
                                shop.location.province
                                    ? `${shop.location.district}, ${shop.location.province}`
                                    : 'Chưa cập nhật địa điểm'}
                            </span>
                        </div>
                        {shop.description ? (
                            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">
                                {shop.description}
                            </p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Tham gia {formatShopJoinDate(shop.createdAt)}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {formatShopCount(stats.followingCount)} shop
                                đang theo
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                        type="button"
                        disabled={followPending || !isAvailable}
                        onClick={onFollow}
                        variant={profile.isFollowing ? 'outline' : 'default'}
                    >
                        {profile.isFollowing
                            ? 'Đang theo dõi'
                            : 'Theo dõi shop'}
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-zinc-100 border-t border-zinc-100 sm:grid-cols-4">
                <ShopMetric
                    label="Sản phẩm"
                    value={
                        summary ? formatShopCount(summary.productCount) : '—'
                    }
                />
                <ShopMetric
                    label="Người theo dõi"
                    value={formatShopCount(stats.followerCount)}
                />
                <ShopMetric
                    label="Đánh giá"
                    value={
                        summary
                            ? summary.ratingAvg
                                ? `${Number(summary.ratingAvg).toFixed(1)}/5`
                                : 'Chưa có'
                            : '—'
                    }
                />
                <ShopMetric
                    label="Lượt đánh giá"
                    value={summary ? formatShopCount(summary.reviewCount) : '—'}
                />
            </div>
        </section>
    );
}

interface ShopMetricProps {
    label: string;
    value: string;
}

// Metric dùng cùng nhịp spacing để header cân bằng trên mobile lẫn desktop.
function ShopMetric({ label, value }: ShopMetricProps) {
    return (
        <div className="px-4 py-4 text-center sm:px-6">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-zinc-950 sm:text-base">
                {value}
            </p>
        </div>
    );
}
