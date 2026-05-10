import { User, Lock, Camera, ShoppingBag, MapPin } from 'lucide-react';
import type { NavItem } from '../types/nav-item.type';

export const NAV_ITEMS: NavItem[] = [
    { href: '/profile', label: 'Thông tin cá nhân', icon: User, exact: true },
    { href: '/profile/security', label: 'Bảo mật & Mật khẩu', icon: Lock },
    { href: '/profile/avatar', label: 'Ảnh đại diện', icon: Camera },
    { href: '/profile/orders', label: 'Đơn hàng của tôi', icon: ShoppingBag },
    { href: '/profile/addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
];
