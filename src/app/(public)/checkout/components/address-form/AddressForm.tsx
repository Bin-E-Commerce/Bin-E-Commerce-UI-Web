// Form thêm và chỉnh sửa địa chỉ checkout dùng master data GHN qua API Gateway.

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Form as ShadcnForm } from '@/components/ui/form';
import { useShippingLocations } from '../../hooks/use-shipping-locations';
import { checkoutAddressSchema, type CheckoutAddressFormState } from '../../schemas/checkout-address.schema';
import { AddressField } from './fields/AddressField';
import { GhnField } from './fields/GhnField';
import { DEFAULT_ADDRESS } from './config/address-form.constants';
import type { AddressFormProps } from './types/address-form.types';
import {
    buildAddressPayload,
    getInitialAddressValues,
} from './utils/address-form.utils';

// Render form và điều phối dữ liệu địa chỉ phụ thuộc theo tỉnh, quận/huyện.
export function AddressForm({
    pending,
    onSubmit,
    initialAddress,
    onCancel,
}: AddressFormProps) {
    const initialValues = getInitialAddressValues(initialAddress);
    const form = useForm<CheckoutAddressFormState>({
        resolver: zodResolver(checkoutAddressSchema),
        defaultValues: initialValues,
        mode: 'onBlur',
    });
    const provinceValue = useWatch({ control: form.control, name: 'provinceId' });
    const districtValue = useWatch({ control: form.control, name: 'districtId' });
    const provinceId = provinceValue ? Number(provinceValue) : null;
    const districtId = districtValue ? Number(districtValue) : null;
    const { provinces, districts, wards, isLoading, error } = useShippingLocations(
        provinceId,
        districtId,
    );

    // Gửi payload sau khi schema xác nhận đủ mã GHN và reset khi lưu thành công.
    async function handleValidSubmit(values: CheckoutAddressFormState): Promise<void> {
        const saved = await onSubmit(
            buildAddressPayload(values, initialAddress?.isDefault ?? false),
        );

        if (saved) {
            form.reset(initialAddress ? initialValues : DEFAULT_ADDRESS);
        }
    }

    // Đổi tỉnh sẽ xóa các cấp địa chỉ phụ thuộc để không lưu nhầm mã GHN.
    function handleProvinceChange(
        value: string,
        onChange: (value: string) => void,
    ): void {
        const option = provinces.find((item) => String(item.id) === value);

        onChange(value);
        form.setValue('provinceName', option?.name ?? '');
        form.setValue('districtId', '');
        form.setValue('districtName', '');
        form.setValue('wardCode', '');
        form.setValue('wardName', '');
        form.clearErrors();
    }

    // Đổi quận/huyện sẽ xóa phường/xã cũ.
    function handleDistrictChange(
        value: string,
        onChange: (value: string) => void,
    ): void {
        const option = districts.find((item) => String(item.id) === value);

        onChange(value);
        form.setValue('districtName', option?.name ?? '');
        form.setValue('wardCode', '');
        form.setValue('wardName', '');
    }

    // Đổi phường/xã sẽ lưu cả mã và tên để payload luôn tự mô tả.
    function handleWardChange(
        value: string,
        onChange: (value: string) => void,
    ): void {
        const option = wards.find((item) => item.code === value);

        onChange(value);
        form.setValue('wardName', option?.name ?? '');
    }

    return (
        <ShadcnForm {...form}>
            <form
                onSubmit={form.handleSubmit(handleValidSubmit)}
                className="mt-5 grid items-start gap-x-4 gap-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 sm:p-5"
            >
                <AddressField control={form.control} name="fullName" label="Tên người nhận" />
                <AddressField control={form.control} name="phone" label="Số điện thoại" />
                <GhnField
                    control={form.control}
                    name="provinceId"
                    label="Tỉnh / thành phố"
                    options={provinces}
                    loading={isLoading && !provinces.length}
                    error={error}
                    onChange={handleProvinceChange}
                />
                <GhnField
                    control={form.control}
                    name="districtId"
                    label="Quận / huyện"
                    options={districts}
                    loading={Boolean(provinceId) && isLoading && !districts.length}
                    disabled={!provinceId}
                    onChange={handleDistrictChange}
                />
                <GhnField
                    control={form.control}
                    name="wardCode"
                    label="Phường / xã"
                    options={wards}
                    loading={Boolean(districtId) && isLoading && !wards.length}
                    disabled={!districtId}
                    onChange={handleWardChange}
                />
                <AddressField control={form.control} name="label" label="Nhãn địa chỉ" select />
                <AddressField
                    control={form.control}
                    name="street"
                    label="Địa chỉ chi tiết"
                    wide
                />
                {error ? <p className="text-xs text-red-600 sm:col-span-2">{error}</p> : null}
                <div className="flex gap-3 sm:col-span-2">
                    <button
                        type="submit"
                        disabled={pending || isLoading || Boolean(error)}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {pending ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : initialAddress ? (
                            'Cập nhật địa chỉ'
                        ) : (
                            'Lưu địa chỉ và chọn'
                        )}
                    </button>
                    {onCancel ? (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={pending}
                            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700"
                        >
                            Hủy
                        </button>
                    ) : null}
                </div>
            </form>
        </ShadcnForm>
    );
}
