'use client';

//
// Preview card mô phỏng cách sản phẩm xuất hiện trên storefront.
// Component chỉ đọc dữ liệu form để trình bày tức thời; nó không mutate form,
// không gọi API và không quyết định trạng thái publish của sản phẩm.
//

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
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md shadow-zinc-950/5">
                <div className="border-b border-zinc-100 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-zinc-950">Xem trước</p>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                            Storefront
                        </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-zinc-500">
                        Cách sản phẩm có thể hiển thị với khách hàng
                    </p>
                </div>

                <div className="p-5">
                    <div className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-inset ring-zinc-200">
                        {thumbnail ? (
                            // Hiển thị Object URL trước để người bán không phải chờ CDN phản hồi sau khi chọn ảnh.
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={thumbnail.previewUrl || thumbnail.publicUrl}
                                alt={values.name || 'Ảnh xem trước sản phẩm'}
                                className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            />
                        ) : (
                            <div className="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-400">
                                <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
                                    <ImageOff className="size-7" />
                                </span>
                                <span className="text-sm font-medium">Chưa có ảnh sản phẩm</span>
                            </div>
                        )}
                        {thumbnail ? (
                            <span className="absolute bottom-3 left-3 rounded-full bg-zinc-950/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                Ảnh bìa
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 text-sm text-zinc-500">
                        <span>{values.images?.length ?? 0}/9 ảnh</span>
                        {values.video ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700">
                                <PlayCircle className="size-4" />
                                Có video
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-4 line-clamp-2 min-h-12 text-base font-semibold leading-6 text-zinc-950">
                        {values.name?.trim() || 'Tên sản phẩm sẽ hiển thị tại đây'}
                    </p>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">{formatPrice(lowestPrice)}</p>

                    <div className="mt-5 space-y-2.5 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                                <Store className="size-4" />
                            </span>
                            <span>Shop của bạn</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                                <Package className="size-4" />
                            </span>
                            <span>{values.variants?.length ?? 0} phân loại có sẵn</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
