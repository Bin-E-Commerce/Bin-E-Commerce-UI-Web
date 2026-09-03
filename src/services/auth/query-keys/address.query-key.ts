// File này định nghĩa query key dùng chung cho địa chỉ giao hàng của Customer.
// Key có userId để tránh dùng nhầm cache khi tài khoản đăng xuất rồi đăng nhập tài khoản khác.

// Tạo một query key duy nhất để checkout và trang profile luôn đọc cùng một danh sách địa chỉ.
export function getUserAddressesQueryKey(userId?: string | null) {
    return ['user-addresses', userId ?? 'anonymous'] as const;
}
