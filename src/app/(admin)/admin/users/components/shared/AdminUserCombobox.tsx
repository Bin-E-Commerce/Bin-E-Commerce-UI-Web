// Combobox dùng chung cho role/status trong Admin User.
// Component chỉ sở hữu trạng thái hiển thị và lựa chọn option; quyền thay đổi,
// validation và mutation vẫn do trang detail quyết định ở lớp bên ngoài.
'use client';

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';

// Combobox dùng cho các field role/status trong Admin User, thay native select để menu không phụ thuộc giao diện trình duyệt.
// Component chỉ quản lý việc chọn option; state mutation, quyền và validation vẫn thuộc về trang detail.
export interface AdminUserComboboxOption {
    value: string;
    label: string;
}

interface AdminUserComboboxProps {
    value: string;
    options: AdminUserComboboxOption[];
    placeholder: string;
    ariaLabel: string;
    disabled?: boolean;
    onValueChange: (value: string) => void;
}

// Render combobox controlled với value string để role/status vẫn giữ đúng contract API hiện tại.
// Khi người dùng chọn option, component trả lại value nguyên bản và không tự biến đổi dữ liệu nghiệp vụ.
export function AdminUserCombobox({
    value,
    options,
    placeholder,
    ariaLabel,
    disabled = false,
    onValueChange,
}: AdminUserComboboxProps) {
    const selectedOption =
        options.find((option) => option.value === value) ?? null;

    return (
        <Combobox<AdminUserComboboxOption>
            items={options}
            value={selectedOption}
            onValueChange={(option) => {
                if (option) onValueChange(option.value);
            }}
            itemToStringLabel={(option) => option?.label ?? ''}
            itemToStringValue={(option) => option?.value ?? ''}
            isItemEqualToValue={(item, selected) =>
                item.value === selected.value
            }
            autoHighlight
            disabled={disabled}
        >
            <ComboboxInput
                aria-label={ariaLabel}
                placeholder={placeholder}
                showClear={false}
                className="h-10 w-full rounded-lg border-zinc-200 bg-white text-sm text-zinc-950"
            />
            <ComboboxContent className="rounded-lg border border-zinc-200 bg-white">
                <ComboboxEmpty>Không tìm thấy lựa chọn phù hợp.</ComboboxEmpty>
                <ComboboxList>
                    {(option: AdminUserComboboxOption, index: number) => (
                        <ComboboxItem
                            key={option.value}
                            value={option}
                            index={index}
                            className="cursor-pointer rounded-md px-3 py-2 text-sm text-zinc-950 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-950"
                        >
                            {option.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
