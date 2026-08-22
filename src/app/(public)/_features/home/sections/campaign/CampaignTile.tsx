import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { PublicProduct } from '@/services/product';
import { cn } from '@/lib/utils';
import {
    formatProductPrice,
    getProductThumbnail,
} from '@/features/products/utils/product-formatters';

interface CampaignTileProps {
    product?: PublicProduct;
    icon: React.ReactNode;
    label: string;
    tone: 'light' | 'accent';
}

// Hiển thị một lối vào sản phẩm có thể nhấp, đồng thời giữ vùng ảnh ổn định khi dữ liệu nguồn chưa có thumbnail.
export function CampaignTile({
    product,
    icon,
    label,
    tone,
}: CampaignTileProps) {
    const imageUrl = product ? getProductThumbnail(product) : null;

    return (
        <Link
            href={product ? `/products/${product.id}` : '#products'}
            className={cn(
                'group relative grid min-h-40 grid-cols-[minmax(0,1fr)_42%] overflow-hidden rounded-lg border p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-zinc-950 hover:shadow-md',
                tone === 'light' && 'border-zinc-200 bg-white text-zinc-950',
                tone === 'accent' &&
                    'border-amber-300 bg-amber-300 text-zinc-950',
            )}
        >
            <div className="relative z-10 min-w-0 pr-3">
                <p className="flex items-center gap-2 text-xs font-semibold">
                    {icon}
                    {label}
                </p>
                <h2 className="mt-3 line-clamp-2 text-base font-bold leading-5">
                    {product?.name ?? 'Khám phá sản phẩm trên Bin'}
                </h2>
                {product ? (
                    <p className="mt-2 text-sm font-semibold">
                        {formatProductPrice(product.minPrice)}
                    </p>
                ) : null}
            </div>

            {imageUrl ? (
                <div className="relative min-h-28 overflow-hidden rounded-md border border-black/5 bg-white">
                    <Image
                        src={imageUrl}
                        alt={product?.name ?? label}
                        fill
                        sizes="(max-width: 1024px) 20vw, 12vw"
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                </div>
            ) : (
                <div className="min-h-28 rounded-md border border-dashed border-black/15 bg-white/50" />
            )}

            <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </Link>
    );
}
