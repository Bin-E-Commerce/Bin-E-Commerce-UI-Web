export interface BankOption {
    value: string;
    label: string;
}

// Dùng chung danh mục demo cho onboarding và đổi tài khoản.
// Danh sách này không xác nhận khả năng chi hộ của một cổng thanh toán.
export const BANK_OPTIONS: BankOption[] = [
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
    { value: 'shb', label: 'SHB' },
    { value: 'seabank', label: 'SeABank' },
    { value: 'ocb', label: 'OCB' },
    { value: 'msb', label: 'MSB' },
    { value: 'eximbank', label: 'Eximbank' },
    { value: 'abbank', label: 'ABBank' },
    { value: 'nam-a-bank', label: 'Nam A Bank' },
    { value: 'bac-a-bank', label: 'Bac A Bank' },
    { value: 'viet-a-bank', label: 'Viet A Bank' },
    { value: 'vietbank', label: 'VietBank' },
    { value: 'bvbank', label: 'BVBank' },
    { value: 'kienlongbank', label: 'KienlongBank' },
    { value: 'pvcombank', label: 'PVcomBank' },
    { value: 'saigonbank', label: 'Saigonbank' },
    { value: 'pgbank', label: 'PGBank' },
    { value: 'lpbank', label: 'LPBank' },
    { value: 'coopbank', label: 'Co-opBank' },
    { value: 'baoviet-bank', label: 'BaoViet Bank' },
    { value: 'ncb', label: 'NCB' },
    { value: 'shinhan-bank', label: 'Shinhan Bank' },
    { value: 'hsbc', label: 'HSBC' },
    { value: 'standard-chartered', label: 'Standard Chartered' },
    { value: 'public-bank', label: 'Public Bank Vietnam' },
    { value: 'woori-bank', label: 'Woori Bank' },
    { value: 'uob', label: 'UOB' },
    { value: 'cimb', label: 'CIMB' },
    { value: 'indovina-bank', label: 'Indovina Bank' },
    { value: 'hong-leong-bank', label: 'Hong Leong Bank' },
];
