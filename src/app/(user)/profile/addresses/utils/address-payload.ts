// Tiện ích chuẩn hóa địa chỉ profile trước khi gửi sang Auth Service.
// File này chỉ xử lý dữ liệu trình bày và payload, không gọi API hoặc quản lý trạng thái form.

import type { UserAddress } from '@/services/auth';

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
