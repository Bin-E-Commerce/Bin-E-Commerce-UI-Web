import {
    BadgeCheck,
    Banknote,
    ClipboardCheck,
    MapPin,
    Store,
} from 'lucide-react';

import type { SellerRegisterStep } from '../types/seller-register-step.type';

// Cấu hình các bước onboarding để stepper và progress luôn dùng chung một thứ tự.
export const SELLER_REGISTER_STEPS: SellerRegisterStep[] = [
    {
        id: 'shop',
        title: 'Thông tin shop',
        description: 'Tên shop, ngành hàng và nhận diện ban đầu',
        icon: Store,
    },
    {
        id: 'seller',
        title: 'Thông tin người bán',
        description: 'Loại seller và thông tin liên hệ chính',
        icon: BadgeCheck,
    },
    {
        id: 'pickup',
        title: 'Địa chỉ lấy hàng',
        description: 'Kho lấy hàng và người phụ trách vận hành',
        icon: MapPin,
    },
    {
        id: 'payment',
        title: 'Thanh toán',
        description: 'Tài khoản nhận tiền sau đối soát',
        icon: Banknote,
    },
    {
        id: 'review',
        title: 'Xác nhận',
        description: 'Kiểm tra hồ sơ trước khi gửi duyệt',
        icon: ClipboardCheck,
    },
];

