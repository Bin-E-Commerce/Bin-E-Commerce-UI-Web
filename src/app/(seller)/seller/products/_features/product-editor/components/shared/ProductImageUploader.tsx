'use client';

//
// Khu vực tải, sắp xếp và xoá ảnh sản phẩm trong form seller.
// Component chỉ điều khiển trải nghiệm chọn ảnh và gọi hook upload; việc validate file,
// dọn asset và cập nhật form vẫn thuộc về useProductImageUpload.
//

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
                    <div
                        key={image.assetId}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-zinc-400 hover:shadow-lg"
                    >
                        {/* Hiển thị Object URL trước để người bán không phải chờ CDN phản hồi sau khi chọn ảnh. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.previewUrl || image.publicUrl}
                            alt={image.fileName}
                            className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />
                        {index === 0 ? (
                            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                                <Check className="size-3" />
                                Ảnh bìa
                            </span>
                        ) : null}
                        <div className="absolute inset-x-2 bottom-2 flex translate-y-2 items-center justify-center gap-1.5 rounded-lg bg-zinc-950/85 p-1.5 opacity-0 backdrop-blur-sm transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                            {index !== 0 ? (
                                <Button
                                    type="button"
                                    size="icon-sm"
                                    variant="ghost"
                                    title="Đặt làm ảnh bìa"
                                    className="text-white transition-transform hover:scale-110 hover:bg-white/15 hover:text-white"
                                    onClick={() => upload.setThumbnail(image.assetId)}
                                >
                                    <Star className="size-4" />
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                title="Xóa ảnh"
                                className="text-white transition-transform hover:scale-110 hover:bg-white/15 hover:text-white"
                                onClick={() => upload.removeImage(image.assetId)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {images.length < PRODUCT_MAX_IMAGE_COUNT ? <button type="button" disabled={upload.uploading} className="group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-600 shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-zinc-950 hover:bg-white hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60" onClick={upload.openFilePicker}>
                    {upload.uploading ? <><Loader2 className="size-5 animate-spin" />{upload.progress}%</> : <><span className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110"><ImagePlus className="size-5" /></span><span className="font-medium">Thêm ảnh</span></>}
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
