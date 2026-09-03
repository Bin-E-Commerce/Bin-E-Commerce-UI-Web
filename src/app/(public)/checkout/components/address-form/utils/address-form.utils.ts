// Gom các hàm chuyển đổi dữ liệu form để component chính chỉ điều phối luồng.

import type { CreateAddressPayload, UserAddress } from '@/services/auth';
import type {
    GhnDistrictOption,
    GhnProvinceOption,
    GhnWardOption,
} from '@/services/shipping';
import type { CheckoutAddressFormState } from '@/app/(public)/checkout/schemas/checkout-address.schema';
import {
    ADDRESS_LABEL_VALUES,
    DEFAULT_ADDRESS,
} from '../config/address-form.constants';

// Chuẩn hóa nhãn địa chỉ cũ về một giá trị mà form hiện tại hỗ trợ.
export function normalizeAddressLabel(
    label: string,
): CheckoutAddressFormState['label'] {
    return ADDRESS_LABEL_VALUES.includes(
        label as (typeof ADDRESS_LABEL_VALUES)[number],
    )
        ? (label as CheckoutAddressFormState['label'])
        : 'Khác';
}

// Tạo dữ liệu ban đầu từ địa chỉ đã lưu hoặc trả về form trống.
export function getInitialAddressValues(
    address?: UserAddress,
): CheckoutAddressFormState {
    if (!address) {
        return DEFAULT_ADDRESS;
    }

    return {
        fullName: address.fullName,
        phone: address.phone,
        provinceId: address.ghnProvinceId ? String(address.ghnProvinceId) : '',
        provinceName: address.ghnProvinceName ?? '',
        districtId: address.ghnDistrictId ? String(address.ghnDistrictId) : '',
        districtName: address.ghnDistrictName ?? '',
        wardCode: address.ghnWardCode ?? '',
        wardName: address.ghnWardName ?? '',
        label: normalizeAddressLabel(address.label),
        street: address.street,
    };
}

// Chuyển dữ liệu form thành payload Auth Service có đủ mã và tên GHN.
export function buildAddressPayload(
    values: CheckoutAddressFormState,
    isDefault: boolean,
): CreateAddressPayload {
    return {
        label: values.label,
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        province: values.provinceName,
        ghnProvinceId: Number(values.provinceId),
        ghnProvinceName: values.provinceName,
        district: values.districtName,
        ghnDistrictId: Number(values.districtId),
        ghnDistrictName: values.districtName,
        ward: values.wardName,
        ghnWardCode: values.wardCode,
        ghnWardName: values.wardName,
        street: values.street.trim(),
        isDefault,
    };
}

// Lấy value ổn định cho tỉnh, quận/huyện và phường/xã mà không lưu object vào form.
export function optionValue(
    option: GhnProvinceOption | GhnDistrictOption | GhnWardOption,
): string {
    return 'code' in option ? option.code : String(option.id);
}

// Lấy tên hiển thị thống nhất cho mọi option địa chỉ GHN.
export function optionName(
    option: GhnProvinceOption | GhnDistrictOption | GhnWardOption,
): string {
    return option.name;
}
