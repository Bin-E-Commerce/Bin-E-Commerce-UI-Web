// Component nay cho phep chon, preview va xoa anh/video truoc khi submit review.
// Parent chi upload sau khi customer gui de tranh tao asset mo coi.
'use client';

import { ImagePlus, Video, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

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

// Tao preview cuc bo va thu hoi object URL khi file thay doi hoac component unmount.
function useReviewPreviews(files: File[]): ReviewPreview[] {
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);
  return previews;
}

// Loc anh tai browser de nguoi dung nhan loi dung truoc khi goi Media Service.
function appendValidImages(currentFiles: File[], selectedFiles: File[]): File[] {
  const acceptedFiles = selectedFiles.filter((file) => {
    if (!REVIEW_IMAGE_TYPES.has(file.type)) {
      toast.error('Anh danh gia chi ho tro JPG, PNG hoac WebP.');
      return false;
    }
    if (file.size > MAX_REVIEW_IMAGE_SIZE) {
      toast.error('Moi anh danh gia khong duoc vuot qua 5MB.');
      return false;
    }
    return true;
  });

  if (currentFiles.length + acceptedFiles.length > MAX_REVIEW_IMAGES) {
    toast.error('Ban chi co the them toi da 5 anh cho mot danh gia.');
  }
  return [...currentFiles, ...acceptedFiles].slice(0, MAX_REVIEW_IMAGES);
}

// Chi cho phep mot video review va gioi han dung luong de trang chi tiet tai nhanh.
function appendValidVideo(currentFiles: File[], selectedFiles: File[]): File[] {
  const file = selectedFiles[0];
  if (!file) return currentFiles;
  if (!REVIEW_VIDEO_TYPES.has(file.type)) {
    toast.error('Video danh gia chi ho tro MP4 hoac WebM.');
    return currentFiles;
  }
  if (file.size > MAX_REVIEW_VIDEO_SIZE) {
    toast.error('Video danh gia khong duoc vuot qua 30MB.');
    return currentFiles;
  }
  return [file];
}

// Render khu vuc media co preview rieng cho anh va video, giu thao tac xoa ro rang tren mobile.
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

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {existingImages.map((imageUrl, index) => (
          <div key={`existing-image-${imageUrl}`} className="relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Image src={imageUrl} alt={`Ảnh review cũ ${index + 1}`} fill sizes="64px" className="object-cover" />
            <button type="button" aria-label={`Xóa ảnh cũ ${index + 1}`} onClick={() => onExistingImagesChange?.(existingImages.filter((_, urlIndex) => urlIndex !== index))} disabled={disabled} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50">
              <X className="size-3" aria-hidden="true" />
            </button>
          </div>
        ))}
        {imagePreviews.map((preview, index) => (
          <div key={`${preview.file.name}-${preview.file.lastModified}`} className="relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Image src={preview.url} alt={`Anh review ${index + 1}`} fill sizes="64px" unoptimized className="object-cover" />
            <button type="button" aria-label={`Xoa anh ${index + 1}`} onClick={() => onImagesChange(images.filter((_, fileIndex) => fileIndex !== index))} disabled={disabled} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50">
              <X className="size-3" aria-hidden="true" />
            </button>
          </div>
        ))}
        {existingVideos.map((videoUrl, index) => (
          <div key={`existing-video-${videoUrl}`} className="relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950">
            <video src={videoUrl} muted playsInline className="size-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-white"><Video className="size-5" aria-hidden="true" /></span>
            <button type="button" aria-label="Xóa video cũ" onClick={() => onExistingVideosChange?.(existingVideos.filter((_, urlIndex) => urlIndex !== index))} disabled={disabled} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50">
              <X className="size-3" aria-hidden="true" />
            </button>
          </div>
        ))}
        {videoPreviews.map((preview) => (
          <div key={`${preview.file.name}-${preview.file.lastModified}`} className="relative size-16 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950">
            <video src={preview.url} muted playsInline className="size-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center text-white"><Video className="size-5" aria-hidden="true" /></span>
            <button type="button" aria-label="Xoa video" onClick={() => onVideosChange([])} disabled={disabled} className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-zinc-950/80 text-white disabled:opacity-50">
              <X className="size-3" aria-hidden="true" />
            </button>
          </div>
        ))}
        {existingImages.length + images.length < MAX_REVIEW_IMAGES ? (
          <label className="flex size-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 bg-white text-[10px] font-medium text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
            <ImagePlus className="size-4" aria-hidden="true" />
            <span>Them anh</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled} className="sr-only" onChange={(event) => { onImagesChange(appendValidImages(images, Array.from(event.target.files ?? []))); event.currentTarget.value = ''; }} />
          </label>
        ) : null}
        {existingVideos.length + videos.length < MAX_REVIEW_VIDEOS ? (
          <label className="flex size-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 bg-white text-[10px] font-medium text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
            <Video className="size-4" aria-hidden="true" />
            <span>Them video</span>
            <input type="file" accept="video/mp4,video/webm" disabled={disabled} className="sr-only" onChange={(event) => { onVideosChange(appendValidVideo(videos, Array.from(event.target.files ?? []))); event.currentTarget.value = ''; }} />
          </label>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] text-zinc-400">Toi da 5 anh (5MB/anh) va 1 video MP4/WebM (30MB)</p>
    </div>
  );
}
