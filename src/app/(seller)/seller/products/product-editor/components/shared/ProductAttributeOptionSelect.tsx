'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { isUuid } from '../../utils/product-create-validation';

interface ProductAttributeOption {
    id: string;
    displayValue: string;
}

interface ProductAttributeOptionSelectProps {
    value: string[];
    options: ProductAttributeOption[];
    multiple: boolean;
    maxSelections?: number | null;
    placeholder: string;
    onChange: (nextValue: string[]) => void;
}

// Tạo nhãn gọn từ các giá trị đã chọn để nút mở danh sách không chiếm quá nhiều không gian.
function getSelectionLabel(selectedIds: string[], options: ProductAttributeOption[], placeholder: string): string {
    const selectedValues = options.filter((option) => selectedIds.includes(option.id)).map((option) => option.displayValue);
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length <= 2) return selectedValues.join(', ');
    return `${selectedValues.slice(0, 2).join(', ')} +${selectedValues.length - 2}`;
}

// Hiển thị dropdown cho trường chọn một hoặc nhiều giá trị; không dùng checkbox để giữ biểu mẫu gọn hơn.
export function ProductAttributeOptionSelect({ value, options, multiple, maxSelections, placeholder, onChange }: ProductAttributeOptionSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    // Chỉ render và gửi option có UUID hợp lệ; dữ liệu UI cũ hoặc dữ liệu lỗi không được lan xuống payload.
    const validOptions = useMemo(() => options.filter((option) => isUuid(option.id)), [options]);
    const selectedIds = useMemo(() => value.filter((optionId) => isUuid(optionId)), [value]);
    const selectedLabel = getSelectionLabel(selectedIds, validOptions, placeholder);
    // Lọc cục bộ vì Catalog Service đã trả danh sách giá trị thuộc tính theo ngành hàng đã chọn.
    const filteredOptions = useMemo(() => validOptions.filter((option) => option.displayValue.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [validOptions, query]);

    // Chọn hoặc bỏ một giá trị và luôn tôn trọng giới hạn chọn do Catalog Service định nghĩa.
    function toggleOption(optionId: string) {
        if (!isUuid(optionId)) return;
        if (selectedIds.includes(optionId)) {
            onChange(selectedIds.filter((id) => id !== optionId));
            return;
        }
        if (!multiple) {
            onChange([optionId]);
            setOpen(false);
            return;
        }
        if (maxSelections && selectedIds.length >= maxSelections) return;
        onChange([...selectedIds, optionId]);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" role="combobox" aria-expanded={open} className="h-11 w-full justify-between gap-2 px-3 font-normal">
                    <span className={cn('min-w-0 truncate text-left', selectedIds.length === 0 && 'text-zinc-500')}>{selectedLabel}</span>
                    <ChevronDown className="size-4 shrink-0 text-zinc-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm giá trị" className="h-9 pl-9" />
                </div>
                {multiple && maxSelections ? <p className="px-1 pb-1 pt-2 text-xs text-zinc-500">Đã chọn {selectedIds.length}/{maxSelections} giá trị</p> : null}
                <div className="mt-2 max-h-60 overflow-y-auto">
                    {filteredOptions.length === 0 ? <p className="px-2 py-5 text-center text-sm text-zinc-500">Không tìm thấy giá trị phù hợp.</p> : filteredOptions.map((option) => {
                        const selected = selectedIds.includes(option.id);
                        const reachedLimit = multiple && !selected && Boolean(maxSelections) && selectedIds.length >= (maxSelections ?? Infinity);
                        return (
                            <button key={option.id} type="button" disabled={reachedLimit} className={cn('flex min-h-9 w-full items-center justify-between rounded-sm px-2 text-left text-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40', selected && 'bg-zinc-100 font-medium text-zinc-950')} onClick={() => toggleOption(option.id)}>
                                {option.displayValue}
                                {selected ? <Check className="size-4" /> : null}
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
