// Combobox tìm kiếm dùng chung cho ba cấp địa chỉ GHN.

'use client';

import { useMemo, useState } from 'react';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import type {
    GhnLocationOption,
    GhnSelectProps,
} from '../types/address-form.types';
import { optionName, optionValue } from '../utils/address-form.utils';

// Hiển thị combobox có tìm kiếm và giới hạn option để danh sách phản hồi nhanh.
export function GhnSelect<T extends GhnLocationOption>({
    value,
    options,
    placeholder,
    disabled,
    loading,
    onChange,
}: GhnSelectProps<T>) {
    const [search, setSearch] = useState('');
    const selected = options.find((option) => optionValue(option) === value) ?? null;
    const visibleOptions = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase('vi-VN');

        return options
            .filter((option) =>
                optionName(option).toLocaleLowerCase('vi-VN').includes(normalizedSearch),
            )
            .slice(0, 80);
    }, [options, search]);

    return (
        <Combobox<T>
            items={visibleOptions}
            value={selected}
            onValueChange={(option) => {
                setSearch('');
                onChange(option ? optionValue(option) : '');
            }}
            onInputValueChange={setSearch}
            itemToStringLabel={(option) => (option ? optionName(option) : '')}
            itemToStringValue={(option) => (option ? optionValue(option) : '')}
            isItemEqualToValue={(left, right) => optionValue(left) === optionValue(right)}
            disabled={disabled || loading}
            autoHighlight
        >
            <ComboboxInput
                placeholder={loading ? 'Đang tải...' : placeholder}
                disabled={disabled || loading}
                showClear={!loading}
                className="!h-11 w-full rounded-xl border-zinc-200 bg-white [&_[data-slot=input-group-control]]:!h-11"
            />
            <ComboboxContent className="rounded-xl border-zinc-200 bg-white">
                <ComboboxEmpty>Không tìm thấy khu vực phù hợp.</ComboboxEmpty>
                <ComboboxList>
                    {(option: T, index: number) => (
                        <ComboboxItem
                            key={optionValue(option)}
                            value={option}
                            index={index}
                            className="cursor-pointer rounded-lg px-3 py-2.5"
                        >
                            {optionName(option)}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
