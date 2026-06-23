'use client';

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';

export interface SellerComboboxOption {
    value: string;
    label: string;
    description?: string;
}

interface SellerComboboxProps {
    id?: string;
    value: string;
    options: SellerComboboxOption[];
    placeholder: string;
    emptyMessage?: string;
    disabled?: boolean;
    loading?: boolean;
    onValueChange: (value: string) => void;
}

// Bọc shadcn combobox theo API value string để các step không phải biết chi tiết object của Base UI.
export function SellerCombobox({
    id,
    value,
    options,
    placeholder,
    emptyMessage = 'Không tìm thấy dữ liệu phù hợp.',
    disabled = false,
    loading = false,
    onValueChange,
}: SellerComboboxProps) {
    const selectedOption =
        options.find((option) => option.value === value) ?? null;

    return (
        <Combobox<SellerComboboxOption>
            items={options}
            value={selectedOption}
            onValueChange={(option) => onValueChange(option?.value ?? '')}
            itemToStringLabel={(option) => option?.label ?? ''}
            itemToStringValue={(option) => option?.value ?? ''}
            isItemEqualToValue={(item, selected) =>
                item.value === selected.value
            }
            disabled={disabled || loading}
            autoHighlight
            limit={80}
        >
            <ComboboxInput
                id={id}
                placeholder={loading ? 'Đang tải dữ liệu...' : placeholder}
                disabled={disabled || loading}
                showClear={!loading}
                className="h-11 w-full bg-white"
            />
            <ComboboxContent>
                <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                <ComboboxList>
                    {(option: SellerComboboxOption, index: number) => {
                        // Chỉ hiện mô tả khi nội dung khác label để dropdown không bị lặp chữ.
                        const shouldShowDescription =
                            Boolean(option.description) &&
                            option.description !== option.label;

                        return (
                            <ComboboxItem
                                key={option.value}
                                value={option}
                                index={index}
                                className="cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-highlighted:bg-zinc-100 data-[highlighted]:text-zinc-950 data-highlighted:text-zinc-950"
                            >
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">
                                        {option.label}
                                    </span>
                                    {shouldShowDescription ? (
                                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                            {option.description}
                                        </span>
                                    ) : null}
                                </span>
                            </ComboboxItem>
                        );
                    }}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

