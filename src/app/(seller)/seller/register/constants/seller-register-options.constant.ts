import type { SellerComboboxOption } from '../components/shared/SellerCombobox';

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
        description:
            'Phân phối hàng từ nhiều thương hiệu hoặc nhà sản xuất.',
    },
];

export const BANK_OPTIONS: SellerComboboxOption[] = [
    { value: 'vietcombank', label: 'Vietcombank' },
    { value: 'techcombank', label: 'Techcombank' },
    { value: 'mb-bank', label: 'MB Bank' },
    { value: 'bidv', label: 'BIDV' },
    { value: 'vietinbank', label: 'VietinBank' },
    { value: 'agribank', label: 'Agribank' },
    { value: 'acb', label: 'ACB' },
    { value: 'vpbank', label: 'VPBank' },
    { value: 'tpbank', label: 'TPBank' },
    { value: 'sacombank', label: 'Sacombank' },
    { value: 'hdbank', label: 'HDBank' },
    { value: 'vib', label: 'VIB' },
];

