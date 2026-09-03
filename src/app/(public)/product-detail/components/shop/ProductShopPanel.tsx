// Card hiển thị shop của sản phẩm trên trang chi tiết.
// Component chỉ trình bày snapshot shop đã lưu trong Bin E-Commerce và điều hướng tới shop nội bộ.
// Không thêm thao tác chat hoặc logic mua hàng vào card để giữ đúng phạm vi của product detail.

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Star, Store } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductExternalShop } from '@/services/product';
import { getProductShopAvatarUrl } from '../../utils/product-detail-presentation';

interface ProductShopPanelProps {
    shop: ProductExternalShop;
}

// Trình bày shop nguồn theo bố cục hai vùng: nhận diện ở bên trái và chỉ số ở bên phải.
// Các số liệu đều lấy trực tiếp từ read model của sản phẩm; giá trị thiếu được hiển thị an toàn.
export function ProductShopPanel({ shop }: ProductShopPanelProps) {
    const avatarUrl = getProductShopAvatarUrl(shop.avatarUrl);
    const rating = Number(shop.ratingAvg ?? 0);

    return (
        <section className="mx-auto mt-4 w-full max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-stretch">
                    <div className="flex min-w-0 items-center gap-4 lg:w-[36%] lg:border-r lg:border-zinc-100 lg:pr-8">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 ring-4 ring-zinc-50">
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt={shop.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            ) : (
                                <Store className="absolute inset-0 m-auto h-6 w-6 text-zinc-400" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                                Gian hàng
                            </p>
                            <div className="mt-1 flex min-w-0 items-center gap-1.5">
                                <h2 className="truncate text-lg font-bold tracking-tight text-zinc-950">
                                    {shop.name}
                                </h2>
                                <BadgeCheck
                                    className="h-4 w-4 shrink-0 text-zinc-950"
                                    aria-label="Shop đã xác minh"
                                />
                            </div>
                            <Link
                                href={`/shop/${shop.slug}`}
                                aria-label={`Mở shop ${shop.name}`}
                                className={cn(
                                    buttonVariants({
                                        variant: 'outline',
                                        size: 'sm',
                                    }),
                                    'mt-3 border-zinc-300 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white',
                                )}
                            >
                                <Store className="h-3.5 w-3.5" />
                                Xem shop
                            </Link>
                        </div>
                    </div>

                    <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-0">
                        <ShopMetric
                            label="Đánh giá"
                            value={rating > 0 ? rating.toFixed(1) : 'Chưa có'}
                            icon={<Star className="h-3.5 w-3.5 fill-current" />}
                        />
                        <ShopMetric
                            label="Lượt đánh giá"
                            value={(shop.reviewCount ?? 0).toLocaleString(
                                'vi-VN',
                            )}
                        />
                        <ShopMetric
                            label="Người theo dõi"
                            value={(shop.followerCount ?? 0).toLocaleString(
                                'vi-VN',
                            )}
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
}

// Hiển thị một chỉ số trong ô có đường phân cách nhẹ để người dùng quét nhanh thông tin shop.
function ShopMetric({ label, value, icon }: ShopMetricProps) {
    return (
        <div className="border-zinc-100 first:border-l-0 sm:border-l sm:pl-6">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-base font-semibold text-zinc-950">
                {icon ? <span className="text-zinc-950">{icon}</span> : null}
                {value}
            </p>
        </div>
    );
}
