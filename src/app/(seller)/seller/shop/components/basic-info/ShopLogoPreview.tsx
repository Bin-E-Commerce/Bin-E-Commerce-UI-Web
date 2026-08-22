'use client';

import { ImageOff, Store } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface ShopLogoPreviewProps {
    src: string | null;
    alt: string;
    className?: string;
}

// Hiển thị logo có fallback ổn định khi CDN đang xử lý ảnh hoặc URL cũ không còn khả dụng.
export function ShopLogoPreview({ src, alt, className }: ShopLogoPreviewProps) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (!src || failed) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center bg-zinc-100 text-zinc-400',
                    className,
                )}
                title={src ? 'Không tải được logo' : 'Chưa có logo'}
            >
                {src ? (
                    <ImageOff className="size-8" />
                ) : (
                    <Store className="size-8" />
                )}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={cn('object-cover', className)}
            onError={() => setFailed(true)}
        />
    );
}
