// Cấu hình các mục điều hướng chính được dùng chung cho desktop header.
// Chỉ giữ lối vào trang chủ và shop nội bộ để menu tập trung vào các luồng hiện đang cần giới thiệu.

import { Store } from 'lucide-react';

import type { NavLink } from '../types/nav-link.type';

export const NAV_LINKS: NavLink[] = [
    { href: '/', label: 'Trang chủ', exact: true },
    { href: '/internal-shop', label: 'Shop nội bộ', icon: Store },
];
