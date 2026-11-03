// Tùy chọn hồ sơ đăng ký shop; danh mục ngân hàng dùng chung để mã bank không bị lệch giữa các luồng.
import type { SellerComboboxOption } from '../components/shared/SellerCombobox';
export { BANK_OPTIONS } from '@/constants/bank-options.constant';

export const BUSINESS_MODEL_OPTIONS: SellerComboboxOption[] = [
    {
        value: 'retail',
        label: 'Bán lẻ',
        description: 'Bán trực tiếp cho khách hàng cá nhân.',
    },
    {
        value: 'brand',
        label: 'Thương hiệu chính hãng',
        description: 'Shop sở hữu hoặc đại diện thương hiệu.',
    },
    {
        value: 'distributor',
        label: 'Nhà phân phối',
        description: 'Phân phối hàng từ nhiều thương hiệu hoặc nhà sản xuất.',
    },
];
