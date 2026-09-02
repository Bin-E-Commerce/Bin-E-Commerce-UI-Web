// File này chuẩn hóa tên hiển thị ở các khu vực dùng thông tin tài khoản chung.
// Chỉ xử lý dữ liệu tên; file không sở hữu mapping role hoặc nghiệp vụ vận hành.
import type { AuthUser } from '../types/auth.types';

// Nhận diện tên bị mất ký tự tiếng Việt hoặc bị giải mã sai từ nguồn xác thực.
function isUnreadableDisplayName(name: string): boolean {
    return !name.trim() || /[?�ÃÂ]/u.test(name);
}

// Trả về tên có thể đọc được để header và menu tài khoản luôn hiển thị nhất quán.
export function getUserDisplayName(
    user: Pick<AuthUser, 'name'>,
): string {
    return isUnreadableDisplayName(user.name) ? 'Người dùng' : user.name.trim();
}
