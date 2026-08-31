// Field combobox GHN liên kết value mã với field tên tương ứng trong form.

'use client';

import {
    FormControl,
    FormField as ShadcnFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { GhnSelect } from '../ghn/GhnSelect';
import { RequiredMark } from './AddressField';
import type {
    GhnFieldProps,
    GhnLocationOption,
} from '../types/address-form.types';

// Render một cấp địa chỉ GHN và giữ trạng thái lỗi ngay dưới field.
export function GhnField<T extends GhnLocationOption>({
    control,
    name,
    label,
    options,
    disabled,
    loading,
    error,
    onChange,
}: GhnFieldProps<T>) {
    return (
        <ShadcnFormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="content-start">
                    <FormLabel>
                        {label} <RequiredMark />
                    </FormLabel>
                    <FormControl>
                        <GhnSelect
                            value={field.value}
                            options={options}
                            placeholder={`Chọn ${label.toLowerCase()}`}
                            disabled={disabled || Boolean(error)}
                            loading={loading}
                            onChange={(value) => onChange(value, field.onChange)}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
