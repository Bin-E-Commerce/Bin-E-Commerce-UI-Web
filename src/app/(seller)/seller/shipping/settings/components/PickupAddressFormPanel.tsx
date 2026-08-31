// Form quản lý kho lấy hàng Seller, dùng trực tiếp ba cấp mã GHN qua Gateway.

'use client';

import { useMemo, useState } from 'react';
import { MapPin, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '../../../register/components/shared/Field';
import { SellerCombobox, type SellerComboboxOption } from '../../../register/components/shared/SellerCombobox';
import { useShippingLocations } from '../../../register/hooks/useShippingLocations';
import type { PickupAddress } from '@/services/seller';

export interface PickupAddressFormValues {
    contactName: string;
    phone: string;
    provinceId: string;
    provinceName: string;
    districtId: string;
    districtName: string;
    wardCode: string;
    wardName: string;
    addressLine: string;
}

interface PickupAddressFormPanelProps {
    editingAddress?: PickupAddress;
    isPending: boolean;
    onCancelEdit: () => void;
    onSubmit: (values: PickupAddressFormValues) => void;
}

const EMPTY_ADDRESS: PickupAddressFormValues = { contactName: '', phone: '', provinceId: '', provinceName: '', districtId: '', districtName: '', wardCode: '', wardName: '', addressLine: '' };

// Chuyển address đã lưu về controlled state để chế độ sửa và thêm dùng chung một form.
function getInitialAddress(address?: PickupAddress): PickupAddressFormValues {
    if (!address) return EMPTY_ADDRESS;
    return { contactName: address.contactName, phone: address.phone, provinceId: address.ghnProvinceId ? String(address.ghnProvinceId) : '', provinceName: address.ghnProvinceName ?? '', districtId: address.ghnDistrictId ? String(address.ghnDistrictId) : '', districtName: address.ghnDistrictName ?? '', wardCode: address.ghnWardCode ?? '', wardName: address.ghnWardName ?? '', addressLine: address.addressLine };
}

// Render form pickup bắt buộc đủ provinceId, districtId và wardCode trước khi submit.
export function PickupAddressFormPanel({ editingAddress, isPending, onCancelEdit, onSubmit }: PickupAddressFormPanelProps) {
    const [values, setValues] = useState<PickupAddressFormValues>(() => getInitialAddress(editingAddress));
    const provinceId = values.provinceId ? Number(values.provinceId) : null;
    const districtId = values.districtId ? Number(values.districtId) : null;
    const { provinces, districts, wards, isLoading, error } = useShippingLocations(provinceId, districtId);
    const provinceOptions = useMemo<SellerComboboxOption[]>(() => provinces.map((item) => ({ value: String(item.id), label: item.name })), [provinces]);
    const districtOptions = useMemo<SellerComboboxOption[]>(() => districts.map((item) => ({ value: String(item.id), label: item.name })), [districts]);
    const wardOptions = useMemo<SellerComboboxOption[]>(() => wards.map((item) => ({ value: item.code, label: item.name })), [wards]);
    const updateValues = (patch: Partial<PickupAddressFormValues>) => setValues((previous) => ({ ...previous, ...patch }));
    const canSubmit = Boolean(values.contactName.trim() && values.phone.trim() && values.provinceId && values.districtId && values.wardCode && values.addressLine.trim() && !error);

    // Chọn tỉnh mới thì xóa toàn bộ mã cấp dưới.
    function changeProvince(value: string): void {
        const item = provinces.find((option) => String(option.id) === value);
        updateValues({ provinceId: value, provinceName: item?.name ?? '', districtId: '', districtName: '', wardCode: '', wardName: '' });
    }

    // Chọn quận/huyện mới thì xóa wardCode không còn tương thích.
    function changeDistrict(value: string): void {
        const item = districts.find((option) => String(option.id) === value);
        updateValues({ districtId: value, districtName: item?.name ?? '', wardCode: '', wardName: '' });
    }

    // Lưu wardCode cùng tên chuẩn hóa từ master data GHN.
    function changeWard(value: string): void {
        const item = wards.find((option) => option.code === value);
        updateValues({ wardCode: value, wardName: item?.name ?? '' });
    }

    return <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="pickup-address-form-title">
        <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white"><MapPin className="size-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{editingAddress ? 'Cập nhật kho' : 'Thêm kho mới'}</p><h2 id="pickup-address-form-title" className="mt-1 text-lg font-semibold text-zinc-950">{editingAddress ? 'Chỉnh sửa địa chỉ lấy hàng' : 'Thêm địa chỉ lấy hàng'}</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Chọn địa chỉ từ danh sách GHN để tính phí và tạo vận đơn chính xác.</p></div></div>
        <div className="mt-6 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Người liên hệ" htmlFor="pickup-contact" required><input id="pickup-contact" className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" value={values.contactName} onChange={(event) => updateValues({ contactName: event.target.value })} placeholder="Nguyễn Văn A" /></Field><Field label="Số điện thoại" htmlFor="pickup-phone" required><input id="pickup-phone" className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" value={values.phone} onChange={(event) => updateValues({ phone: event.target.value })} placeholder="09xxxxxxxx" /></Field></div>
            <Field label="Tỉnh / Thành phố" htmlFor="pickup-province" required><SellerCombobox id="pickup-province" value={values.provinceId} options={provinceOptions} placeholder="Chọn tỉnh / thành phố" emptyMessage="Không tìm thấy tỉnh / thành phố." loading={isLoading && !provinces.length} onValueChange={changeProvince} /></Field>
            <Field label="Quận / Huyện" htmlFor="pickup-district" required><SellerCombobox id="pickup-district" value={values.districtId} options={districtOptions} placeholder={provinceId ? 'Chọn quận / huyện' : 'Chọn tỉnh trước'} emptyMessage="Không tìm thấy quận / huyện." loading={Boolean(provinceId) && isLoading && !districts.length} disabled={!provinceId} onValueChange={changeDistrict} /></Field>
            <Field label="Phường / Xã" htmlFor="pickup-ward" required><SellerCombobox id="pickup-ward" value={values.wardCode} options={wardOptions} placeholder={districtId ? 'Chọn phường / xã' : 'Chọn quận / huyện trước'} emptyMessage="Không tìm thấy phường / xã." loading={Boolean(districtId) && isLoading && !wards.length} disabled={!districtId} onValueChange={changeWard} /></Field>
            <Field label="Địa chỉ chi tiết" htmlFor="pickup-address" required><input id="pickup-address" className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950" value={values.addressLine} onChange={(event) => updateValues({ addressLine: event.target.value })} placeholder="Số nhà, tên đường..." /></Field>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{editingAddress ? <Button type="button" variant="outline" className="cursor-pointer" onClick={onCancelEdit}><RotateCcw className="size-4" />Hủy sửa</Button> : null}<Button type="button" className="cursor-pointer" disabled={!canSubmit || isPending} onClick={() => onSubmit(values)}><Save className="size-4" />{isPending ? 'Đang lưu...' : editingAddress ? 'Lưu thay đổi' : 'Thêm địa chỉ'}</Button></div>
    </section>;
}
