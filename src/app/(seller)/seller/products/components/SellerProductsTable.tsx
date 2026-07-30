import Image from 'next/image';
import Link from 'next/link';
import { Eye, ImageOff, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { SellerProductListItem } from '@/services/product';
import {
    formatSellerProductMetric,
    formatSellerProductPriceRange,
    formatSellerProductUpdatedAt,
} from '../utils/seller-product-formatters';
import { SellerProductStatusBadge } from './SellerProductStatusBadge';

interface SellerProductsTableProps {
    products: SellerProductListItem[];
}

interface ProductThumbnailProps {
    product: SellerProductListItem;
    className?: string;
}

// Render ảnh đại diện có kích thước cố định; sản phẩm thiếu ảnh dùng icon thay thế để hàng bảng không co giãn.
function ProductThumbnail({
    product,
    className = 'size-16',
}: ProductThumbnailProps) {
    if (!product.thumbnailUrl) {
        return (
            <span
                className={`${className} flex shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-400`}
            >
                <ImageOff className="size-5" />
            </span>
        );
    }

    return (
        <span
            className={`${className} relative block shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-white`}
        >
            <Image
                src={product.thumbnailUrl}
                alt={product.name}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
            />
        </span>
    );
}

// Hiển thị bảng desktop với các dữ liệu seller cần quét nhanh: giá, kho, hiệu suất và trạng thái.
function DesktopProductsTable({
    products,
}: SellerProductsTableProps) {
    return (
        <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] border-collapse text-left">
                <thead className="bg-zinc-50 text-xs font-medium uppercase text-zinc-500">
                    <tr>
                        <th className="w-[38%] px-6 py-3">Sản phẩm</th>
                        <th className="px-4 py-3">Giá bán</th>
                        <th className="px-4 py-3">Kho hàng</th>
                        <th className="px-4 py-3">Hiệu suất</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Cập nhật</th>
                        <th className="w-16 px-4 py-3 text-right">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {products.map((product) => (
                        <tr
                            key={product.id}
                            className="transition-colors hover:bg-zinc-50/80"
                        >
                            <td className="px-6 py-4 align-top">
                                <div className="flex gap-3">
                                    <ProductThumbnail product={product} />
                                    <div className="min-w-0">
                                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-950">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-zinc-500">
                                            SKU:{' '}
                                            {product.primarySku ??
                                                'Chưa có SKU'}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            {product.variantCount} phân loại
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 align-top text-sm font-medium text-zinc-950">
                                {formatSellerProductPriceRange(
                                    product.minPrice,
                                    product.maxPrice,
                                )}
                            </td>
                            <td className="px-4 py-4 align-top">
                                <p
                                    className={
                                        product.totalStock === 0
                                            ? 'text-sm font-semibold text-amber-700'
                                            : 'text-sm font-semibold text-zinc-950'
                                    }
                                >
                                    {formatSellerProductMetric(
                                        product.totalStock,
                                    )}
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    sản phẩm
                                </p>
                            </td>
                            <td className="px-4 py-4 align-top">
                                <p className="text-sm font-medium text-zinc-950">
                                    {formatSellerProductMetric(
                                        product.totalSold,
                                    )}{' '}
                                    đã bán
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                    <Star className="size-3 fill-current" />
                                    {product.ratingAvg ?? 'Chưa có'} ·{' '}
                                    {product.reviewCount} đánh giá
                                </p>
                            </td>
                            <td className="px-4 py-4 align-top">
                                <SellerProductStatusBadge
                                    status={product.status}
                                />
                            </td>
                            <td className="px-4 py-4 align-top text-xs leading-5 text-zinc-500">
                                {formatSellerProductUpdatedAt(
                                    product.updatedAt,
                                )}
                            </td>
                            <td className="px-4 py-4 text-right align-top">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Xem sản phẩm"
                                    aria-label={`Xem ${product.name}`}
                                    render={
                                        <Link
                                            href={`/products/${product.id}`}
                                        />
                                    }
                                >
                                    <Eye className="size-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Chuyển mỗi dòng bảng thành khối thông tin dọc trên mobile để không bắt người dùng cuộn ngang.
function MobileProductsList({ products }: SellerProductsTableProps) {
    return (
        <div className="divide-y divide-zinc-100 lg:hidden">
            {products.map((product) => (
                <article key={product.id} className="space-y-4 p-4 sm:p-5">
                    <div className="flex gap-3">
                        <ProductThumbnail
                            product={product}
                            className="size-20"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <p className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-950">
                                    {product.name}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="-mr-2 -mt-2 shrink-0"
                                    title="Xem sản phẩm"
                                    aria-label={`Xem ${product.name}`}
                                    render={
                                        <Link
                                            href={`/products/${product.id}`}
                                        />
                                    }
                                >
                                    <Eye className="size-4" />
                                </Button>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                                SKU: {product.primarySku ?? 'Chưa có SKU'}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-zinc-950">
                                {formatSellerProductPriceRange(
                                    product.minPrice,
                                    product.maxPrice,
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-md bg-zinc-50 p-3">
                        <div>
                            <p className="text-[11px] text-zinc-500">
                                Tồn kho
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {formatSellerProductMetric(
                                    product.totalStock,
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] text-zinc-500">
                                Đã bán
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {formatSellerProductMetric(
                                    product.totalSold,
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-[11px] text-zinc-500">
                                Phân loại
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {product.variantCount}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <SellerProductStatusBadge status={product.status} />
                        <p className="text-right text-xs text-zinc-500">
                            {formatSellerProductUpdatedAt(product.updatedAt)}
                        </p>
                    </div>
                </article>
            ))}
        </div>
    );
}

// Chọn bảng desktop hoặc danh sách mobile bằng CSS để không nhân đôi request và state.
export function SellerProductsTable({
    products,
}: SellerProductsTableProps) {
    return (
        <>
            <DesktopProductsTable products={products} />
            <MobileProductsList products={products} />
        </>
    );
}
