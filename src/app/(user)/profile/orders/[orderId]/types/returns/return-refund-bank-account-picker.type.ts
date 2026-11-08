// Contract cho bộ chọn tài khoản hoàn trong các form return của trang chi tiết đơn hàng.
export interface ReturnRefundBankAccountPickerProps {
    selectedAccountId: string;
    onAccountChange: (accountId: string) => void;
}
