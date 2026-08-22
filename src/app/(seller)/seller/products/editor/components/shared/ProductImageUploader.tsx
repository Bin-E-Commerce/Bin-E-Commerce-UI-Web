'use client';

import { Check, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { PRODUCT_MAX_IMAGE_COUNT, PRODUCT_MIN_IMAGE_COUNT, useProductImageUpload } from '../../hooks/useProductImageUpload';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';

interface ProductImageUploaderProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
    images: SellerProductCreateFormValues['images'];
    error?: string;
}

// Hiển thị ảnh theo thứ tự payload; ảnh đầu tiên được dùng làm ảnh bìa của sản phẩm.
export function ProductImageUploader({ form, images, error }: ProductImageUploaderProps) {
    const upload = useProductImageUpload({ images, setValue: form.setValue });

    return (
        <div className="space-y-3">
            <input ref={upload.inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void upload.selectFiles(event)} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {images.map((image, index) => (
                    <div key={image.assetId} className="group relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                        {/* Hiển thị Object URL trước để người bán không phải chờ CDN phản hồi sau khi chọn ảnh. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.previewUrl || image.publicUrl} alt={image.fileName} className="size-full object-cover" />
                        {index === 0 ? <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-zinc-950 px-2 py-1 text-[11px] font-medium text-white"><Check className="size-3" />Ảnh bìa</span> : null}
                        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1 bg-zinc-950/80 p-2 transition-transform group-hover:translate-y-0 group-focus-within:translate-y-0">
                            {index !== 0 ? <Button type="button" size="icon-sm" variant="ghost" title="Đặt làm ảnh bìa" className="text-white hover:bg-white/15 hover:text-white" onClick={() => upload.setThumbnail(image.assetId)}><Star className="size-4" /></Button> : null}
                            <Button type="button" size="icon-sm" variant="ghost" title="Xóa ảnh" className="text-white hover:bg-white/15 hover:text-white" onClick={() => upload.removeImage(image.assetId)}><Trash2 className="size-4" /></Button>
                        </div>
                    </div>
                ))}
                {images.length < PRODUCT_MAX_IMAGE_COUNT ? <button type="button" disabled={upload.uploading} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-600 transition-colors hover:border-zinc-500 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60" onClick={upload.openFilePicker}>
                    {upload.uploading ? <><Loader2 className="size-5 animate-spin" />{upload.progress}%</> : <><ImagePlus className="size-5" />Thêm ảnh</>}
                </button> : null}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span>JPG, PNG hoặc WebP, tối đa 5 MB mỗi ảnh. Cần ít nhất {PRODUCT_MIN_IMAGE_COUNT} ảnh.</span>
                <span>{images.length}/{PRODUCT_MAX_IMAGE_COUNT} ảnh</span>
            </div>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
    );
}
