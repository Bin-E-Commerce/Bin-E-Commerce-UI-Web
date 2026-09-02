// File này cung cấp modal xem media dùng chung cho review và bằng chứng hoàn hàng.
// Component quản lý điều hướng, preview và vòng đời modal; dữ liệu upload/xóa media thuộc về component cha.

'use client';

import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';

export interface ImageLightboxMedia {
    url: string;
    type: 'image' | 'video';
    label: string;
}

interface ImageLightboxThumbnailProps {
    item: ImageLightboxMedia;
    onClick: () => void;
    onRemove?: () => void;
}

interface ImageLightboxProps {
    images?: string[];
    videos?: string[];
    media?: ImageLightboxMedia[];
    initialIndex: number;
    onClose: () => void;
    title?: string;
    altPrefix?: string;
}

// Render thumbnail thống nhất cho ảnh/video, hỗ trợ cả URL CDN và blob URL của file đang chọn.
export function ImageLightboxThumbnail({
    item,
    onClick,
    onRemove,
}: ImageLightboxThumbnailProps) {
    return (
        <div className="group relative">
            <button
                type="button"
                onClick={onClick}
                aria-label={`Xem ${item.label}`}
                className="relative block size-20 cursor-zoom-in overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-left shadow-sm transition hover:border-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
                {item.type === 'image' ? (
                    // Ảnh có thể là blob URL local hoặc CDN URL nên không dùng next/image ở thumbnail này.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.url}
                        alt={item.label}
                        className="size-full object-cover"
                    />
                ) : (
                    <>
                        <video
                            src={item.url}
                            preload="metadata"
                            muted
                            playsInline
                            className="size-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/35 text-white">
                            <Play
                                className="size-6 fill-current"
                                aria-hidden="true"
                            />
                        </span>
                    </>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-zinc-950/65 px-1.5 py-1 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                    Xem
                </span>
            </button>
            {onRemove ? (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Xóa ${item.label}`}
                    className="absolute -right-2 -top-2 flex size-6 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-950 hover:text-white"
                >
                    <X className="size-3.5" aria-hidden="true" />
                </button>
            ) : null}
        </div>
    );
}

// Hiển thị bộ ảnh/video trong modal sáng, có điều hướng bàn phím và thumbnail để tái sử dụng ở nhiều domain.
export function ImageLightbox({
    images = [],
    videos = [],
    media,
    initialIndex,
    onClose,
    title = 'Xem media',
    altPrefix = 'Media',
}: ImageLightboxProps) {
    const mediaItems = media ?? [
        ...images.map((url, index) => ({
            url,
            type: 'image' as const,
            label: `${altPrefix} ảnh ${index + 1}`,
        })),
        ...videos.map((url, index) => ({
            url,
            type: 'video' as const,
            label: `${altPrefix} video ${index + 1}`,
        })),
    ];
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    // Khóa scroll nền và điều hướng bằng Escape/mũi tên; chỉ gắn listener khi modal thật sự có media.
    useEffect(() => {
        if (!mediaItems.length) return undefined;

        // Điều hướng chỉ thay đổi index, còn onClose vẫn do component cha kiểm soát để giữ đúng lifecycle.
        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') {
                setActiveIndex(
                    (index) =>
                        (index - 1 + mediaItems.length) % mediaItems.length,
                );
            }
            if (event.key === 'ArrowRight') {
                setActiveIndex((index) => (index + 1) % mediaItems.length);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [mediaItems.length, onClose]);

    // Đóng modal khi click nền nhưng giữ nguyên khi người dùng click media hoặc nút điều khiển.
    function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
        if (event.target === event.currentTarget) onClose();
    }

    if (!mediaItems.length) return null;

    const safeIndex = Math.min(Math.max(activeIndex, 0), mediaItems.length - 1);
    const activeMedia = mediaItems[safeIndex];

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/35 p-3 backdrop-blur-[3px] sm:p-6"
            onClick={handleBackdropClick}
        >
            <div className="relative flex h-[min(88vh,880px)] w-[min(94vw,1220px)] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.22)]">
                <div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3.5 sm:px-6">
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">
                            {title}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Media {safeIndex + 1} / {mediaItems.length}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng trình xem media"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                    >
                        <X className="size-4.5" aria-hidden="true" />
                    </button>
                </div>
                <div className="relative min-h-0 flex-1 bg-zinc-50/80">
                    {activeMedia.type === 'image' ? (
                        // Native image giữ tương thích với URL S3 cũ, CDN URL mới và blob URL trong form local.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={activeMedia.url}
                            alt={`${altPrefix} ${safeIndex + 1}`}
                            className="size-full object-contain p-4 sm:p-8"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center p-4 sm:p-8">
                            <video
                                src={activeMedia.url}
                                controls
                                autoPlay
                                playsInline
                                className="max-h-full max-w-full rounded-xl bg-zinc-950 shadow-sm"
                                aria-label={activeMedia.label}
                            />
                        </div>
                    )}
                    {mediaItems.length > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveIndex(
                                        (index) =>
                                            (index - 1 + mediaItems.length) %
                                            mediaItems.length,
                                    )
                                }
                                aria-label="Media trước"
                                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 sm:left-5"
                            >
                                <ChevronLeft
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveIndex(
                                        (index) =>
                                            (index + 1) % mediaItems.length,
                                    )
                                }
                                aria-label="Media tiếp theo"
                                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 sm:right-5"
                            >
                                <ChevronRight
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </button>
                        </>
                    ) : null}
                </div>
                {mediaItems.length > 1 ? (
                    <div className="border-t border-zinc-100 bg-white px-4 py-3 sm:px-6">
                        <div className="flex gap-2 overflow-x-auto pb-0.5">
                            {mediaItems.map((item, index) => (
                                <button
                                    key={`${item.url}-${index}`}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Xem ${item.label}`}
                                    aria-current={
                                        safeIndex === index ? 'true' : undefined
                                    }
                                    className={`relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-zinc-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${safeIndex === index ? 'border-zinc-950 ring-2 ring-zinc-950/10' : 'border-zinc-200 opacity-65 hover:opacity-100'}`}
                                >
                                    {item.type === 'image' ? (
                                        // Thumbnail trong modal cũng cần hỗ trợ ảnh gốc từ S3.
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={item.url}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <>
                                            <video
                                                src={item.url}
                                                preload="metadata"
                                                muted
                                                playsInline
                                                className="size-full object-cover"
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/35 text-white">
                                                <Play
                                                    className="size-4 fill-current"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
