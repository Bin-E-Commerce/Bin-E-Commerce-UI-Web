// Nút chọn một preset bối cảnh lifestyle.
// Component chỉ phát preset được chọn và không chỉnh sửa trực tiếp state của studio.

'use client';
import { Button } from '@/components/ui/button';

import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LifestyleBackgroundPreset } from '@/services/ai/types/image-optimization.types';

interface BackgroundPresetOptionProps {
    value: LifestyleBackgroundPreset;
    selected: boolean;
    disabled: boolean;
    onSelect: (preset: LifestyleBackgroundPreset) => void;
    title: string;
    description: string;
}

// Hiển thị preset có trạng thái chọn rõ ràng để seller đổi phong cách mà không mất mô tả đang nhập.
export function BackgroundPresetOption({
    value,
    selected,
    disabled,
    onSelect,
    title,
    description,
}: BackgroundPresetOptionProps) {
    return (
        <Button
            variant="ghost"
            type="button"
            disabled={disabled}
            onClick={() => onSelect(value)}
            className={cn(
                'group rounded-lg border-2 p-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                selected
                    ? 'border-zinc-950 bg-zinc-50 text-zinc-950 shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50',
            )}
        >
            <span className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="size-4" aria-hidden="true" />
                {title}
            </span>
            <span
                className={cn(
                    'mt-1 block text-xs leading-5',
                    selected ? 'text-zinc-600' : 'text-zinc-500',
                )}
            >
                {description}
            </span>
        </Button>
    );
}
