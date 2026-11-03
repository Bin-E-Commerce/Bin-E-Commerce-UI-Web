import type { VietQrTransferPayloadResult } from '../payouts/vietqr-transfer.types';

// Ghép nội dung chuyển hoàn nhìn thấy được với payload QR để admin đối chiếu trước khi quét.
export interface VietQrRefundTransfer {
    transferMemo: string;
    result: VietQrTransferPayloadResult;
}
