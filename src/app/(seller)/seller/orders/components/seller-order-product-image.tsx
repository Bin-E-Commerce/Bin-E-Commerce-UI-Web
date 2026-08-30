// Ảnh snapshot sản phẩm Seller có fallback nhẹ để order cũ thiếu imageUrl vẫn giữ bố cục ổn định.

'use client';

import { Package } from 'lucide-react';
import { useState } from 'react';

interface SellerOrderProductImageProps {
    src: string | null;
    alt: string;
    large?: boolean;
}

// Chỉ chuyển sang icon khi ảnh thiếu hoặc CDN lỗi; không gọi lại Product Service làm list order chậm hơn.
export function SellerOrderProductImage({
    src,
    alt,
    large = false,
}: SellerOrderProductImageProps) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div
                className={`flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-300 ${large ? 'size-28' : 'size-16'}`}
                aria-label="Chưa có ảnh sản phẩm"
            >
                <Package className={large ? 'size-8' : 'size-5'} />
            </div>
        );
    }

    return (
        <div
            className={`shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 ${large ? 'size-28' : 'size-16'}`}
        >
            <img
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setFailed(true)}
            />
        </div>
    );
}
