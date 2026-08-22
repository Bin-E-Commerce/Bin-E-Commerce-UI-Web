import { Zap } from 'lucide-react';

import type { NavLink } from '../types/nav-link.type';

export const NAV_LINKS: NavLink[] = [
    { href: '/', label: 'Trang chủ', exact: true },
    { href: '/products', label: 'Sản phẩm' },
    { href: '/categories', label: 'Danh mục' },
    { href: '/flash-sale', label: 'Flash Sale', icon: Zap, highlight: true },
];
