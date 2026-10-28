// Kết quả dựng VietQR cục bộ; lỗi rõ ràng để UI quay về hướng dẫn chuyển khoản thủ công.
export type VietQrTransferPayloadResult =
    | { ok: true; payload: string }
    | {
          ok: false;
          reason:
              | 'UNSUPPORTED_BANK'
              | 'MEMO_TOO_LONG'
              | 'INVALID_ACCOUNT'
              | 'INVALID_AMOUNT'
              | 'INVALID_MEMO';
      };
