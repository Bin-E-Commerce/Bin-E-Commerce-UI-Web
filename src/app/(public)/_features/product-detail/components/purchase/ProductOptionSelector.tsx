import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ProductOption } from '@/services/product';

interface ProductOptionSelectorProps {
    options: ProductOption[];
    selectedValueIds: Record<string, string>;
    onSelect: (optionId: string, valueId: string) => void;
}

// Hiển thị từng nhóm phân loại và phát lựa chọn value để hook mua hàng tìm SKU tương ứng.
export function ProductOptionSelector({
    options,
    selectedValueIds,
    onSelect,
}: ProductOptionSelectorProps) {
    if (options.length === 0) return null;

    return (
        <div className="space-y-4 border-t border-zinc-200 pt-5">
            {options.map((option) => (
                <fieldset key={option.id}>
                    <legend className="mb-2 text-sm font-semibold text-zinc-900">
                        {option.name}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                            const selected =
                                selectedValueIds[option.id] === value.id;

                            return (
                                <button
                                    key={value.id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => onSelect(option.id, value.id)}
                                    className={cn(
                                        'inline-flex min-h-10 items-center gap-2 rounded border px-3 text-sm transition-colors',
                                        selected
                                            ? 'border-zinc-950 bg-zinc-950 text-white'
                                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-500',
                                    )}
                                >
                                    {selected ? <Check className="h-3.5 w-3.5" /> : null}
                                    {value.value}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
            ))}
        </div>
    );
}
