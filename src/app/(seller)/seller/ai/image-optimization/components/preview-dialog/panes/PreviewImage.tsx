// Thành phần hiển thị ảnh có kính lúp trong dialog preview.
// Component chỉ nhận URL đã được backend/feature xác minh và không tự tải hay thay đổi dữ liệu ảnh.

'use client';

import { Lens } from '@/components/ui/lens';
import { cn } from '@/lib/utils';

interface PreviewImageProps {
    src: string;
    alt: string;
    className?: string;
}

// Hiển thị ảnh với vùng phóng đại giữ nguyên kích thước khung preview để so sánh trước/sau ổn định.
export function PreviewImage({ src, alt, className }: PreviewImageProps) {
    return (
        <Lens
            className="h-full w-full"
            zoomFactor={1.7}
            lensSize={190}
            lensColor="rgba(24, 24, 27, 0.92)"
            ariaLabel={`Phóng đại ${alt}`}
        >
            <img
                src={src}
                alt={alt}
                className={cn('h-full w-full object-contain', className)}
            />
        </Lens>
    );
}
