'use client';

import Image from 'next/image';
import {
    ChevronLeft,
    ChevronRight,
    ImageOff,
    Play,
    Video,
} from 'lucide-react';
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
}

// Đổi số giây từ API thành định dạng phút:giây để hiển thị nhất quán trên thumbnail video.
function formatVideoDuration(durationSeconds?: number | null): string | null {
    if (!Number.isFinite(durationSeconds) || !durationSeconds || durationSeconds < 0) {
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

// Hiển thị gallery sản phẩm với ảnh, video, thumbnail, điều hướng và trạng thái rỗng trên cùng một vùng tương tác.
export function ProductGallery({
    productName,
    images,
    videoUrl,
    videoDurationSeconds,
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
                (current + direction + galleryMedia.length) % galleryMedia.length,
        );
    }

    return (
        <section
            aria-label="Media sản phẩm"
            className="w-full min-w-0 overflow-hidden bg-white p-4 sm:p-6"
        >
            <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-50">
                {activeMedia?.type === 'image' ? (
                    <Image
                        src={activeMedia.image.imageUrl}
                        alt={activeMedia.image.altText || productName}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 46vw"
                        className="object-contain p-3 sm:p-6"
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
                        <span className="text-sm">Sản phẩm chưa có ảnh hoặc video</span>
                    </div>
                )}

                {galleryMedia.length > 1 ? (
                    <>
                        <button
                            type="button"
                            aria-label="Xem nội dung trước"
                            onClick={() => moveMedia(-1)}
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-950 hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Xem nội dung tiếp theo"
                            onClick={() => moveMedia(1)}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-950 hover:text-white"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                ) : null}
            </div>

            {galleryMedia.length > 1 ? (
                <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
                    {galleryMedia.map((media, index) => {
                        const isActive = activeIndex === index;
                        const duration =
                            media.type === 'video'
                                ? formatVideoDuration(media.durationSeconds)
                                : null;

                        return (
                            <button
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
                                    'relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded border bg-zinc-50 transition-colors sm:h-20 sm:w-20',
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
                            </button>
                        );
                    })}
                </div>
            ) : null}

            <p className="mt-3 text-center text-xs text-zinc-500">
                {galleryMedia.length > 0
                    ? `${activeIndex + 1} / ${galleryMedia.length} nội dung`
                    : 'Chưa có media'}
            </p>
        </section>
    );
}
