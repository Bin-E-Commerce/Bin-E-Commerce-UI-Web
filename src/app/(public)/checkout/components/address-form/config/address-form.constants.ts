// Chứa giá trị mặc định để form địa chỉ có cùng trạng thái khởi tạo.

import type { CheckoutAddressFormState } from '@/app/(public)/checkout/schemas/checkout-address.schema';

export const DEFAULT_ADDRESS: CheckoutAddressFormState = {
    fullName: '',
    phone: '',
    provinceId: '',
    provinceName: '',
    districtId: '',
    districtName: '',
    wardCode: '',
    wardName: '',
    label: 'Nhà riêng',
    street: '',
};

export const ADDRESS_LABEL_VALUES = [
    'Nhà riêng',
    'Cơ quan',
    'Nhà bố mẹ',
    'Nhà trọ',
    'Khác',
] as const;
