// Component này hiển thị form thêm địa chỉ giao hàng trong checkout.
// React Hook Form quản lý trạng thái và submit, Zod kiểm tra dữ liệu, còn Location Service cung cấp tên địa danh chính thức.

'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
    Form as ShadcnForm,
    FormControl,
    FormField as ShadcnFormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CreateAddressPayload } from '@/services/auth';
import type { LocationDto } from '@/services/location';
import { useCheckoutLocations } from '../hooks/use-checkout-locations';
import {
    checkoutAddressSchema,
    type CheckoutAddressFormState,
} from '../schemas/checkout-address.schema';

interface AddressFormProps {
    pending: boolean;
    onSubmit: (payload: CreateAddressPayload) => Promise<boolean>;
}

const DEFAULT_ADDRESS: CheckoutAddressFormState = {
    fullName: '',
    phone: '',
    provinceId: '',
    wardId: '',
    label: 'Nhà riêng',
    street: '',
};

const LOCATION_OPTION_LIMIT = 80;

// Chuyển location đã chọn thành payload Auth, bảo đảm tên tỉnh/phường luôn đến từ Location Service thay vì input tự do.
function buildAddressPayload(
    values: CheckoutAddressFormState,
    province: LocationDto | undefined,
    ward: LocationDto | undefined,
): CreateAddressPayload | null {
    if (!province || !ward) return null;

    return {
        label: values.label,
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        province: province.name,
        district: 'Không áp dụng',
        ward: ward.name,
        street: values.street.trim(),
        isDefault: false,
    };
}

