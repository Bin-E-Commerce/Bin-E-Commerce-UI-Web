import { useMemo } from 'react';
import { MapPinned } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useLocations } from '../../hooks/useLocations';
import type {
    SellerRegisterFieldErrors,
    SellerRegisterFormValues,
} from '../../types/seller-register-form.type';
import { Field } from '../shared/Field';
import { inputClassName, textareaClassName } from '../shared/form-control.styles';
import {
    SellerCombobox,
    type SellerComboboxOption,
} from '../shared/SellerCombobox';

interface PickupAddressStepProps {
    values: SellerRegisterFormValues['pickupAddress'];
    errors: SellerRegisterFieldErrors;
    onChange: (
        patch: Partial<SellerRegisterFormValues['pickupAddress']>,
    ) => void;
}

// Bước lấy hàng đảm bảo vận hành đơn đầu tiên không bị kẹt vì thiếu thông tin kho.
export function PickupAddressStep({
    values,
    errors,
    onChange,
}: PickupAddressStepProps) {
    const {
        locations: provinces,
        loading: loadingProvinces,
        error: provinceError,
    } = useLocations({
        type: 'province',
        pageSize: 100,
    });
    const {
        locations: wards,
        loading: loadingWards,
        error: wardError,
    } = useLocations({
        type: 'ward',
        parentId: values.provinceId,
        pageSize: 500,
    });
    const provinceOptions = useMemo<SellerComboboxOption[]>(
        () =>
            provinces.map((province) => ({
                value: province.id,
                label: province.name,
            })),
        [provinces],
    );
    const wardOptions = useMemo<SellerComboboxOption[]>(
        () =>
            wards.map((ward) => ({
                value: ward.id,
                label: ward.name,
            })),
        [wards],
    );

    // Khi đổi tỉnh/thành, xã/phường cũ không còn hợp lệ nên phải reset lựa chọn cấp con.
    const handleProvinceChange = (value: string) => {
        onChange({ provinceId: value, wardId: '' });
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Người phụ trách lấy hàng"
                    htmlFor="pickupName"
                    error={errors['pickupAddress.contactName']}
                    required
                >
                    <Input
                        id="pickupName"
                        value={values.contactName}
                        className={inputClassName}
                        placeholder="Tên người liên hệ"
                        onChange={(event) =>
                            onChange({ contactName: event.target.value })
                        }
                    />
                </Field>
                <Field
                    label="Số điện thoại lấy hàng"
                    htmlFor="pickupPhone"
                    error={errors['pickupAddress.phone']}
                    required
                >
                    <Input
                        id="pickupPhone"
                        value={values.phone}
                        className={inputClassName}
                        placeholder="Số điện thoại kho"
                        onChange={(event) =>
                            onChange({ phone: event.target.value })
                        }
                    />
                </Field>
                <Field
                    label="Tỉnh / Thành phố"
                    htmlFor="province"
                    error={
                        errors['pickupAddress.provinceId'] ??
                        provinceError ??
                        undefined
                    }
                    required
                >
                    <SellerCombobox
                        id="province"
                        value={values.provinceId}
                        options={provinceOptions}
                        placeholder="Chọn tỉnh thành"
                        emptyMessage="Không tìm thấy tỉnh/thành phù hợp."
                        loading={loadingProvinces}
                        disabled={Boolean(provinceError)}
                        onValueChange={handleProvinceChange}
                    />
                </Field>
                <Field
                    label="Phường / Xã"
                    htmlFor="ward"
                    error={
                        errors['pickupAddress.wardId'] ??
                        wardError ??
                        undefined
                    }
                    required
                >
                    <SellerCombobox
                        id="ward"
                        value={values.wardId}
                        options={wardOptions}
                        placeholder={
                            values.provinceId
                                ? 'Chọn phường xã'
                                : 'Chọn tỉnh thành trước'
                        }
                        emptyMessage="Không tìm thấy phường/xã phù hợp."
                        loading={Boolean(values.provinceId) && loadingWards}
                        disabled={!values.provinceId || Boolean(wardError)}
                        onValueChange={(wardId) => onChange({ wardId })}
                    />
                </Field>
                <div className="sm:col-span-2">
                    <Field
                        label="Địa chỉ chi tiết"
                        htmlFor="pickupAddress"
                        error={errors['pickupAddress.addressLine']}
                        required
                    >
                        <textarea
                            id="pickupAddress"
                            value={values.addressLine}
                            className={textareaClassName}
                            placeholder="Số nhà, tên đường, phường/xã, ghi chú lấy hàng nếu có."
                            onChange={(event) =>
                                onChange({ addressLine: event.target.value })
                            }
                        />
                    </Field>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                <MapPinned className="size-8 text-zinc-700" />
                <p className="mt-4 text-sm font-semibold text-zinc-950">
                    Địa chỉ lấy hàng mặc định
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                    Địa chỉ này sẽ được dùng để tính vận chuyển và điều phối đơn
                    đầu tiên của shop.
                </p>
            </div>
        </div>
    );
}
