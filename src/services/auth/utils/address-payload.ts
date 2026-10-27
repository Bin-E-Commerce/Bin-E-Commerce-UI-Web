// Tiện ích chuyển địa chỉ đã lưu thành payload đầy đủ để Auth Service cập nhật an toàn.
// File này không gọi API; các feature checkout và profile cùng dùng một quy tắc chuẩn hóa.

import type { CreateAddressPayload, UserAddress } from '../types/auth.types';

// Bổ sung đủ tên và mã GHN trước khi đổi địa chỉ mặc định để không làm mất dữ liệu hành chính.
// Địa chỉ legacy thiếu mã không được gửi lên server; UI phải yêu cầu người dùng chỉnh sửa trước.
export function toAddressPayload(
    address: UserAddress,
): CreateAddressPayload | null {
    if (
        !address.ghnProvinceId ||
        !address.ghnProvinceName ||
        !address.ghnDistrictId ||
        !address.ghnDistrictName ||
        !address.ghnWardCode ||
        !address.ghnWardName
    ) {
        return null;
    }

    return {
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        province: address.ghnProvinceName,
        ghnProvinceId: address.ghnProvinceId,
        ghnProvinceName: address.ghnProvinceName,
        district: address.ghnDistrictName,
        ghnDistrictId: address.ghnDistrictId,
        ghnDistrictName: address.ghnDistrictName,
        ward: address.ghnWardName,
        ghnWardCode: address.ghnWardCode,
        ghnWardName: address.ghnWardName,
        street: address.street,
        isDefault: address.isDefault,
    };
}
