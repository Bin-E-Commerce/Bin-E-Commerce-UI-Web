// Tiện ích chuẩn hóa địa chỉ profile trước khi gửi sang Auth Service.
// File này chỉ xử lý dữ liệu trình bày và payload, không gọi API hoặc quản lý trạng thái form.

import type { CreateAddressPayload, UserAddress } from '@/services/auth';

// Chuyển địa chỉ đã lưu thành payload đầy đủ mã GHN để cập nhật địa chỉ mặc định an toàn.
// Nếu bản ghi cũ thiếu một mã định danh GHN bắt buộc, hàm trả null để UI yêu cầu người dùng chỉnh sửa.
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

// Ghép địa chỉ chi tiết theo dữ liệu GHN mới, fallback về tên cũ để hiển thị bản ghi legacy.
export function getAddressLocation(address: UserAddress): string {
    return [
        address.street,
        address.ghnWardName ?? address.ward,
        address.ghnDistrictName ?? address.district,
        address.ghnProvinceName ?? address.province,
    ]
        .filter(Boolean)
        .join(', ');
}
