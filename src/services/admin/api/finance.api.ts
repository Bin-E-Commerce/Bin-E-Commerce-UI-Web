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
    AdminWalletActivityResponse,
    AdminPayoutReadiness,
    AdminFinanceRefund,
    AdminFinanceDeliveryIssue,
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

// Lấy hoạt động ví theo ngày trực tiếp từ aggregate phía Order Service, không suy ra từ ledger đã phân trang.
export async function getAdminWalletActivity(range: {
    from: string;
    to: string;
}): Promise<AdminWalletActivityResponse> {
    const response = await authorizedAxios.get<AdminWalletActivityResponse>(
        `${financeUrl}/activity`,
        { params: range },
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

// Tải hàng đợi hoàn đang chờ hoặc lỗi để admin xử lý lại theo snapshot server.
export async function getAdminRefunds(
    page = 1,
    pageSize = 20,
): Promise<AdminFinancePage<AdminFinanceRefund>> {
    const response = await authorizedAxios.get<
        AdminFinancePage<AdminFinanceRefund>
    >(`${financeUrl}/refunds`, { params: { page, pageSize } });
    return response.data;
}

// Tải các khiếu nại chưa nhận hàng cần quyết định trước khi hoàn hoặc trả về bước xác nhận.
export async function getAdminDeliveryIssues(): Promise<
    AdminFinanceDeliveryIssue[]
> {
    const response = await authorizedAxios.get<AdminFinanceDeliveryIssue[]>(
        `${financeUrl}/delivery-issues`,
    );
    return response.data;
}

// Ghi nhận quyết định admin; chỉ REFUND mới đưa issue vào hàng đợi chuyển khoản.
export async function resolveAdminDeliveryIssue(
    issueId: string,
    decision: 'REFUND' | 'REJECT',
    note: string,
): Promise<void> {
    await authorizedAxios.post(
        `${financeUrl}/delivery-issues/${issueId}/resolution`,
        { decision, note },
    );
}

// Xác nhận tiền đã chuyển bên ngoài rồi gửi bằng chứng; amount lấy nguyên từ API.
export async function confirmAdminRefund(input: {
    sourceType: AdminFinanceRefund['sourceType'];
    id: string;
    amount: string;
    reference: string;
    proof: Record<string, unknown>;
}): Promise<void> {
    const pathBySource = {
        PAYMENT_ATTEMPT: 'payment-attempts',
        ORDER_RETURN: 'returns',
        DELIVERY_ISSUE: 'delivery-issues',
    } as const;
    await authorizedAxios.post(
        `${financeUrl}/refunds/${pathBySource[input.sourceType]}/${input.id}/confirmation`,
        {
            amount: input.amount,
            reference: input.reference,
            proof: input.proof,
        },
    );
}

// Đưa lần chuyển tiền lỗi về trạng thái retry kèm lý do kiểm tra được trong admin queue.
export async function failAdminRefund(input: {
    sourceType: AdminFinanceRefund['sourceType'];
    id: string;
    note: string;
}): Promise<void> {
    const pathBySource = {
        PAYMENT_ATTEMPT: 'payment-attempts',
        ORDER_RETURN: 'returns',
        DELIVERY_ISSUE: 'delivery-issues',
    } as const;
    await authorizedAxios.post(
        `${financeUrl}/refunds/${pathBySource[input.sourceType]}/${input.id}/failure`,
        { note: input.note },
    );
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
