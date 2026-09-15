// Cấu hình các mục điều hướng chính được dùng chung cho desktop header.
// Giữ các lối vào chính của storefront và thêm một điểm vào nổi bật cho khu showcase hệ thống.

import { Star, Store } from 'lucide-react';

import type { NavLink } from '../types/nav-link.type';

export const NAV_LINKS: NavLink[] = [
    { href: '/', label: 'Trang chủ', exact: true },
    { href: '/internal-shop', label: 'Shop nội bộ', icon: Store },
    { href: '/showcase', label: 'Tính năng nổi bật', icon: Star, exact: true },
];
