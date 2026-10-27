// Hợp đồng ví seller chỉ đọc số dư và ledger; không mô tả hoặc ngầm mở chức năng rút tiền.
export interface SellerWalletSnapshot {
    shopId: string;
    pendingBalance: string;
    availableBalance: string;
    reservedBalance: string;
    transactions: Array<{
        id: string;
        orderId: string | null;
        // Mã công khai hiển thị đồng nhất với trang quản lý đơn hàng.
        orderNumber: string | null;
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

// Danh sách rút chỉ gồm snapshot tài khoản đã mask và trạng thái xử lý.
export interface SellerWalletWithdrawal {
    id: string;
    shopId: string;
    amount: string;
    bankName: string;
    accountHolder: string;
    accountNumberMasked: string;
    status: 'REQUESTED' | 'PROCESSING' | 'PAID' | 'REJECTED' | 'FAILED';
    transferReference: string | null;
    adminNote: string | null;
    createdAt: string;
    processedAt: string | null;
}

// Endpoint nạp trả URL Sandbox; chỉ callback IPN hợp lệ mới đổi balance hoặc status thành PAID.
export interface SellerWalletDepositResponse {
    deposit: {
        id: string;
        amount: string;
        status: string;
        createdAt: string;
        confirmedAt: string | null;
    };
    paymentUrl: string;
}
