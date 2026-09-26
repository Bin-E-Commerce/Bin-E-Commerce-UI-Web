// Một nút ảnh trong gallery được Product Service xác thực.
// Component chỉ render và phát asset ID/URL đã chọn về panel cha.

'use client';
import { Button } from '@/components/ui/button';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageOptionProps {
    assetId: string;
    imageUrl: string;
    altText: string | null;
    sortOrder: number;
    isThumbnail: boolean;
    isOptimized: boolean;
    selected: boolean;
    disabled: boolean;
    onSelect: (assetId: string) => void;
}

// Hiển thị ảnh, trạng thái đã chọn và nhãn ảnh đại diện mà không chứa logic query.
export function ProductImageOption({
    assetId,
    imageUrl,
    altText,
    sortOrder,
    isThumbnail,
    isOptimized,
    selected,
    disabled,
    onSelect,
}: ProductImageOptionProps) {
    return (
        <Button
            variant="ghost"
            type="button"
            key={assetId}
            disabled={disabled}
            onClick={() => onSelect(assetId)}
            className={cn(
                'relative aspect-square overflow-hidden rounded-xl border-2 bg-zinc-50 transition-[border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-60',
                selected
                    ? 'border-zinc-950 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-400',
            )}
            aria-pressed={selected}
            aria-label={`${selected ? 'Bỏ chọn' : 'Chọn'} ảnh ${sortOrder + 1}${isOptimized ? ' đã tối ưu' : ''}`}
        >
            <img
                src={imageUrl}
                alt={altText ?? `Ảnh sản phẩm ${sortOrder + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
            />
            {selected ? (
                <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-zinc-950 text-white">
                    <Check className="size-3.5" aria-hidden="true" />
                </span>
            ) : null}
            {isThumbnail || isOptimized ? (
                <div className="absolute bottom-1 left-1 flex flex-wrap gap-1">
                    {isThumbnail ? (
                        <span className="rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 shadow-sm">
                            Ảnh đại diện
                        </span>
                    ) : null}
                    {isOptimized ? (
                        <span className="rounded bg-zinc-950/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                            Đã tối ưu
                        </span>
                    ) : null}
                </div>
            ) : null}
        </Button>
    );
}
