// File này trình bày card sản phẩm dùng chung cho storefront, không sở hữu logic mua hàng hay lựa chọn variant.
import Image from 'next/image';
import Link from 'next/link';
import { PackageOpen, Star } from 'lucide-react';

import type { PublicProduct } from '@/services/product';
import { cn } from '@/lib/utils';
import {
    calculateDiscountPercent,
    formatProductPrice,
    formatSoldCount,
    getProductRating,
    getProductThumbnail,
} from '../utils/product-formatters';

interface ProductCardProps {
    product: PublicProduct;
    compact?: boolean;
    rank?: number;
}

// Trình bày ảnh, giá, ưu đãi và tín hiệu tin cậy trong một card gọn; card không hiển thị thương hiệu hoặc shop.
export function ProductCard({
    product,
    compact = false,
    rank,
}: ProductCardProps) {
    const imageUrl = getProductThumbnail(product);
    const rating = getProductRating(product);
    const hasPriceRange = product.minPrice !== product.maxPrice;
    const displayPrice = product.displayPrice ?? product.minPrice;
    const displayOriginalPrice = product.displayOriginalPrice;
    const discountPercent = calculateDiscountPercent(
        displayPrice,
        displayOriginalPrice,
    );
    const hasRating = rating > 0;

    return (
        <Link
            href={`/products/${product.id}`}
            aria-label={`Xem chi tiết ${product.name}`}
            className={cn(
                'group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md',
                compact && 'w-44 shrink-0 snap-start sm:w-auto',
            )}
        >
            {rank ? (
                <span className="absolute left-2 top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-md bg-zinc-950 px-2 text-[11px] font-bold text-white shadow-sm">
                    TOP {rank}
                </span>
            ) : null}
            {discountPercent > 0 ? (
                <span className="absolute right-2 top-2 z-10 rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                    -{discountPercent}%
                </span>
            ) : null}
            <div className="relative aspect-square overflow-hidden bg-zinc-50">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300">
                        <PackageOpen className="h-10 w-10" />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-zinc-900">
                    {product.name}
                </p>
                <div className="mt-2 flex min-h-5 items-center gap-1.5 text-xs text-zinc-500">
                    <span
                        className={cn(
                            'inline-flex min-w-0 flex-1 items-center gap-1',
                            hasRating ? 'text-amber-500' : 'text-zinc-400',
                        )}
                    >
                        <Star
                            className={cn(
                                'h-3.5 w-3.5',
                                hasRating && 'fill-current',
                            )}
                        />
                        <span className="min-w-0 truncate whitespace-nowrap">
                            {hasRating ? (
                                <>
                                    {rating.toFixed(1)}
                                    {product.reviewCount > 0 ? (
                                        <span className="ml-1 text-zinc-400">
                                            ({product.reviewCount.toLocaleString('vi-VN')})
                                        </span>
                                    ) : null}
                                </>
                            ) : (
                                'Chưa đánh giá'
                            )}
                        </span>
                    </span>
                    <span className="h-3 w-px shrink-0 bg-zinc-200" />
                    <span className="shrink-0 whitespace-nowrap">
                        Đã bán {formatSoldCount(product.totalSold)}
                    </span>
                </div>

                <div className="mt-auto pt-3">
                    {hasPriceRange ? (
                        <p className="text-[11px] text-zinc-400">Giá từ</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-lg font-bold tracking-tight text-red-600">
                            {formatProductPrice(displayPrice)}
                        </p>
                        {discountPercent > 0 ? (
                            <p className="text-xs text-zinc-400 line-through">
                                {formatProductPrice(displayOriginalPrice)}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </Link>
    );
}
