export interface BankOption {
    value: string;
    label: string;
}

// Dùng chung một danh mục ngân hàng cho onboarding và yêu cầu đổi tài khoản nhận tiền.
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
];
