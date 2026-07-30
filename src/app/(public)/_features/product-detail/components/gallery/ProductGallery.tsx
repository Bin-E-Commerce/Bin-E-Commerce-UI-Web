'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { ProductImage } from '@/services/product';
import { getUniqueProductImages } from '../../utils/product-detail-presentation';

interface ProductGalleryProps {
    productName: string;
    images: ProductImage[];
}

// Điều khiển ảnh đang xem và cho phép chuyển ảnh bằng thumbnail hoặc nút trước/sau trên màn hình nhỏ.
export function ProductGallery({ productName, images }: ProductGalleryProps) {
    const galleryImages = getUniqueProductImages(images);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeImage = galleryImages[activeIndex];

    // Di chuyển tuần hoàn qua gallery để người dùng không bị chặn ở ảnh đầu hoặc ảnh cuối.
    function moveImage(direction: -1 | 1): void {
        if (galleryImages.length <= 1) return;
        setActiveIndex(
            (current) =>
                (current + direction + galleryImages.length) %
                galleryImages.length,
        );
    }

    return (
        <section
            aria-label="Ảnh sản phẩm"
            className="w-full min-w-0 overflow-hidden bg-white p-4 sm:p-6"
        >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-50">
                {activeImage ? (
                    <Image
                        src={activeImage.imageUrl}
                        alt={activeImage.altText || productName}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 46vw"
                        className="object-contain p-3 sm:p-6"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
                        <ImageOff className="h-10 w-10" />
                        <span className="text-sm">Sản phẩm chưa có ảnh</span>
                    </div>
                )}

                {galleryImages.length > 1 ? (
                    <>
                        <button
                            type="button"
                            aria-label="Xem ảnh trước"
                            onClick={() => moveImage(-1)}
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-950 hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Xem ảnh tiếp theo"
                            onClick={() => moveImage(1)}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-950 hover:text-white"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                ) : null}
            </div>

            {galleryImages.length > 1 ? (
                <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((image, index) => (
                        <button
                            key={image.sourceKey}
                            type="button"
                            aria-label={`Xem ảnh ${index + 1}`}
                            aria-pressed={activeIndex === index}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                'relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded border bg-zinc-50 transition-colors sm:h-20 sm:w-20',
                                activeIndex === index
                                    ? 'border-zinc-950 ring-1 ring-zinc-950'
                                    : 'border-zinc-200 hover:border-zinc-500',
                            )}
                        >
                            <Image
                                src={image.imageUrl}
                                alt={image.altText || `${productName} ${index + 1}`}
                                fill
                                sizes="80px"
                                className="object-contain p-1"
                            />
                        </button>
                    ))}
                </div>
            ) : null}

            <p className="mt-3 text-center text-xs text-zinc-500">
                {galleryImages.length > 0
                    ? `${activeIndex + 1} / ${galleryImages.length} ảnh`
                    : '0 ảnh'}
            </p>
        </section>
    );
}
