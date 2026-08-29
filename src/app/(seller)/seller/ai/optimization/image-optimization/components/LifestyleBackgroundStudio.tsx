// Khu vực chọn preset và mô tả bối cảnh lifestyle.
// Component chỉ quản lý UI input, không gọi API hay tự tạo job AI.

'use client';

import { ImageIcon } from 'lucide-react';
import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { LifestyleBackgroundInput, LifestyleBackgroundPreset } from '../types/ai-image-optimization.types';

interface LifestyleBackgroundStudioProps {
    value: LifestyleBackgroundInput;
    selectedProductCount: number;
    disabled?: boolean;
    onChange: (value: LifestyleBackgroundInput) => void;
}

interface BackgroundPresetOptionProps {
    value: LifestyleBackgroundPreset;
    selected: boolean;
    disabled: boolean;
    onSelect: (preset: LifestyleBackgroundPreset) => void;
    title: string;
    description: string;
}

// Hiển thị một preset với copy đặt tại JSX nơi component được dùng, giúp reviewer dễ kiểm tra nội dung hiển thị.
function BackgroundPresetOption({ value, selected, disabled, onSelect, title, description }: BackgroundPresetOptionProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(value)}
            className={cn(
                'group rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                selected
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                    : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50',
            )}
        >
            <span className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="size-4" aria-hidden="true" />{title}</span>
            <span className={cn('mt-1 block text-xs leading-5', selected ? 'text-zinc-300' : 'text-zinc-500')}>{description}</span>
        </button>
    );
}

// Hiển thị lựa chọn bối cảnh có giới hạn rõ ràng để seller đưa ý tưởng nhưng không điều khiển prompt hệ thống.
export function LifestyleBackgroundStudio({ value, selectedProductCount, disabled = false, onChange }: LifestyleBackgroundStudioProps) {
    const isCustomDescriptionBlocked = selectedProductCount !== 1;
    const description = value.description ?? '';
    const normalizedDescription = description.trim();
    const hasDescriptionLengthError = normalizedDescription.length > 0 && normalizedDescription.length < 10;

    // Cập nhật preset mà không làm mất mô tả seller đang soạn, vì hai dữ liệu này được dùng cùng nhau khi tạo ảnh.
    const handlePresetChange = (preset: LifestyleBackgroundPreset) => {
        onChange({ ...value, preset });
    };

    // Chỉ nhận tối đa 400 ký tự để prompt ổn định, dễ đọc và giảm khả năng nhồi nhét nội dung không liên quan.
    const handleDescriptionChange = (nextDescription: string) => {
        onChange({ ...value, description: nextDescription.slice(0, 400) });
    };

    return (
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-violet-50/40 p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                    <AiAssistantIcon size={19} className="invert" />
                </span>
                <div>
                    <p className="text-sm font-semibold text-zinc-950">Background Studio</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">Chọn phong cách hoặc mô tả bối cảnh để AI tạo ảnh lifestyle gần với ý tưởng của bạn.</p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                <BackgroundPresetOption value="MINIMAL_STUDIO" selected={value.preset === 'MINIMAL_STUDIO'} disabled={disabled} onSelect={handlePresetChange} title="Studio tối giản" description="Nền trung tính, ánh sáng mềm." />
                <BackgroundPresetOption value="WARM_HOME" selected={value.preset === 'WARM_HOME'} disabled={disabled} onSelect={handlePresetChange} title="Không gian ấm" description="Ánh sáng cửa sổ tự nhiên." />
                <BackgroundPresetOption value="NATURAL_OUTDOOR" selected={value.preset === 'NATURAL_OUTDOOR'} disabled={disabled} onSelect={handlePresetChange} title="Ngoài trời tinh tế" description="Ánh sáng ban ngày dịu nhẹ." />
                <BackgroundPresetOption value="PREMIUM_DISPLAY" selected={value.preset === 'PREMIUM_DISPLAY'} disabled={disabled} onSelect={handlePresetChange} title="Trưng bày cao cấp" description="Bố cục retail sang trọng." />
            </div>

            <div className="space-y-2">
                <div className="flex items-end justify-between gap-3">
                    <label htmlFor="lifestyle-background-description" className="text-sm font-medium text-zinc-900">Mô tả bối cảnh theo ý bạn <span className="font-normal text-zinc-500">(không bắt buộc, tối thiểu 10 ký tự nếu nhập)</span></label>
                    <span className="shrink-0 text-xs tabular-nums text-zinc-500">{description.length}/400</span>
                </div>
                <Textarea
                    id="lifestyle-background-description"
                    value={description}
                    disabled={disabled || isCustomDescriptionBlocked}
                    onChange={(event) => handleDescriptionChange(event.target.value)}
                    placeholder={isCustomDescriptionBlocked ? 'Chọn đúng 1 sản phẩm để mô tả bối cảnh riêng.' : 'Ví dụ: Bàn gỗ sáng cạnh cửa sổ, ánh nắng buổi sáng, không có người.'}
                    aria-invalid={hasDescriptionLengthError}
                    aria-describedby={hasDescriptionLengthError ? 'lifestyle-background-description-error' : undefined}
                    className={cn(
                        'min-h-24 resize-y bg-white text-sm leading-6 shadow-sm transition-[border-color,box-shadow] focus-visible:ring-0 focus-visible:ring-offset-0',
                        hasDescriptionLengthError ? 'border-red-400 focus-visible:border-red-500' : 'border-zinc-200 focus-visible:border-zinc-400',
                    )}
                />
                {hasDescriptionLengthError ? <p id="lifestyle-background-description-error" className="text-xs font-medium text-red-600">Mô tả cần ít nhất 10 ký tự hoặc để trống.</p> : null}
                <p className="text-xs leading-5 text-zinc-500">AI chỉ thay nền và ánh sáng; luôn giữ nguyên sản phẩm, không thêm người, chữ, logo hoặc claim bán hàng.</p>
            </div>
        </section>
    );
}
