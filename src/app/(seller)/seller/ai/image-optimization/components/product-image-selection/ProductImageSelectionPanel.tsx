// Bộ chọn ảnh nguồn cho AI, tải gallery từ Product Service thay vì nhận URL tùy ý từ trình duyệt.

'use client';

import { useQuery } from '@tanstack/react-query';
import { ImageIcon, Loader2 } from 'lucide-react';
import { sellerProductService } from '@/services/product';
import { ProductImageOption } from './ProductImageOption';
import { getMediaAssetId } from './product-image-selection.utils';

interface ProductImageSelectionPanelProps {
    productId: string;
    selectedAssetIds: string[];
    disabled?: boolean;
    onChange: (selection: ProductImageSelection) => void;
}

interface ProductImageSelection {
    assetIds: string[];
    primaryImageUrl: string | null;
}

// Hiển thị gallery đã được Product Service xác thực để seller chọn chính xác một ảnh nguồn cho mỗi job.
export function ProductImageSelectionPanel({
    productId,
    selectedAssetIds,
    disabled = false,
    onChange,
}: ProductImageSelectionPanelProps) {
    const productQuery = useQuery({
        queryKey: ['seller-ai-product-images', productId],
        queryFn: () => sellerProductService.getOwnedProductById(productId),
        staleTime: 60_000,
    });
    const images = productQuery.data?.images ?? [];

    // Mỗi job chi nhan mot anh de ket qua preview va apply luon co cung mot source asset.
    const toggleImage = (assetId: string) => {
        if (disabled) return;
        const next = selectedAssetIds.includes(assetId) ? [] : [assetId];
        // Giữ URL của ảnh được chọn đầu tiên để dialog xem đúng ảnh nguồn thay vì tự rơi về ảnh đại diện.
        const primaryImageUrl =
            next
                .map(
                    (selectedId) =>
                        images.find(
                            (image) =>
                                getMediaAssetId(image.imageUrl) === selectedId,
                        )?.imageUrl,
                )
                .find((imageUrl): imageUrl is string => Boolean(imageUrl)) ??
            null;
        onChange({ assetIds: next, primaryImageUrl });
    };

    return (
        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-zinc-950">
                        Chọn ảnh nguồn
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Chọn đúng một ảnh nguồn để tạo một phiên bản tối ưu cho
                        sản phẩm.
                    </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {selectedAssetIds.length}/1 ảnh
                </span>
            </div>

            {productQuery.isLoading ? (
                <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
                    <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                    />
                    Đang tải gallery sản phẩm...
                </div>
            ) : productQuery.isError ? (
                <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    Không tải được ảnh sản phẩm. Vui lòng thử lại.
                </p>
            ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {images.map((image) => {
                        const assetId = getMediaAssetId(image.imageUrl);
                        if (!assetId) return null;
                        const selected = selectedAssetIds.includes(assetId);
                        return (
                            <ProductImageOption
                                key={assetId}
                                assetId={assetId}
                                imageUrl={image.imageUrl}
                                altText={image.altText ?? null}
                                sortOrder={image.sortOrder}
                                isThumbnail={image.isThumbnail}
                                isOptimized={Boolean(image.aiAssetId)}
                                selected={selected}
                                disabled={disabled}
                                onSelect={toggleImage}
                            />
                        );
                    })}
                    {images.length === 0 ? (
                        <div className="col-span-full flex items-center justify-center gap-2 rounded-xl bg-zinc-50 p-6 text-sm text-zinc-500">
                            <ImageIcon className="size-4" aria-hidden="true" />
                            Chưa có ảnh sản phẩm.
                        </div>
                    ) : null}
                </div>
            )}
        </section>
    );
}
