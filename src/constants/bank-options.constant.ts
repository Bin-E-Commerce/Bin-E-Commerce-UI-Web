// Danh mục ngân hàng dùng chung cho việc nhập tài khoản nhận và hiển thị tài khoản chuyển tiền.
export interface BankOption {
    value: string;
    label: string;
}

// Mã value phải ổn định vì được lưu cùng tài khoản và dùng để dựng VietQR ở phía trình duyệt.
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
