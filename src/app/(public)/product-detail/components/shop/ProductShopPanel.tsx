import Image from 'next/image';
import { BadgeCheck, MessageCircle, Star, Store } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductExternalShop } from '@/services/product';
import { getProductShopAvatarUrl } from '../../utils/product-detail-presentation';

interface ProductShopPanelProps {
    shop: ProductExternalShop;
}

// Trình bày thông tin nhà bán cùng các tín hiệu uy tín có thật từ dữ liệu nguồn.
export function ProductShopPanel({ shop }: ProductShopPanelProps) {
    const avatarUrl = getProductShopAvatarUrl(shop.avatarUrl);
    const rating = Number(shop.ratingAvg ?? 0);

    return (
        <section className="mt-3 border-y border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={shop.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        ) : (
                            <Store className="h-6 w-6 text-zinc-500" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="truncate text-lg font-bold text-zinc-950">
                                {shop.name}
                            </h2>
                            <BadgeCheck className="h-4 w-4 shrink-0 text-red-600" />
                        </div>
                        <p className="mt-1 text-xs uppercase text-zinc-500">
                            Gian hàng từ {shop.sourcePlatform}
                        </p>
                        <div className="mt-3 flex gap-2">
                            <button
                                type="button"
                                disabled
                                className={cn(
                                    buttonVariants({ variant: 'outline', size: 'sm' }),
                                    'disabled:cursor-not-allowed',
                                )}
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Trò chuyện
                            </button>
                            {shop.sourceUrl ? (
                                <a
                                    href={shop.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={buttonVariants({ size: 'sm' })}
                                >
                                    <Store className="h-3.5 w-3.5" />
                                    Xem shop
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-4 lg:min-w-[520px]">
                    <ShopMetric
                        label="Đánh giá"
                        value={rating > 0 ? rating.toFixed(1) : 'Chưa có'}
                        icon={<Star className="h-3.5 w-3.5" />}
                    />
                    <ShopMetric
                        label="Lượt đánh giá"
                        value={(shop.reviewCount ?? 0).toLocaleString('vi-VN')}
                    />
                    <ShopMetric
                        label="Người theo dõi"
                        value={(shop.followerCount ?? 0).toLocaleString('vi-VN')}
                    />
                    <ShopMetric label="Nguồn" value={shop.sourcePlatform.toUpperCase()} />
                </div>
            </div>
        </section>
    );
}

interface ShopMetricProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

// Hiển thị một chỉ số shop trong ô có kích thước ổn định để số liệu dễ so sánh.
function ShopMetric({ label, value, icon }: ShopMetricProps) {
    return (
        <div className="bg-white px-4 py-4 text-center">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-zinc-950">
                {icon}
                {value}
            </p>
        </div>
    );
}
