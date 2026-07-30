'use client';

import {
    BadgeCheck,
    Heart,
    RotateCcw,
    ShieldCheck,
    ShoppingCart,
    Star,
    Truck,
} from 'lucide-react';
import { useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
    calculateDiscountPercent,
    formatProductPrice,
    formatSoldCount,
    getProductRating,
} from '@/features/products/utils/product-formatters';
import { cn } from '@/lib/utils';
import type { ProductDetail } from '@/services/product';
import { useProductPurchase } from '../../hooks/useProductPurchase';
import { ProductOptionSelector } from './ProductOptionSelector';
import { QuantitySelector } from './QuantitySelector';

interface ProductPurchasePanelProps {
    product: ProductDetail;
}

// Tổng hợp thông tin bán, lựa chọn SKU và CTA nguồn trong một panel cố định theo dữ liệu product hiện tại.
export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
    const purchase = useProductPurchase(product);
    const [isFavorite, setIsFavorite] = useState(false);
    const rating = getProductRating(product);
    const currentPrice = purchase.selectedVariant?.price ?? product.minPrice;
    const originalPrice = purchase.selectedVariant?.originalPrice;
    const discountPercent = calculateDiscountPercent(
        currentPrice,
        originalPrice,
    );
    const sourceName =
        product.sourcePlatform?.toUpperCase() ?? 'BIN E-COMMERCE';

    return (
        <section className="min-w-0 border-t border-zinc-200 bg-white p-5 lg:border-l lg:border-t-0 lg:p-7">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {product.brand?.name ? (
                        <span className="rounded bg-zinc-950 px-2 py-1 text-[11px] font-semibold text-white">
                            {product.brand.name}
                        </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Dữ liệu từ {sourceName}
                    </span>
                </div>
                <button
                    type="button"
                    aria-label={
                        isFavorite
                            ? 'Bỏ khỏi danh sách yêu thích'
                            : 'Thêm vào danh sách yêu thích'
                    }
                    aria-pressed={isFavorite}
                    onClick={() => setIsFavorite((current) => !current)}
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors',
                        isFavorite
                            ? 'border-red-200 bg-red-50 text-red-600'
                            : 'border-zinc-200 text-zinc-600 hover:border-red-200 hover:text-red-600',
                    )}
                >
                    <Heart
                        className={cn('h-5 w-5', isFavorite && 'fill-current')}
                    />
                </button>
            </div>

            <h1 className="mt-4 break-words text-2xl font-bold leading-tight text-zinc-950 lg:text-3xl">
                {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    {rating > 0 ? rating.toFixed(1) : 'Chưa có điểm'}
                </span>
                <span className="h-4 w-px bg-zinc-200" />
                <span>{product.reviewCount} đánh giá</span>
                <span className="h-4 w-px bg-zinc-200" />
                <span>Đã bán {formatSoldCount(product.totalSold)}</span>
            </div>

            <div className="mt-5 rounded-lg bg-zinc-50 p-4">
                <div className="flex flex-wrap items-end gap-3">
                    <p className="text-3xl font-bold text-red-600">
                        {formatProductPrice(currentPrice)}
                    </p>
                    {originalPrice && discountPercent > 0 ? (
                        <>
                            <p className="pb-1 text-sm text-zinc-400 line-through">
                                {formatProductPrice(originalPrice)}
                            </p>
                            <span className="mb-1 rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                -{discountPercent}%
                            </span>
                        </>
                    ) : null}
                </div>
                {product.shortDescription ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">
                        {product.shortDescription}
                    </p>
                ) : null}
            </div>

            <div className="mt-5 grid gap-3 border-y border-zinc-200 py-5 sm:grid-cols-3">
                <BenefitItem icon={Truck} title="Giao hàng thuận tiện" />
                <BenefitItem icon={RotateCcw} title="Hỗ trợ đổi trả" />
                <BenefitItem icon={ShieldCheck} title="Thông tin rõ ràng" />
            </div>

            <div className="mt-5">
                <ProductOptionSelector
                    options={product.options}
                    selectedValueIds={purchase.selectedValueIds}
                    onSelect={purchase.selectOptionValue}
                />
            </div>

            <div className="mt-5">
                <QuantitySelector
                    quantity={purchase.quantity}
                    stock={purchase.availableStock}
                    onDecrease={purchase.decreaseQuantity}
                    onIncrease={purchase.increaseQuantity}
                    onChange={purchase.setQuantity}
                />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={
                        product.originType !== 'INTERNAL' ||
                        purchase.availableStock === 0
                    }
                    className="h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    <ShoppingCart className="h-4 w-4" />
                    Thêm vào giỏ
                </Button>

                {product.sourceUrl ? (
                    <a
                        href={product.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({
                            size: 'lg',
                            className: 'h-12 bg-red-600 hover:bg-red-700',
                        })}
                    >
                        Xem nơi bán
                    </a>
                ) : (
                    <Button
                        type="button"
                        size="lg"
                        disabled={purchase.availableStock === 0}
                        className="h-12 bg-red-600 hover:bg-red-700"
                    >
                        Mua ngay
                    </Button>
                )}
            </div>

            {purchase.selectedVariant ? (
                <p className="mt-3 text-xs text-zinc-400">
                    SKU: {purchase.selectedVariant.sku}
                </p>
            ) : null}
        </section>
    );
}

interface BenefitItemProps {
    icon: typeof Truck;
    title: string;
}

// Giữ các cam kết mua hàng thành tín hiệu ngắn để người dùng quét nhanh thay vì đọc đoạn mô tả dài.
function BenefitItem({ icon: Icon, title }: BenefitItemProps) {
    return (
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-700">
            <Icon className="h-4 w-4 text-red-600" />
            {title}
        </div>
    );
}
