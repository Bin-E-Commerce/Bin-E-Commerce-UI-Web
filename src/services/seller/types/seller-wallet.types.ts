// Hợp đồng ví seller chỉ đọc số dư và ledger; không mô tả hoặc ngầm mở chức năng rút tiền.
export interface SellerWalletSnapshot {
    shopId: string;
    pendingBalance: string;
    availableBalance: string;
    transactions: Array<{
        id: string;
        orderId: string;
        returnRequestId: string | null;
        kind: string;
        amount: string;
        createdAt: string;
        availableAt: string | null;
    }>;
    total: number;
    page: number;
    pageSize: number;
}
