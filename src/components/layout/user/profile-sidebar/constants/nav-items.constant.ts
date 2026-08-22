import {
    Camera,
    Lock,
    MapPin,
    MonitorSmartphone,
    ShoppingBag,
    Store,
    User,
} from 'lucide-react';

import type { NavItem } from '../types/nav-item.type';

// Cấu hình sidebar tài khoản; entry seller đặt ở đây vì đây là nơi người dùng quản lý vai trò tài khoản.
export const NAV_ITEMS: NavItem[] = [
    { href: '/profile', label: 'Thông tin cá nhân', icon: User, exact: true },
    { href: '/profile/security', label: 'Bảo mật & Mật khẩu', icon: Lock },
    { href: '/profile/sessions', label: 'Phiên đăng nhập', icon: MonitorSmartphone },
    { href: '/profile/avatar', label: 'Ảnh đại diện', icon: Camera },
    { href: '/profile/orders', label: 'Đơn hàng của tôi', icon: ShoppingBag },
    { href: '/profile/addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
    { href: '/seller/register', label: 'Đăng ký bán hàng', icon: Store },
];
