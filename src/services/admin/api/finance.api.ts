// Adapter HTTP của admin finance; quyền và trạng thái nghiệp vụ được kiểm tra lại trong API Gateway/Order Service.
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    AdminFinancePage,
    AdminFinanceCodRemittance,
    AdminFinanceSnapshot,
    AdminFinanceWithdrawal,
    AdminFinanceWithdrawalDetail,
    AdminFinanceRefundRequest,
    AdminSellerPayoutResult,
    AdminPayoutReadiness,
} from '@/services/admin/types/finance.types';

const financeUrl = `${API_BASE_URL}${API_VERSION}/admin/finance`;

// Đọc khả năng truy cập Kênh Chi và số dư payout payOS mà không tải khóa cấu hình về browser.
export async function getAdminPayoutReadiness(): Promise<AdminPayoutReadiness> {
    const response = await authorizedAxios.get<AdminPayoutReadiness>(
        `${financeUrl}/payout-readiness`,
    );
    return response.data;
}

// Tải dashboard sổ tiền và trang ledger có giới hạn.
export async function getAdminFinance(
    page = 1,
    pageSize = 20,
): Promise<AdminFinanceSnapshot> {
    const response = await authorizedAxios.get<AdminFinanceSnapshot>(
        `${financeUrl}/overview`,
        { params: { page, pageSize } },
    );
    return response.data;
}

// Tải danh sách payout theo trạng thái; response chỉ có account number đã mask.
export async function getAdminWithdrawals(
    status?: string,
): Promise<AdminFinancePage<AdminFinanceWithdrawal>> {
    const response = await authorizedAxios.get<
        AdminFinancePage<AdminFinanceWithdrawal>
    >(`${financeUrl}/withdrawals`, {
        params: { page: 1, pageSize: 50, status },
    });
    return response.data;
}

// Lấy các đơn COD đủ điều kiện đối soát, giới hạn trang để không tải toàn bộ lịch sử.
export async function getPendingAdminCodRemittances(
    page = 1,
    pageSize = 50,
): Promise<AdminFinancePage<AdminFinanceCodRemittance>> {
    const response = await authorizedAxios.get<
        AdminFinancePage<AdminFinanceCodRemittance>
    >(`${financeUrl}/cod-remittances`, { params: { page, pageSize } });
    return response.data;
}

// Ghi mã đối soát sau khi admin kiểm tra tiền COD đã về; backend sẽ mở khóa ví seller đúng một lần.
export async function confirmAdminCodRemittance(
    orderId: string,
    reference: string,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/cod-remittances/${orderId}/confirmation`,
        { reference },
    );
}

// Chi tiết payout chứa số tài khoản đầy đủ nên chỉ gọi khi admin mở đúng yêu cầu.
export async function getAdminWithdrawal(
    withdrawalId: string,
): Promise<AdminFinanceWithdrawalDetail> {
    const response = await authorizedAxios.get<AdminFinanceWithdrawalDetail>(
        `${financeUrl}/withdrawals/${withdrawalId}`,
    );
    return response.data;
}

// Yêu cầu backend chi payout qua payOS; mọi retry dùng cùng mã tham chiếu và idempotency key theo withdrawal.
export async function processAdminWithdrawalPayout(
    withdrawalId: string,
    note?: string,
): Promise<AdminSellerPayoutResult> {
    const response = await authorizedAxios.post<AdminSellerPayoutResult>(
        `${financeUrl}/withdrawals/${withdrawalId}/payout`,
        { note },
    );
    return response.data;
}

// Đồng bộ trạng thái lệnh đang chạy; endpoint không tạo thêm giao dịch khi payOS chưa tìm thấy lệnh.
export async function syncAdminWithdrawalPayout(
    withdrawalId: string,
): Promise<AdminSellerPayoutResult> {
    const response = await authorizedAxios.post<AdminSellerPayoutResult>(
        `${financeUrl}/withdrawals/${withdrawalId}/payout/sync`,
    );
    return response.data;
}

// Từ chối yêu cầu trước khi payout bắt đầu để backend hoàn khoản giữ chỗ cho seller đúng một lần.
export async function rejectAdminWithdrawal(
    withdrawalId: string,
    note?: string,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/withdrawals/${withdrawalId}/reject`,
        { note },
    );
}

// Tạo một nhóm đối soát từ các ledger ids đã chọn.
export async function createAdminSettlementBatch(
    ledgerIds: string[],
    note?: string,
): Promise<{ id: string; ledgerCount: number }> {
    const response = await authorizedAxios.post<{
        id: string;
        ledgerCount: number;
    }>(`${financeUrl}/settlement-batches`, { ledgerIds, note });
    return response.data;
}

// Đánh dấu một đợt đã được admin kiểm tra mà không đổi số dư seller.
export async function reconcileAdminSettlementBatch(
    batchId: string,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/settlement-batches/${batchId}/reconcile`,
    );
}

// Xác nhận refund của return request; Order Service kiểm tra payment method, amount và idempotency.
export async function confirmAdminPay2sRefund(
    returnRequestId: string,
    body: AdminFinanceRefundRequest,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/refunds/${returnRequestId}/confirmation`,
        body,
    );
}

// Xác nhận refund cho payment đến muộn sau khi order đã hủy; không reverse seller wallet.
export async function confirmAdminPay2sLateRefund(
    orderId: string,
    body: AdminFinanceRefundRequest,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/late-refunds/${orderId}/confirmation`,
        body,
    );
}
