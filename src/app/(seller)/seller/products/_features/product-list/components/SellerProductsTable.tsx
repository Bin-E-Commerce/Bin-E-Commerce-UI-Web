//  Bảng sản phẩm seller trên desktop/mobile; giới hạn vùng tên để các cột vận hành luôn dễ quét.

import Image from 'next/image';
import { ImageOff, Star } from 'lucide-react';

import type { SellerProductListItem } from '@/services/product';
import {
    formatSellerProductPrice,
    formatSellerProductMetric,
    formatSellerProductPriceRange,
    formatSellerProductUpdatedAt,
} from '../../product-shared/utils/seller-product-formatters';
import { SellerProductStatusBadge } from '../../product-shared/components/SellerProductStatusBadge';
import type { SellerProductPublicationStatus } from '@/services/product';
import { SellerProductActionsMenu } from '../../product-shared/components/SellerProductActionsMenu';

interface SellerProductsTableProps {
    products: SellerProductListItem[];
    onDelete: (product: SellerProductListItem) => void;
    onRestore: (product: SellerProductListItem) => void;
    onChangeStatus: (product: SellerProductListItem, status: SellerProductPublicationStatus) => void;
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

// Hiển thị giá desktop theo cấu trúc rõ ràng; khoảng giá được tách thành hai dòng để seller quét nhanh mà không bị text wrap ngẫu nhiên.
function ProductPrice({ minPrice, maxPrice }: { minPrice: string; maxPrice: string }) {
    const isRange = Number(minPrice) !== Number(maxPrice);

    if (!isRange) {
        return (
            <p className="whitespace-nowrap text-[15px] font-semibold leading-5 tracking-tight tabular-nums text-zinc-950">
                {formatSellerProductPrice(minPrice)}
            </p>
        );
    }

    return (
        <div className="relative space-y-1 border-l border-zinc-200 pl-3">
            <p className="flex items-baseline gap-1.5 whitespace-nowrap leading-5">
                <span className="w-6 shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">Từ</span>
                <span className="text-[15px] font-semibold tracking-tight tabular-nums text-zinc-950">{formatSellerProductPrice(minPrice)}</span>
            </p>
            <p className="flex items-baseline gap-1.5 whitespace-nowrap leading-5">
                <span className="w-6 shrink-0 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">Đến</span>
                <span className="text-[15px] font-semibold tracking-tight tabular-nums text-zinc-950">{formatSellerProductPrice(maxPrice)}</span>
            </p>
        </div>
    );
}

// Hiển thị bảng desktop với các dữ liệu seller cần quét nhanh: giá, kho, hiệu suất và trạng thái.
function DesktopProductsTable({
    products,
    onDelete,
    onRestore,
    onChangeStatus,
}: SellerProductsTableProps) {
    return (
        <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px] table-fixed border-collapse text-left">
                <colgroup>
                    <col className="w-[25%]" />
                    <col className="w-[13%]" />
                    <col className="w-[9%]" />
                    <col className="w-[15%]" />
                    <col className="w-[13%]" />
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-zinc-50 text-xs font-medium uppercase text-zinc-500">
                    <tr>
                        <th className="min-w-[260px] px-6 py-3">Sản phẩm</th>
                        <th className="px-4 py-3">Giá bán</th>
                        <th className="px-4 py-3">Kho hàng</th>
                        <th className="px-4 py-3">Hiệu suất</th>
                        <th className="min-w-[126px] px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Cập nhật</th>
                        <th className="w-28 min-w-[112px] whitespace-nowrap px-4 py-3 text-right">
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
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="block max-w-[260px] truncate text-sm font-semibold leading-5 text-zinc-950"
                                            title={product.name}
                                        >
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
                            <td className="px-4 py-4 align-top">
                                <ProductPrice minPrice={product.minPrice} maxPrice={product.maxPrice} />
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
                                <p className="mt-1 flex items-center gap-1 whitespace-nowrap text-xs text-zinc-500">
                                    <Star className="size-3 fill-current" />
                                    {product.ratingAvg ?? 'Chưa có'} ·{' '}
                                    {product.reviewCount} đánh giá
                                </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 align-top">
                                <SellerProductStatusBadge
                                    status={product.status}
                                />
                            </td>
                            <td className="px-4 py-4 align-top text-xs leading-5 text-zinc-500">
                                <span className="block text-[11px] uppercase tracking-wide text-zinc-400">
                                    {product.status === 'DELETED'
                                        ? 'Đã xóa'
                                        : 'Cập nhật'}
                                </span>
                                {formatSellerProductUpdatedAt(
                                    product.deletedAt ?? product.updatedAt,
                                )}
                            </td>
                            <td className="px-4 py-4 align-top text-right">
                                <div className="flex justify-end">
                                    <SellerProductActionsMenu
                                        product={product}
                                        onDelete={onDelete}
                                        onRestore={onRestore}
                                        onChangeStatus={onChangeStatus}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Chuyển mỗi dòng bảng thành khối thông tin dọc trên mobile để không bắt người dùng cuộn ngang.
function MobileProductsList({ products, onDelete, onRestore, onChangeStatus }: SellerProductsTableProps) {
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
                                <SellerProductActionsMenu
                                    product={product}
                                    onDelete={onDelete}
                                    onRestore={onRestore}
                                    onChangeStatus={onChangeStatus}
                                />
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
                            <span className="block text-[11px] uppercase tracking-wide text-zinc-400">
                                {product.status === 'DELETED'
                                    ? 'Đã xóa'
                                    : 'Cập nhật'}
                            </span>
                            {formatSellerProductUpdatedAt(
                                product.deletedAt ?? product.updatedAt,
                            )}
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
    onDelete,
    onRestore,
    onChangeStatus,
}: SellerProductsTableProps) {
    return (
        <>
            <DesktopProductsTable
                products={products}
                onDelete={onDelete}
                onRestore={onRestore}
                onChangeStatus={onChangeStatus}
            />
            <MobileProductsList
                products={products}
                onDelete={onDelete}
                onRestore={onRestore}
                onChangeStatus={onChangeStatus}
            />
        </>
    );
}
