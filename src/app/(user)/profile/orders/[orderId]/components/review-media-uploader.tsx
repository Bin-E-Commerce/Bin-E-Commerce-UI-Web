// Component này chọn, xem lại và xóa ảnh/video trước khi gửi review.
// Component cha chỉ upload khi khách gửi đánh giá để tránh tạo media chưa được sử dụng.
'use client';
import { Button } from '@/components/ui/button';

import { ImagePlus, Video, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    ImageLightbox,
    type ImageLightboxMedia,
} from '@/common/reviews/components/ImageLightbox';

type ReviewMediaUploaderProps = {
    images: File[];
    videos: File[];
    existingImages?: string[];
    existingVideos?: string[];
    onImagesChange: (files: File[]) => void;
    onVideosChange: (files: File[]) => void;
    onExistingImagesChange?: (urls: string[]) => void;
    onExistingVideosChange?: (urls: string[]) => void;
    disabled?: boolean;
};

const MAX_REVIEW_IMAGES = 5;
const MAX_REVIEW_VIDEOS = 1;
const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_REVIEW_VIDEO_SIZE = 30 * 1024 * 1024;
const REVIEW_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const REVIEW_VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

type ReviewPreview = { file: File; url: string };

// Tạo preview cục bộ và thu hồi object URL khi file thay đổi hoặc component unmount.
function useReviewPreviews(files: File[]): ReviewPreview[] {
    const previews = useMemo(
        () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [files],
    );

    useEffect(
        () => () =>
            previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
        [previews],
    );
    return previews;
}

// Lọc ảnh tại browser để người dùng nhận lỗi đúng trước khi gọi Media Service.
function appendValidImages(
    currentFiles: File[],
    selectedFiles: File[],
): File[] {
    const acceptedFiles = selectedFiles.filter((file) => {
        if (!REVIEW_IMAGE_TYPES.has(file.type)) {
            toast.error('Ảnh đánh giá chỉ hỗ trợ JPG, PNG hoặc WebP.');
            return false;
        }
        if (file.size > MAX_REVIEW_IMAGE_SIZE) {
            toast.error('Mỗi ảnh đánh giá không được vượt quá 5MB.');
            return false;
        }
        return true;
    });

    if (currentFiles.length + acceptedFiles.length > MAX_REVIEW_IMAGES) {
        toast.error('Bạn chỉ có thể thêm tối đa 5 ảnh cho một đánh giá.');
    }
    return [...currentFiles, ...acceptedFiles].slice(0, MAX_REVIEW_IMAGES);
}

// Chỉ cho phép một video review và giới hạn dung lượng để trang chi tiết tải nhanh.
function appendValidVideo(currentFiles: File[], selectedFiles: File[]): File[] {
    const file = selectedFiles[0];
    if (!file) return currentFiles;
    if (!REVIEW_VIDEO_TYPES.has(file.type)) {
        toast.error('Video đánh giá chỉ hỗ trợ MP4 hoặc WebM.');
        return currentFiles;
    }
    if (file.size > MAX_REVIEW_VIDEO_SIZE) {
        toast.error('Video đánh giá không được vượt quá 30MB.');
        return currentFiles;
    }
    return [file];
}

