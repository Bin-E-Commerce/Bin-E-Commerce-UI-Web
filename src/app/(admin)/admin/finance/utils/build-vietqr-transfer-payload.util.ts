// Dựng payload VietQR ngay trong trình duyệt để thông tin người nhận không phải gửi sang dịch vụ tạo QR bên ngoài.
import type { AdminFinanceWithdrawalDetail } from '@/services/admin/types/finance.types';
import { VIETQR_TRANSFER_BANK_BINS } from '../constants/vietqr-transfer-bank-bins.constant';
import type { VietQrTransferPayloadResult } from '../types/payouts/vietqr-transfer.types';

// Kiểm tra bank BIN, số tài khoản, tiền VND và memo trước khi tạo QR chuyển khoản động.
// Memo vượt giới hạn 23 ký tự hoặc ngân hàng chưa hỗ trợ sẽ trả lý do rõ ràng để UI dùng hướng dẫn thủ công.
// QR chỉ chứa dữ liệu lệnh chuyển; Pay2S và admin vẫn giữ nguyên bước đối soát/xác nhận sau khi ngân hàng gửi tiền.
export function buildVietQrTransferPayload(
    withdrawal: Pick<
        AdminFinanceWithdrawalDetail,
        'bankCode' | 'accountNumber' | 'amount' | 'transferMemo'
    >,
): VietQrTransferPayloadResult {
    const bankBin =
        VIETQR_TRANSFER_BANK_BINS[withdrawal.bankCode.trim().toLowerCase()];
    if (!bankBin) return { ok: false, reason: 'UNSUPPORTED_BANK' };

    const accountNumber = withdrawal.accountNumber.trim();
    if (!/^\d{6,19}$/.test(accountNumber))
        return { ok: false, reason: 'INVALID_ACCOUNT' };

    const amount = withdrawal.amount.trim().replace(/\.0{1,2}$/, '');
    if (!/^[1-9]\d{0,11}$/.test(amount))
        return { ok: false, reason: 'INVALID_AMOUNT' };

    const transferMemo = withdrawal.transferMemo.trim().toUpperCase();
    if (transferMemo.length > 23) return { ok: false, reason: 'MEMO_TOO_LONG' };
    if (!/^[A-Z0-9 ]+$/.test(transferMemo))
        return { ok: false, reason: 'INVALID_MEMO' };

    // Thông tin thụ hưởng dùng BIN + số tài khoản theo NAPAS QRIBFTTA; không đưa tên người nhận tự nhập vào payload.
    const beneficiary =
        createTlv('00', bankBin) + createTlv('01', accountNumber);
    const bankAccount =
        createTlv('00', 'A000000727') +
        createTlv('01', beneficiary) +
        createTlv('02', 'QRIBFTTA');
    const additionalData = createTlv('08', transferMemo);
    const payloadWithoutCrc =
        createTlv('00', '01') +
        createTlv('01', '12') +
        createTlv('38', bankAccount) +
        createTlv('53', '704') +
        createTlv('54', amount) +
        createTlv('58', 'VN') +
        createTlv('62', additionalData) +
        '6304';

    return {
        ok: true,
        payload: `${payloadWithoutCrc}${calculateCrc16(payloadWithoutCrc)}`,
    };
}

// Ghi TLV hai chữ số theo VietQR; toàn bộ trường đầu vào đã được giới hạn và chuẩn hóa trước khi ghép.
function createTlv(tag: string, value: string): string {
    return `${tag}${String(value.length).padStart(2, '0')}${value}`;
}

// Tính CRC-16/CCITT-FALSE trên payload ASCII đã kết thúc bằng trường kiểm tra 6304.
function calculateCrc16(value: string): string {
    let crc = 0xffff;
    for (let index = 0; index < value.length; index += 1) {
        crc ^= value.charCodeAt(index) << 8;
        for (let bit = 0; bit < 8; bit += 1) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
            crc &= 0xffff;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}
