'use client';

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';

export interface AccessControlComboboxOption {
    value: string;
    label: string;
    description?: string;
}

interface AccessControlComboboxProps {
    value: string;
    options: AccessControlComboboxOption[];
    placeholder: string;
    emptyMessage: string;
    onValueChange: (value: string) => void;
}

// Bọc shadcn combobox thành API value string để bộ lọc dùng như select nhưng vẫn có search/clear/hover tốt hơn.
export function AccessControlCombobox({
    value,
    options,
    placeholder,
    emptyMessage,
    onValueChange,
}: AccessControlComboboxProps) {
    const selectedOption =
        options.find((option) => option.value === value) ?? null;

    return (
        <Combobox<AccessControlComboboxOption>
            items={options}
            value={selectedOption}
            onValueChange={(option) => onValueChange(option?.value ?? 'all')}
            itemToStringLabel={(option) => option?.label ?? ''}
            itemToStringValue={(option) => option?.value ?? ''}
            isItemEqualToValue={(item, selected) =>
                item.value === selected.value
            }
            autoHighlight
            limit={80}
        >
            <ComboboxInput
                placeholder={placeholder}
                showClear={value !== 'all'}
                className="h-11 w-full rounded-xl bg-white"
            />
            <ComboboxContent className="rounded-xl">
                <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                <ComboboxList>
                    {(option: AccessControlComboboxOption, index: number) => (
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
                                {option.description ? (
                                    <span className="mt-0.5 block truncate text-xs text-zinc-500">
                                        {option.description}
                                    </span>
                                ) : null}
                            </span>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