// Render thumbnail mở được lightbox; nút xóa riêng vẫn giữ để thao tác xem không làm mất media.
export function ReviewMediaUploader({
    images,
    videos,
    existingImages = [],
    existingVideos = [],
    onImagesChange,
    onVideosChange,
    onExistingImagesChange,
    onExistingVideosChange,
    disabled = false,
}: ReviewMediaUploaderProps) {
    const imagePreviews = useReviewPreviews(images);
    const videoPreviews = useReviewPreviews(videos);
    const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(
        null,
    );
    const previewMedia: ImageLightboxMedia[] = [
        ...existingImages.map((url, index) => ({
            url,
            type: 'image' as const,
            label: `Ảnh đánh giá cũ ${index + 1}`,
        })),
        ...imagePreviews.map((preview, index) => ({
            url: preview.url,
            type: 'image' as const,
            label: `Ảnh đánh giá ${index + 1}`,
        })),
        ...existingVideos.map((url, index) => ({
            url,
            type: 'video' as const,
            label: `Video đánh giá cũ ${index + 1}`,
        })),
        ...videoPreviews.map((preview, index) => ({
            url: preview.url,
            type: 'video' as const,
            label: `Video đánh giá ${index + 1}`,
        })),
    ];

    return (
        <div className="mt-3">
            <div className="flex flex-wrap gap-2">
                {existingImages.map((imageUrl, index) => (
                    <div
                        key={`existing-image-${imageUrl}`}
                        className="group relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-white"
                    >
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label={`Xem ảnh đánh giá cũ ${index + 1}`}
                            onClick={() => setActiveMediaIndex(index)}
                            className="absolute inset-0 size-full rounded-lg p-0 hover:bg-transparent"
                        >
                            <Image
                                src={imageUrl}
                                alt={`Ảnh đánh giá cũ ${index + 1}`}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-zinc-950/35 group-hover:opacity-100">
                                Xem
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label={`Xóa ảnh cũ ${index + 1}`}
                            onClick={() =>
                                onExistingImagesChange?.(
                                    existingImages.filter(
                                        (_, urlIndex) => urlIndex !== index,
                                    ),
                                )
                            }
                            disabled={disabled}
                            className="absolute right-1 top-1 z-10 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50"
                        >
                            <X className="size-3" aria-hidden="true" />
                        </Button>
                    </div>
                ))}
                {imagePreviews.map((preview, index) => (
                    <div
                        key={`${preview.file.name}-${preview.file.lastModified}`}
                        className="group relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-white"
                    >
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label={`Xem ảnh đánh giá ${index + 1}`}
                            onClick={() =>
                                setActiveMediaIndex(
                                    existingImages.length + index,
                                )
                            }
                            className="absolute inset-0 size-full rounded-lg p-0 hover:bg-transparent"
                        >
                            <Image
                                src={preview.url}
                                alt={`Ảnh đánh giá ${index + 1}`}
                                fill
                                sizes="64px"
                                unoptimized
                                className="object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-zinc-950/35 group-hover:opacity-100">
                                Xem
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label={`Xóa ảnh ${index + 1}`}
                            onClick={() =>
                                onImagesChange(
                                    images.filter(
                                        (_, fileIndex) => fileIndex !== index,
                                    ),
                                )
                            }
                            disabled={disabled}
                            className="absolute right-1 top-1 z-10 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50"
                        >
                            <X className="size-3" aria-hidden="true" />
                        </Button>
                    </div>
                ))}
                {existingVideos.map((videoUrl, index) => (
                    <div
                        key={`existing-video-${videoUrl}`}
                        className="group relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950"
                    >
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label={`Xem video đánh giá cũ ${index + 1}`}
                            onClick={() =>
                                setActiveMediaIndex(
                                    existingImages.length +
                                        images.length +
                                        index,
                                )
                            }
                            className="absolute inset-0 size-full rounded-lg p-0 text-white hover:bg-transparent"
                        >
                            <video
                                src={videoUrl}
                                muted
                                playsInline
                                className="size-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/25 text-white transition group-hover:bg-zinc-950/50">
                                <Video
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label="Xóa video cũ"
                            onClick={() =>
                                onExistingVideosChange?.(
                                    existingVideos.filter(
                                        (_, urlIndex) => urlIndex !== index,
                                    ),
                                )
                            }
                            disabled={disabled}
                            className="absolute right-1 top-1 z-10 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50"
                        >
                            <X className="size-3" aria-hidden="true" />
                        </Button>
                    </div>
                ))}
                {videoPreviews.map((preview) => (
                    <div
                        key={`${preview.file.name}-${preview.file.lastModified}`}
                        className="group relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950"
                    >
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label="Xem video đánh giá"
                            onClick={() =>
                                setActiveMediaIndex(
                                    existingImages.length +
                                        images.length +
                                        existingVideos.length,
                                )
                            }
                            className="absolute inset-0 size-full rounded-lg p-0 text-white hover:bg-transparent"
                        >
                            <video
                                src={preview.url}
                                muted
                                playsInline
                                className="size-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-zinc-950/25 text-white transition group-hover:bg-zinc-950/50">
                                <Video
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            aria-label="Xóa video"
                            onClick={() => onVideosChange([])}
                            disabled={disabled}
                            className="absolute right-1 top-1 z-10 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50"
                        >
                            <X className="size-3" aria-hidden="true" />
                        </Button>
                    </div>
                ))}
                {existingImages.length + images.length < MAX_REVIEW_IMAGES ? (
                    <label className="flex size-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 bg-white text-[10px] font-medium text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                        <ImagePlus className="size-4" aria-hidden="true" />
                        <span>Thêm ảnh</span>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            disabled={disabled}
                            className="sr-only"
                            onChange={(event) => {
                                onImagesChange(
                                    appendValidImages(
                                        images,
                                        Array.from(event.target.files ?? []),
                                    ),
                                );
                                event.currentTarget.value = '';
                            }}
                        />
                    </label>
                ) : null}
                {existingVideos.length + videos.length < MAX_REVIEW_VIDEOS ? (
                    <label className="flex size-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 bg-white text-[10px] font-medium text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                        <Video className="size-4" aria-hidden="true" />
                        <span>Thêm video</span>
                        <input
                            type="file"
                            accept="video/mp4,video/webm"
                            disabled={disabled}
                            className="sr-only"
                            onChange={(event) => {
                                onVideosChange(
                                    appendValidVideo(
                                        videos,
                                        Array.from(event.target.files ?? []),
                                    ),
                                );
                                event.currentTarget.value = '';
                            }}
                        />
                    </label>
                ) : null}
            </div>
            <p className="mt-2 text-[11px] text-zinc-400">
                Tối đa 5 ảnh (5MB/ảnh) và 1 video MP4/WebM (30MB)
            </p>
            {activeMediaIndex !== null ? (
                <ImageLightbox
                    media={previewMedia}
                    initialIndex={activeMediaIndex}
                    onClose={() => setActiveMediaIndex(null)}
                    title="Xem ảnh và video đánh giá"
                    altPrefix="Media đánh giá"
                />
            ) : null}
        </div>
    );
}