// Render form địa chỉ với validation tập trung, lỗi hiển thị ngay dưới trường và reset sau khi Auth lưu thành công.
export function AddressForm({ pending, onSubmit }: AddressFormProps) {
    const form = useForm<CheckoutAddressFormState>({
        resolver: zodResolver(checkoutAddressSchema),
        defaultValues: DEFAULT_ADDRESS,
        mode: 'onBlur',
    });
    const provinceId = form.watch('provinceId');
    const wardId = form.watch('wardId');
    const {
        provinces,
        wards,
        isLoading: locationsLoading,
        error: locationsError,
    } = useCheckoutLocations(provinceId);
    const province = provinces.find((location) => location.id === provinceId);
    const ward = wards.find((location) => location.id === wardId);

    // Kiểm tra cặp location đã tải xong trước khi gọi Auth, sau đó reset form để lần mở tiếp theo bắt đầu sạch.
    async function handleValidSubmit(
        values: CheckoutAddressFormState,
    ): Promise<void> {
        const payload = buildAddressPayload(values, province, ward);
        if (!payload) {
            toast.error('Vui lòng chọn tỉnh và phường/xã từ danh sách.');
            return;
        }

        const saved = await onSubmit(payload);
        if (saved) form.reset(DEFAULT_ADDRESS);
    }

    // Đổi tỉnh phải xóa phường cũ vì phường/xã chỉ hợp lệ trong phạm vi tỉnh đang chọn.
    // Không validate wardId ngay lúc này để người dùng có thời gian chọn phường/xã mới.
    function handleProvinceChange(
        nextProvinceId: string,
        onChange: (value: string) => void,
    ): void {
        onChange(nextProvinceId);
        form.clearErrors('wardId');
        form.setValue('wardId', '', { shouldDirty: true });
    }

    return (
        <ShadcnForm {...form}>
            <form
                onSubmit={form.handleSubmit(handleValidSubmit)}
                className="mt-5 grid items-start gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 sm:p-5"
            >
                <ShadcnFormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem className="content-start">
                            <FormLabel>
                                Tên người nhận <RequiredMark />
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="h-11 rounded-xl border-zinc-200 bg-white transition hover:border-zinc-400 focus:border-zinc-950 focus:ring-zinc-950/5"
                                />
                            </FormControl>
                            <div className="min-h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <ShadcnFormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem className="content-start">
                            <FormLabel>
                                Số điện thoại <RequiredMark />
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    inputMode="numeric"
                                    className="h-11 rounded-xl border-zinc-200 bg-white transition hover:border-zinc-400 focus:border-zinc-950 focus:ring-zinc-950/5"
                                />
                            </FormControl>
                            <div className="min-h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <ShadcnFormField
                    control={form.control}
                    name="provinceId"
                    render={({ field }) => (
                        <FormItem className="content-start">
                            <FormLabel>
                                Tỉnh / thành phố <RequiredMark />
                            </FormLabel>
                            <FormControl>
                                <LocationSelect
                                    value={field.value}
                                    options={provinces}
                                    placeholder="Chọn tỉnh / thành phố"
                                    disabled={Boolean(locationsError)}
                                    loading={
                                        locationsLoading && !provinces.length
                                    }
                                    required
                                    onChange={(nextValue) =>
                                        handleProvinceChange(
                                            nextValue,
                                            field.onChange,
                                        )
                                    }
                                />
                            </FormControl>
                            <div className="min-h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <ShadcnFormField
                    control={form.control}
                    name="wardId"
                    render={({ field }) => (
                        <FormItem className="content-start">
                            <FormLabel>
                                Phường / xã <RequiredMark />
                            </FormLabel>
                            <FormControl>
                                <LocationSelect
                                    value={field.value}
                                    options={wards}
                                    placeholder={
                                        provinceId
                                            ? 'Chọn phường / xã'
                                            : 'Chọn tỉnh trước'
                                    }
                                    disabled={
                                        !provinceId || Boolean(locationsError)
                                    }
                                    loading={
                                        Boolean(provinceId) &&
                                        locationsLoading &&
                                        !wards.length
                                    }
                                    required
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <div className="min-h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <ShadcnFormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem className="content-start sm:col-span-2">
                            <FormLabel>
                                Nhãn địa chỉ <RequiredMark />
                            </FormLabel>
                            <FormControl>
                                <AddressLabelSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <div className="min-h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <ShadcnFormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                        <FormItem className="content-start sm:col-span-2">
                            <FormLabel>
                                Địa chỉ chi tiết <RequiredMark />
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Số nhà, tên đường"
                                    className="h-11 rounded-xl border-zinc-200 bg-white transition hover:border-zinc-400 focus:border-zinc-950 focus:ring-zinc-950/5"
                                />
                            </FormControl>
                            <div className="min-h-5">
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                {locationsError ? (
                    <p className="text-xs text-red-600 sm:col-span-2">
                        {locationsError}
                    </p>
                ) : null}
                <button
                    type="submit"
                    disabled={
                        pending || locationsLoading || Boolean(locationsError)
                    }
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                >
                    {pending ? (
                        <>
                            <Loader2
                                className="size-4 animate-spin"
                                aria-hidden="true"
                            />{' '}
                            Đang lưu...
                        </>
                    ) : (
                        'Lưu địa chỉ và chọn'
                    )}
                </button>
            </form>
        </ShadcnForm>
    );
}

// Hiển thị dấu hiệu trực quan cho trường bắt buộc mà không thay đổi giá trị gửi lên backend.
function RequiredMark() {
    return (
        <span className="text-red-500" aria-hidden="true">
            *
        </span>
    );
}

// Render các nhãn địa chỉ phổ biến bằng Select Shadcn để dữ liệu lưu xuống Auth luôn thuộc tập giá trị đã thống nhất.
function AddressLabelSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <Select
            value={value}
            onValueChange={(nextValue) => onChange(nextValue ?? '')}
            required
            itemToStringLabel={(selectedValue) => selectedValue}
        >
            <SelectTrigger className="!h-11 w-full cursor-pointer rounded-xl border-zinc-200 bg-white px-4 text-sm text-zinc-800 transition hover:border-zinc-400 focus:border-zinc-950 focus:ring-zinc-950/10">
                <SelectValue placeholder="Chọn nhãn địa chỉ" />
            </SelectTrigger>
            <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="rounded-xl border-zinc-200 bg-white data-[align-trigger=false]:animate-none"
            >
                <SelectItem
                    value="Nhà riêng"
                    className="cursor-pointer rounded-lg py-2.5"
                >
                    Nhà riêng
                </SelectItem>
                <SelectItem
                    value="Cơ quan"
                    className="cursor-pointer rounded-lg py-2.5"
                >
                    Cơ quan
                </SelectItem>
                <SelectItem
                    value="Nhà bố mẹ"
                    className="cursor-pointer rounded-lg py-2.5"
                >
                    Nhà bố mẹ
                </SelectItem>
                <SelectItem
                    value="Nhà trọ"
                    className="cursor-pointer rounded-lg py-2.5"
                >
                    Nhà trọ
                </SelectItem>
                <SelectItem
                    value="Khác"
                    className="cursor-pointer rounded-lg py-2.5"
                >
                    Khác
                </SelectItem>
            </SelectContent>
        </Select>
    );
}

// Render location bằng Shadcn Combobox để chỉ dựng tối đa 80 kết quả phù hợp thay vì mount toàn bộ danh sách địa giới.
// Combobox giữ value là object LocationDto, còn form chỉ nhận id; cách này vừa hỗ trợ tìm kiếm vừa bảo toàn contract của RHF.
function LocationSelect({
    value,
    options,
    placeholder,
    disabled,
    loading,
    required,
    onChange,
}: {
    value: string;
    options: LocationDto[];
    placeholder: string;
    disabled: boolean;
    loading?: boolean;
    required?: boolean;
    onChange: (value: string) => void;
}) {
    const [searchValue, setSearchValue] = useState('');
    const selectedLocation =
        options.find((option) => option.id === value) ?? null;
    const visibleOptions = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLocaleLowerCase('vi-VN');
        const filteredOptions = normalizedSearch
            ? options.filter((option) =>
                  option.name.toLocaleLowerCase('vi-VN').includes(normalizedSearch),
              )
            : options;
        const limitedOptions = filteredOptions.slice(0, LOCATION_OPTION_LIMIT);

        // Luôn giữ item đang chọn trong danh sách để Combobox hiển thị đúng value dù item đó nằm sau giới hạn 80 kết quả.
        if (
            selectedLocation &&
            !limitedOptions.some((option) => option.id === selectedLocation.id)
        ) {
            return [selectedLocation, ...limitedOptions].slice(
                0,
                LOCATION_OPTION_LIMIT,
            );
        }

        return limitedOptions;
    }, [options, searchValue, selectedLocation]);

    return (
        <Combobox<LocationDto>
            items={visibleOptions}
            value={selectedLocation}
            onValueChange={(option) => {
                setSearchValue('');
                onChange(option?.id ?? '');
            }}
            onInputValueChange={setSearchValue}
            itemToStringLabel={(option) => option?.name ?? ''}
            itemToStringValue={(option) => option?.id ?? ''}
            isItemEqualToValue={(item, selected) => item.id === selected.id}
            disabled={disabled || loading}
            autoHighlight
            limit={LOCATION_OPTION_LIMIT}
        >
            <ComboboxInput
                aria-required={required}
                placeholder={loading ? 'Đang tải dữ liệu...' : placeholder}
                disabled={disabled || loading}
                showClear={!loading}
                className="h-11 w-full rounded-xl border-zinc-200 bg-white text-sm text-zinc-800 transition hover:border-zinc-400 focus-within:border-zinc-950 focus-within:ring-zinc-950/10"
            />
            <ComboboxContent className="rounded-xl border-zinc-200 bg-white">
                <ComboboxEmpty>Không tìm thấy tỉnh/phường phù hợp.</ComboboxEmpty>
                <ComboboxList>
                    {(option: LocationDto, index: number) => (
                        <ComboboxItem
                            key={option.id}
                            value={option}
                            index={index}
                            className="cursor-pointer rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-100 data-highlighted:bg-zinc-100 data-highlighted:text-zinc-950"
                        >
                            {option.name}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
