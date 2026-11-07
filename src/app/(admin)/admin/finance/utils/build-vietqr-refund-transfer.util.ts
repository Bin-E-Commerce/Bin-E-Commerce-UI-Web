// Dựng lệnh VietQR hoàn tiền từ hồ sơ admin; payload chỉ được tạo khi có mã ngân hàng và tài khoản khách.
import type { AdminFinanceRefund } from '@/services/admin/types/finance.types';
import { buildVietQrTransferPayload } from './build-vietqr-transfer-payload.util';
import type { VietQrRefundTransfer } from '../types/refunds/vietqr-refund-transfer.types';

// Chỉ dựng QR cho khoản hoàn Pay2S có đủ tài khoản và chưa phát hiện OUT; backend cấp memo để webhook ghép đúng attempt.
export function buildVietQrRefundTransfer(
    refund: AdminFinanceRefund,
): VietQrRefundTransfer | null {
    if (
        refund.sourceType !== 'PAYMENT_ATTEMPT' ||
        !refund.refundBankCode ||
        !refund.refundAccountNumber ||
        !refund.refundTransferMemo ||
        refund.refundOutTransactionId
    ) {
        return null;
    }

    const transferMemo = refund.refundTransferMemo;
    // Hàm dùng chung kiểm tra BIN, số tiền, số tài khoản và giới hạn nội dung trước khi dựng EMV QR.
    const result = buildVietQrTransferPayload({
        bankCode: refund.refundBankCode,
        accountNumber: refund.refundAccountNumber,
        amount: refund.amount,
        transferMemo,
    });
    return { transferMemo, result };
}
