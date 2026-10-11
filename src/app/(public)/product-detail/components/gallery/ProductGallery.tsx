// Gallery dùng chung cho trang công khai và seller; chế độ gọn chỉ đổi mật độ.
// Hành vi điều hướng và dữ liệu media luôn giữ nguyên giữa hai chế độ.
'use client';
import { Button } from '@/components/ui/button';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageOff, Play, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import type { ProductImage } from '@/services/product';
import { getUniqueProductImages } from '../../utils/product-detail-presentation';

type GalleryMedia =
    | {
          type: 'image';
          image: ReturnType<typeof getUniqueProductImages>[number];
      }
    | {
          type: 'video';
          videoUrl: string;
          durationSeconds?: number | null;
          posterUrl?: string | null;
      };

interface ProductGalleryProps {
    productName: string;
    images: ProductImage[];
    videoUrl?: string | null;
    videoDurationSeconds?: number | null;
    compact?: boolean;
}

// Đổi số giây từ API thành định dạng phút:giây để hiển thị nhất quán trên thumbnail video.
function formatVideoDuration(durationSeconds?: number | null): string | null {
    if (
        !Number.isFinite(durationSeconds) ||
        !durationSeconds ||
        durationSeconds < 0
    ) {
        return null;
    }

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60)
        .toString()
        .padStart(2, '0');

    return `${minutes}:${seconds}`;
}

// Dựng một danh sách media duy nhất để nút điều hướng và thumbnail xử lý ảnh/video theo cùng một cơ chế.
function buildGalleryMedia(
    images: ProductImage[],
    videoUrl?: string | null,
    videoDurationSeconds?: number | null,
): GalleryMedia[] {
    const galleryImages = getUniqueProductImages(images);
    const normalizedVideoUrl = videoUrl?.trim();

    const media: GalleryMedia[] = galleryImages.map((image) => ({
        type: 'image',
        image,
    }));

    if (normalizedVideoUrl) {
        media.push({
            type: 'video',
            videoUrl: normalizedVideoUrl,
            durationSeconds: videoDurationSeconds,
            posterUrl: galleryImages[0]?.imageUrl,
        });
    }

    return media;
}

// Hiển thị gallery ảnh/video; compact giảm chiều cao cho màn vận hành nhưng vẫn
// giữ nguyên cách chọn, điều hướng và phát nội dung media.
export function ProductGallery({
    productName,
    images,
    videoUrl,
    videoDurationSeconds,
    compact = false,
}: ProductGalleryProps) {
    const galleryMedia = useMemo(
        () => buildGalleryMedia(images, videoUrl, videoDurationSeconds),
        [images, videoDurationSeconds, videoUrl],
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const activeMedia = galleryMedia[activeIndex];

    // Khi chuyển sang sản phẩm khác hoặc video mới, đưa con trỏ về media đầu tiên để không trỏ vào phần tử cũ.
    useEffect(() => {
        setActiveIndex(0);
    }, [galleryMedia.length, productName, videoUrl]);

    // Di chuyển tuần hoàn qua toàn bộ media để người dùng không bị chặn ở phần tử đầu hoặc cuối.
    function moveMedia(direction: -1 | 1): void {
        if (galleryMedia.length <= 1) return;
        setActiveIndex(
            (current) =>
                (current + direction + galleryMedia.length) %
                galleryMedia.length,
        );
    }

    return (
        <section
            aria-label="Media sản phẩm"
            className={cn(
                'w-full min-w-0 overflow-hidden bg-white',
                compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6',
            )}
        >
            <div
                className={cn(
                    'relative overflow-hidden rounded-lg bg-zinc-50',
                    compact ? 'aspect-[4/3]' : 'aspect-square',
                )}
            >
                {activeMedia?.type === 'image' ? (
                    <Image
                        src={activeMedia.image.imageUrl}
                        alt={activeMedia.image.altText || productName}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 46vw"
                        className={cn(
                            'object-contain',
                            compact ? 'p-3 sm:p-4' : 'p-3 sm:p-6',
                        )}
                    />
                ) : activeMedia?.type === 'video' ? (
                    <video
                        key={activeMedia.videoUrl}
                        src={activeMedia.videoUrl}
                        poster={activeMedia.posterUrl ?? undefined}
                        controls
                        playsInline
                        preload="metadata"
                        aria-label={`Video giới thiệu ${productName}`}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
                        <ImageOff className="h-10 w-10" />
                        <span className="text-sm">
                            Sản phẩm chưa có ảnh hoặc video
                        </span>
                    </div>
                )}

                {galleryMedia.length > 1 ? (
                    <>
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label="Xem nội dung trước"
                            onClick={() => moveMedia(-1)}
                            className={cn(
                                'absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-950 hover:text-white',
                                compact
                                    ? 'left-2 size-8'
                                    : 'left-3 size-9',
                            )}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label="Xem nội dung tiếp theo"
                            onClick={() => moveMedia(1)}
                            className={cn(
                                'absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-950 hover:text-white',
                                compact
                                    ? 'right-2 size-8'
                                    : 'right-3 size-9',
                            )}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </>
                ) : null}
            </div>

            {galleryMedia.length > 1 ? (
                <div
                    className={cn(
                        'flex snap-x gap-2 overflow-x-auto pb-1',
                        compact ? 'mt-2' : 'mt-3',
                    )}
                >
                    {galleryMedia.map((media, index) => {
                        const isActive = activeIndex === index;
                        const duration =
                            media.type === 'video'
                                ? formatVideoDuration(media.durationSeconds)
                                : null;

                        return (
                            <Button
                                variant="ghost"
                                key={
                                    media.type === 'image'
                                        ? media.image.sourceKey
                                        : media.videoUrl
                                }
                                type="button"
                                aria-label={
                                    media.type === 'video'
                                        ? 'Xem video sản phẩm'
                                        : `Xem ảnh ${index + 1}`
                                }
                                aria-pressed={isActive}
                                onClick={() => setActiveIndex(index)}
                                className={cn(
                                    'relative shrink-0 snap-start overflow-hidden rounded border bg-zinc-50 transition-colors',
                                    compact
                                        ? 'size-14 sm:size-16'
                                        : 'size-16 sm:size-20',
                                    isActive
                                        ? 'border-zinc-950 ring-1 ring-zinc-950'
                                        : 'border-zinc-200 hover:border-zinc-500',
                                )}
                            >
                                {media.type === 'image' ? (
                                    <Image
                                        src={media.image.imageUrl}
                                        alt={
                                            media.image.altText ||
                                            `${productName} ${index + 1}`
                                        }
                                        fill
                                        sizes="80px"
                                        className="object-contain p-1"
                                    />
                                ) : (
                                    <>
                                        {media.posterUrl ? (
                                            <Image
                                                src={media.posterUrl}
                                                alt=""
                                                fill
                                                sizes="80px"
                                                aria-hidden="true"
                                                className="object-cover opacity-75"
                                            />
                                        ) : null}
                                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-zinc-950/35 text-white">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-950 shadow-sm">
                                                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-medium">
                                                <Video className="h-3 w-3" />
                                                {duration ?? 'Video'}
                                            </span>
                                        </span>
                                    </>
                                )}
                            </Button>
                        );
                    })}
                </div>
            ) : null}

            <p
                className={cn(
                    'text-center text-xs text-zinc-500',
                    compact ? 'mt-2' : 'mt-3',
                )}
            >
                {galleryMedia.length > 0
                    ? `${activeIndex + 1} / ${galleryMedia.length} nội dung`
                    : 'Chưa có media'}
            </p>
        </section>
    );
}
