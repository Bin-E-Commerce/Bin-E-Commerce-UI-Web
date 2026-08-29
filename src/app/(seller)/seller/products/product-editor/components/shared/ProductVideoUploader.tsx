'use client';

import { Loader2, Play, Trash2, Video } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProductVideoUpload } from '../../hooks/useProductVideoUpload';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';

interface ProductVideoUploaderProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    video: SellerProductCreateFormValues['video'];
}

// Quản lý một video giới thiệu độc lập với ảnh sản phẩm để người bán có thể thay thế dễ dàng.
export function ProductVideoUploader({ form, video }: ProductVideoUploaderProps) {
    const upload = useProductVideoUpload({ video, setValue: form.setValue });

    return (
        <div className="space-y-3">
            <input ref={upload.inputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(event) => void upload.selectVideo(event)} />
            {video ? (
                <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 sm:flex-row sm:items-center">
                    <video src={video.previewUrl || video.publicUrl} controls className="aspect-video w-full max-w-56 rounded-md bg-zinc-950 object-cover" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-950">{video.fileName}</p>
                        <p className="mt-1 text-xs text-zinc-500">{video.durationSeconds} giây</p>
                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={upload.removeVideo}><Trash2 className="size-4" />Xóa video</Button>
                    </div>
                </div>
            ) : (
                <button type="button" disabled={upload.uploading} className={cn('flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-600 transition-colors', 'hover:border-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60')} onClick={upload.openFilePicker}>
                    {upload.uploading ? <><Loader2 className="size-5 animate-spin" />Đang tải {upload.progress}%</> : <><span className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm"><Video className="size-5" /></span><span className="font-medium">Tải video giới thiệu</span></>}
                </button>
            )}
            <p className="flex items-center gap-1 text-xs text-zinc-500"><Play className="size-3" />MP4 hoặc WebM, dài 10-60 giây, tối đa 30 MB.</p>
        </div>
    );
}
