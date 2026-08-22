'use client';

import { ImageOff, Package, PlayCircle, Store } from 'lucide-react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';

interface ProductCreatePreviewProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
}

// Định dạng giá thấp nhất của các phân loại để preview giống thẻ sản phẩm khi đang bán.
function formatPrice(value: string | number | undefined): string {
    const price = Number(value);

    return Number.isFinite(price) && price > 0
        ? `${new Intl.NumberFormat('vi-VN').format(price)} đ`
        : 'Chưa có giá';
}

// Render preview từ chính dữ liệu người bán đang nhập; đây không phải trang công khai của sản phẩm.
export function ProductCreatePreview({ form }: ProductCreatePreviewProps) {
    const values = useWatch({ control: form.control });
    const thumbnail = values.images?.[0];
    const lowestPrice = values.variants
        ?.map((variant) => Number(variant.price))
        .filter((price) => Number.isFinite(price) && price > 0)
        .sort((left, right) => left - right)[0];

    return (
        <aside className="self-start">
            <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-4 py-3">
                    <p className="text-sm font-semibold text-zinc-950">Xem trước</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        Cách sản phẩm có thể hiển thị với khách hàng
                    </p>
                </div>

                <div className="p-4">
                    <div className="aspect-square overflow-hidden rounded-md bg-zinc-100">
                        {thumbnail ? (
                            // Hiển thị Object URL trước để người bán không phải chờ CDN phản hồi sau khi chọn ảnh.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={thumbnail.previewUrl || thumbnail.publicUrl}
                                alt={values.name || 'Ảnh xem trước sản phẩm'}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full flex-col items-center justify-center gap-2 text-zinc-400">
                                <ImageOff className="size-7" />
                                <span className="text-xs">Chưa có ảnh sản phẩm</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
                        <span>{values.images?.length ?? 0}/9 ảnh</span>
                        {values.video ? (
                            <span className="inline-flex items-center gap-1 text-zinc-700">
                                <PlayCircle className="size-3.5" />
                                Có video
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-zinc-950">
                        {values.name?.trim() || 'Tên sản phẩm sẽ hiển thị tại đây'}
                    </p>
                    <p className="mt-2 text-base font-semibold text-zinc-950">{formatPrice(lowestPrice)}</p>

                    <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                        <div className="flex items-center gap-2">
                            <Store className="size-3.5" />
                            <span>Shop của bạn</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Package className="size-3.5" />
                            <span>{values.variants?.length ?? 0} phân loại có sẵn</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
