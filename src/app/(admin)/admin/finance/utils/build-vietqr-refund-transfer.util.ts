// Dựng lệnh VietQR hoàn tiền từ hồ sơ admin; payload chỉ được tạo khi có mã ngân hàng và tài khoản khách.
import type { AdminFinanceRefund } from '@/services/admin/types/finance.types';
import { buildVietQrTransferPayload } from './build-vietqr-transfer-payload.util';
import type { VietQrRefundTransfer } from '../types/refunds/vietqr-refund-transfer.types';

// Chỉ dựng QR cho khoản hoàn Pay2S có đủ tài khoản; memo ngắn mang mã đơn để người nhận đối chiếu.
export function buildVietQrRefundTransfer(
    refund: AdminFinanceRefund,
): VietQrRefundTransfer | null {
    if (
        refund.sourceType !== 'PAYMENT_ATTEMPT' ||
        !refund.refundBankCode ||
        !refund.refundAccountNumber
    ) {
        return null;
    }

    const transferMemo = `HOAN ${refund.orderNumber.replace(/[^a-z\d]/gi, '')}`;
    // Hàm dùng chung kiểm tra BIN, số tiền, số tài khoản và giới hạn nội dung trước khi dựng EMV QR.
    const result = buildVietQrTransferPayload({
        bankCode: refund.refundBankCode,
        accountNumber: refund.refundAccountNumber,
        amount: refund.amount,
        transferMemo,
    });
    return { transferMemo, result };
}
