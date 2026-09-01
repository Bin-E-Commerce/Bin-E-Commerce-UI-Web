'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';

interface ImageLightboxProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
    title?: string;
    altPrefix?: string;
}

// Hiển thị một bộ ảnh trong modal sáng, có điều hướng và thumbnail để tái sử dụng cho review, sản phẩm hoặc hồ sơ.
export function ImageLightbox({
    images,
    initialIndex,
    onClose,
    title = 'Xem ảnh',
    altPrefix = 'Ảnh',
}: ImageLightboxProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    // Hỗ trợ Escape, phím mũi tên và khóa cuộn nền để modal có hành vi quen thuộc trên desktop.
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowLeft') {
                setActiveIndex((index) => (index - 1 + images.length) % images.length);
            }
            if (event.key === 'ArrowRight') {
                setActiveIndex((index) => (index + 1) % images.length);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [images.length, onClose]);

    // Đóng modal khi click vùng nền nhưng giữ nguyên modal khi click ảnh hoặc nút điều hướng.
    function handleBackdropClick(event: MouseEvent<HTMLDivElement>): void {
        if (event.target === event.currentTarget) onClose();
    }

    if (images.length === 0) return null;

    const safeIndex = Math.min(Math.max(activeIndex, 0), images.length - 1);
    const imageUrl = images[safeIndex];

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
                        <p className="text-sm font-semibold text-zinc-950">{title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">Ảnh {safeIndex + 1} / {images.length}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng trình xem ảnh"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                    >
                        <X className="size-4.5" aria-hidden="true" />
                    </button>
                </div>
                <div className="relative min-h-0 flex-1 bg-zinc-50/80">
                    <Image
                        src={imageUrl}
                        alt={`${altPrefix} ${safeIndex + 1}`}
                        fill
                        sizes="94vw"
                        className="object-contain p-4 sm:p-8"
                    />
                    {images.length > 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setActiveIndex((index) => (index - 1 + images.length) % images.length)}
                                aria-label="Ảnh trước"
                                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 sm:left-5"
                            >
                                <ChevronLeft className="size-5" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveIndex((index) => (index + 1) % images.length)}
                                aria-label="Ảnh tiếp theo"
                                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-all hover:scale-105 hover:bg-zinc-950 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 sm:right-5"
                            >
                                <ChevronRight className="size-5" aria-hidden="true" />
                            </button>
                        </>
                    ) : null}
                </div>
                {images.length > 1 ? (
                    <div className="border-t border-zinc-100 bg-white px-4 py-3 sm:px-6">
                        <div className="flex gap-2 overflow-x-auto pb-0.5">
                            {images.map((thumbnailUrl, index) => (
                                <button
                                    key={`${thumbnailUrl}-${index}`}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Xem ${altPrefix.toLowerCase()} ${index + 1}`}
                                    aria-current={safeIndex === index ? 'true' : undefined}
                                    className={`relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-zinc-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${safeIndex === index ? 'border-zinc-950 ring-2 ring-zinc-950/10' : 'border-zinc-200 opacity-65 hover:opacity-100'}`}
                                >
                                    <Image src={thumbnailUrl} alt="" fill sizes="56px" className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
