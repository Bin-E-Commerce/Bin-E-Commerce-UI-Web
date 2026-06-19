import { Camera, Lock, MapPin, MonitorSmartphone, ShoppingBag, User } from 'lucide-react';
import type { NavItem } from '../types/nav-item.type';

// Cấu hình các mục trong sidebar tài khoản; thêm trang profile mới thì thêm một item vào đây.
// Chỉ đặt exact: true cho route gốc /profile để không bị active khi đang ở các route con.
export const NAV_ITEMS: NavItem[] = [
    { href: '/profile', label: 'Thông tin cá nhân', icon: User, exact: true },
    { href: '/profile/security', label: 'Bảo mật & Mật khẩu', icon: Lock },
    { href: '/profile/sessions', label: 'Phiên đăng nhập', icon: MonitorSmartphone },
    { href: '/profile/avatar', label: 'Ảnh đại diện', icon: Camera },
    { href: '/profile/orders', label: 'Đơn hàng của tôi', icon: ShoppingBag },
    { href: '/profile/addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
];
