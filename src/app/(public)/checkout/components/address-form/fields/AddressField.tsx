// Field text và nhãn địa chỉ dùng chung trong form checkout.

'use client';

import {
    FormControl,
    FormField as ShadcnFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AddressFieldProps } from '../types/address-form.types';

// Render field text hoặc select với cùng kích thước và khoảng cách.
export function AddressField({
    control,
    name,
    label,
    wide = false,
    select = false,
}: AddressFieldProps) {
    return (
        <ShadcnFormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={`content-start ${wide ? 'sm:col-span-2' : ''}`}>
                    <FormLabel>
                        {label} <RequiredMark />
                    </FormLabel>
                    <FormControl>
                        {select ? (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="!h-11 w-full rounded-xl border-zinc-200 bg-white">
                                    <SelectValue placeholder="Chọn nhãn địa chỉ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Nhà riêng">Nhà riêng</SelectItem>
                                    <SelectItem value="Cơ quan">Cơ quan</SelectItem>
                                    <SelectItem value="Nhà bố mẹ">Nhà bố mẹ</SelectItem>
                                    <SelectItem value="Nhà trọ">Nhà trọ</SelectItem>
                                    <SelectItem value="Khác">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                {...field}
                                className="!h-11 rounded-xl border-zinc-200 bg-white"
                            />
                        )}
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

// Hiển thị dấu hiệu trực quan cho field bắt buộc.
export function RequiredMark() {
    return (
        <span className="text-red-500" aria-hidden="true">
            *
        </span>
    );
}
