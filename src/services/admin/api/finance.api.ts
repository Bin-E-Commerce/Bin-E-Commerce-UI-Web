// Adapter HTTP của admin finance; quyền và trạng thái nghiệp vụ được kiểm tra lại trong API Gateway/Order Service.
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    AdminFinancePage,
    AdminFinanceCodRemittance,
    AdminFinanceLedgerEntry,
    AdminFinanceSnapshot,
    AdminFinanceWithdrawal,
    AdminFinanceWithdrawalDetail,
    AdminPayoutReadiness,
} from '@/services/admin/types/finance.types';

const financeUrl = `${API_BASE_URL}${API_VERSION}/admin/finance`;

// Đọc trạng thái cấu hình webhook Pay2S mà không tải bearer token về browser.
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

// Tải trang payout theo trạng thái; response chỉ có account number đã mask.
export async function getAdminWithdrawals(
    page = 1,
    pageSize = 20,
    status?: string,
): Promise<AdminFinancePage<AdminFinanceWithdrawal>> {
    const response = await authorizedAxios.get<
        AdminFinancePage<AdminFinanceWithdrawal>
    >(`${financeUrl}/withdrawals`, {
        params: { page, pageSize, status },
    });
    return response.data;
}

// Tải một trang ledger nền tảng; dữ liệu tài khoản seller không nằm trong response này.
export async function getAdminLedger(
    page = 1,
    pageSize = 20,
): Promise<AdminFinancePage<AdminFinanceLedgerEntry>> {
    const response = await authorizedAxios.get<
        AdminFinancePage<AdminFinanceLedgerEntry>
    >(`${financeUrl}/ledger`, { params: { page, pageSize } });
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

// Chuyển yêu cầu sang PROCESSING trước khi admin tự chuyển bằng app ngân hàng; endpoint không gửi tiền.
export async function startAdminWithdrawalProcessing(
    withdrawalId: string,
    manualTransferAcknowledged: boolean,
    note?: string,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/withdrawals/${withdrawalId}/processing`,
        { manualTransferAcknowledged, note },
    );
}

// Chốt payout sau khi webhook có event OUT và admin xác nhận đã kiểm tra đúng tài khoản nhận.
export async function confirmAdminWithdrawalTransfer(
    withdrawalId: string,
    recipientConfirmed: boolean,
    note?: string,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/withdrawals/${withdrawalId}/transfer-confirmation`,
        { recipientConfirmed, note },
    );
}

// Từ chối yêu cầu trước khi payout bắt đầu để backend hoàn khoản giữ chỗ cho seller đúng một lần.
export async function rejectAdminWithdrawal(
    withdrawalId: string,
    note: string,
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
