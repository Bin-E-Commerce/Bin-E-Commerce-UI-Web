// Bước cấu hình kho lấy hàng của Seller dùng trực tiếp mã master data GHN qua Gateway.

import { useMemo } from 'react';
import { MapPinned } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useShippingLocations } from '../../hooks/useShippingLocations';
import type { SellerRegisterFieldErrors, SellerRegisterFormValues } from '../../types/seller-register-form.type';
import { Field } from '../shared/Field';
import { inputClassName, textareaClassName } from '../shared/form-control.styles';
import { SellerCombobox, type SellerComboboxOption } from '../shared/SellerCombobox';

interface PickupAddressStepProps {
    values: SellerRegisterFormValues['pickupAddress'];
    errors: SellerRegisterFieldErrors;
    onChange: (patch: Partial<SellerRegisterFormValues['pickupAddress']>) => void;
}

// Hiển thị form pickup ba cấp GHN và lưu cả mã lẫn tên để snapshot vận hành ổn định.
export function PickupAddressStep({ values, errors, onChange }: PickupAddressStepProps) {
    const provinceId = values.provinceId ? Number(values.provinceId) : null;
    const districtId = values.districtId ? Number(values.districtId) : null;
    const { provinces, districts, wards, isLoading, error } = useShippingLocations(provinceId, districtId);
    const provinceOptions = useMemo<SellerComboboxOption[]>(() => provinces.map((item) => ({ value: String(item.id), label: item.name })), [provinces]);
    const districtOptions = useMemo<SellerComboboxOption[]>(() => districts.map((item) => ({ value: String(item.id), label: item.name })), [districts]);
    const wardOptions = useMemo<SellerComboboxOption[]>(() => wards.map((item) => ({ value: item.code, label: item.name })), [wards]);

    // Đổi tỉnh phải xóa toàn bộ cấp con để không gửi nhầm mã GHN cũ.
    function handleProvinceChange(value: string): void {
        const option = provinces.find((item) => String(item.id) === value);
        onChange({ provinceId: value, provinceName: option?.name ?? '', districtId: '', districtName: '', wardCode: '', wardName: '' });
    }

    // Đổi quận/huyện phải xóa phường/xã cũ vì wardCode phụ thuộc districtId.
    function handleDistrictChange(value: string): void {
        const option = districts.find((item) => String(item.id) === value);
        onChange({ districtId: value, districtName: option?.name ?? '', wardCode: '', wardName: '' });
    }

    // Lưu mã và tên phường/xã được chọn từ danh sách GHN.
    function handleWardChange(value: string): void {
        const option = wards.find((item) => item.code === value);
        onChange({ wardCode: value, wardName: option?.name ?? '' });
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Người phụ trách lấy hàng" htmlFor="pickupName" error={errors['pickupAddress.contactName']} required>
                    <Input id="pickupName" value={values.contactName} className={inputClassName} placeholder="Tên người liên hệ" onChange={(event) => onChange({ contactName: event.target.value })} />
                </Field>
                <Field label="Số điện thoại lấy hàng" htmlFor="pickupPhone" error={errors['pickupAddress.phone']} required>
                    <Input id="pickupPhone" value={values.phone} className={inputClassName} placeholder="Số điện thoại kho" onChange={(event) => onChange({ phone: event.target.value })} />
                </Field>
                <Field label="Tỉnh / Thành phố" htmlFor="province" error={errors['pickupAddress.provinceId'] ?? error ?? undefined} required>
                    <SellerCombobox id="province" value={values.provinceId} options={provinceOptions} placeholder="Chọn tỉnh / thành phố" emptyMessage="Không tìm thấy tỉnh / thành phố." loading={isLoading && !provinces.length} onValueChange={handleProvinceChange} />
                </Field>
                <Field label="Quận / Huyện" htmlFor="district" error={errors['pickupAddress.districtId']} required>
                    <SellerCombobox id="district" value={values.districtId} options={districtOptions} placeholder={provinceId ? 'Chọn quận / huyện' : 'Chọn tỉnh trước'} emptyMessage="Không tìm thấy quận / huyện." loading={Boolean(provinceId) && isLoading && !districts.length} disabled={!provinceId} onValueChange={handleDistrictChange} />
                </Field>
                <div className="sm:col-span-2">
                    <Field label="Phường / Xã" htmlFor="ward" error={errors['pickupAddress.wardCode']} required>
                        <SellerCombobox id="ward" value={values.wardCode} options={wardOptions} placeholder={districtId ? 'Chọn phường / xã' : 'Chọn quận / huyện trước'} emptyMessage="Không tìm thấy phường / xã." loading={Boolean(districtId) && isLoading && !wards.length} disabled={!districtId} onValueChange={handleWardChange} />
                    </Field>
                </div>
                <div className="sm:col-span-2">
                    <Field label="Địa chỉ chi tiết" htmlFor="pickupAddress" error={errors['pickupAddress.addressLine']} required>
                        <textarea id="pickupAddress" value={values.addressLine} className={textareaClassName} placeholder="Số nhà, tên đường, ghi chú lấy hàng nếu có." onChange={(event) => onChange({ addressLine: event.target.value })} />
                    </Field>
                </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                <MapPinned className="size-8 text-zinc-700" />
                <p className="mt-4 text-sm font-semibold text-zinc-950">Địa chỉ lấy hàng mặc định</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Địa chỉ GHN này được dùng để tính phí và tạo vận đơn cho shop.</p>
            </div>
        </div>
    );
}
