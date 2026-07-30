import Image from 'next/image';
import Link from 'next/link';
import { PackageOpen, Star } from 'lucide-react';

import type { PublicProduct } from '@/services/product';
import { cn } from '@/lib/utils';
import {
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

// Trình bày sản phẩm thật với ảnh, giá, tín hiệu đánh giá và gian hàng trong một card dễ quét.
export function ProductCard({
    product,
    compact = false,
    rank,
}: ProductCardProps) {
    const imageUrl = getProductThumbnail(product);
    const rating = getProductRating(product);
    const hasPriceRange = product.minPrice !== product.maxPrice;

    return (
        <Link
            href={`/products/${product.id}`}
            aria-label={`Xem chi tiết ${product.name}`}
            className={cn(
                'group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md',
                compact && 'w-44 shrink-0 snap-start sm:w-auto',
            )}
        >
            {rank ? (
                <span className="absolute left-2 top-2 z-10 flex h-8 min-w-8 items-center justify-center rounded bg-red-600 px-2 text-xs font-bold text-white shadow-sm">
                    TOP {rank}
                </span>
            ) : null}
            <div className="relative aspect-square overflow-hidden bg-zinc-100">
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
                {product.brand?.name && !rank ? (
                    <span className="absolute left-2 top-2 max-w-[75%] truncate rounded bg-white/95 px-2 py-1 text-[10px] font-semibold text-zinc-700 shadow-sm">
                        {product.brand.name}
                    </span>
                ) : null}
            </div>

            <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-zinc-900">
                    {product.name}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1 text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {rating > 0 ? rating.toFixed(1) : 'Mới'}
                    </span>
                    <span className="h-3 w-px bg-zinc-200" />
                    <span>Đã bán {formatSoldCount(product.totalSold)}</span>
                </div>

                <div className="mt-3">
                    {hasPriceRange ? (
                        <p className="text-[10px] text-zinc-400">Giá từ</p>
                    ) : null}
                    <p className="text-base font-bold text-red-600 sm:text-lg">
                        {formatProductPrice(product.minPrice)}
                    </p>
                </div>

                <div className="mt-3 border-t border-zinc-100 pt-2">
                    <p className="truncate text-xs text-zinc-500">
                        {product.externalShop?.name ?? 'Bin E-Commerce'}
                    </p>
                </div>
            </div>
        </Link>
    );
}
