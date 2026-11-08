// Dựng VietQR hoàn tiền từ hồ sơ admin.
// Utility không gửi tiền và không xác nhận giao dịch thay cho admin.
import type { AdminFinanceRefund } from '@/services/admin/types/finance.types';
import { buildVietQrTransferPayload } from './build-vietqr-transfer-payload.util';
import type { VietQrRefundTransfer } from '../types/refunds/vietqr-refund-transfer.types';

// Chỉ dựng QR cho payment attempt hoặc yêu cầu trả hàng có tài khoản nhận.
// Bỏ qua hồ sơ đã có giao dịch OUT để không hiện mã cho khoản đã chuyển.
// Attempt dùng memo HOAN từ server để webhook đối soát.
// Return dùng memo RET riêng và vẫn cần admin xác nhận thủ công.
export function buildVietQrRefundTransfer(
    refund: AdminFinanceRefund,
): VietQrRefundTransfer | null {
    const isPaymentAttempt = refund.sourceType === 'PAYMENT_ATTEMPT';
    const isOrderReturn = refund.sourceType === 'ORDER_RETURN';
    if (
        (!isPaymentAttempt && !isOrderReturn) ||
        !refund.refundBankCode ||
        !refund.refundAccountNumber ||
        refund.refundOutTransactionId
    ) {
        return null;
    }

    // Return chưa được webhook xử lý; memo RET dựa UUID để đối chiếu riêng,
    // không thể bị parser HOAN hiểu nhầm.
    const transferMemo = isPaymentAttempt
        ? refund.refundTransferMemo
        : createReturnRefundTransferMemo(refund.id);
    if (!transferMemo) return null;

    // Hàm dùng chung kiểm tra BIN, số tiền, số tài khoản và giới hạn memo
    // trước khi dựng EMV QR.
    const result = buildVietQrTransferPayload({
        bankCode: refund.refundBankCode,
        accountNumber: refund.refundAccountNumber,
        amount: refund.amount,
        transferMemo,
    });
    return { transferMemo, result };
}

// Rút gọn UUID return thành memo VietQR 22 ký tự.
// Prefix RET tách mã này khỏi parser HOAN đang xử lý webhook.
function createReturnRefundTransferMemo(
    returnRequestId: string,
): string | null {
    const compactId = returnRequestId
        .replaceAll('-', '')
        .slice(0, 18)
        .toUpperCase();
    if (!/^[0-9A-F]{18}$/.test(compactId)) return null;
    return `RET ${compactId}`;
}
