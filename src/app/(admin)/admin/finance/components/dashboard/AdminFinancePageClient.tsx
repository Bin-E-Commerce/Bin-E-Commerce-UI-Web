// Trang vận hành dòng tiền: admin chuyển thủ công và theo dõi đối soát giao dịch OUT Pay2S.
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpenText, Landmark, RefreshCw, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
    createAdminSettlementBatch,
    confirmAdminWithdrawalTransfer,
    getAdminFinance,
    getAdminLedger,
    getAdminPayoutReadiness,
    getAdminWithdrawal,
    getAdminWithdrawals,
    rejectAdminWithdrawal,
    reconcileAdminSettlementBatch,
    startAdminWithdrawalProcessing,
} from '@/services/admin/api/finance.api';
import type { AdminFinanceLedgerEntry } from '@/services/admin/types/finance.types';
import { FinanceContextCards } from './FinanceContextCards';
import { FinanceMetrics } from './FinanceMetrics';
import { PlatformLedgerSection } from '../ledger/PlatformLedgerSection';
import { SellerWithdrawalsSection } from '../withdrawals/SellerWithdrawalsSection';
import { WithdrawalDialog } from '../withdrawals/WithdrawalDialog';
import type { AdminFinanceWithdrawalActionInput } from '../../types/payouts/seller-withdrawals.types';
import { CodRemittanceSection } from '../cod-remittance/CodRemittanceSection';
import { FINANCE_TABLE_PAGE_SIZE } from '../../constants/finance-pagination.constant';

// Trang giữ số liệu tài chính tóm tắt ở đầu và dùng tab để tránh xếp chồng các bảng dài.
// Dữ liệu finance do backend giới hạn quyền; số dư và ledger luôn lấy từ API có phân trang.
// State tại đây chỉ giữ thao tác payout/đối soát; backend xác thực và ghi sổ mọi thay đổi tài chính.
// Raw account number chỉ được tải khi admin mở chi tiết payout để tránh lộ thông tin trong snapshot chung.
export function AdminFinancePageClient() {
    const queryClient = useQueryClient();
    const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
    const [manualTransferAcknowledged, setManualTransferAcknowledged] =
        useState(false);
    const [recipientConfirmed, setRecipientConfirmed] = useState(false);
    const [selectedLedgerIds, setSelectedLedgerIds] = useState<string[]>([]);
    const [adminNote, setAdminNote] = useState('');
    const [settlementBatchId, setSettlementBatchId] = useState<string | null>(
        null,
    );
    const [withdrawalsPage, setWithdrawalsPage] = useState(1);
    const [ledgerPage, setLedgerPage] = useState(1);
    const overviewQuery = useQuery({
        queryKey: ['admin-finance', 'overview'],
        queryFn: () => getAdminFinance(1, 1),
        staleTime: 15_000,
    });
    // Mỗi bảng dùng query key và page độc lập để đổi trang không tải lại dữ liệu của bảng còn lại.
    const withdrawalsQuery = useQuery({
        queryKey: [
            'admin-finance',
            'withdrawals',
            withdrawalsPage,
            FINANCE_TABLE_PAGE_SIZE,
        ],
        queryFn: () =>
            getAdminWithdrawals(withdrawalsPage, FINANCE_TABLE_PAGE_SIZE),
        staleTime: 15_000,
    });
    const ledgerQuery = useQuery({
        queryKey: [
            'admin-finance',
            'ledger',
            ledgerPage,
            FINANCE_TABLE_PAGE_SIZE,
        ],
        queryFn: () => getAdminLedger(ledgerPage, FINANCE_TABLE_PAGE_SIZE),
        staleTime: 15_000,
    });
    const withdrawalQuery = useQuery({
        queryKey: ['admin-finance-withdrawal', withdrawalId],
        queryFn: () => getAdminWithdrawal(withdrawalId!),
        enabled: Boolean(withdrawalId),
        refetchInterval: (query) =>
            query.state.data?.status === 'PROCESSING' ? 5_000 : false,
    });
    const payoutReadinessQuery = useQuery({
        queryKey: ['admin-finance-payout-readiness'],
        queryFn: getAdminPayoutReadiness,
        enabled: Boolean(withdrawalId),
    });

    // Mỗi action là một bước riêng: mở xử lý, xác nhận đã chuyển đúng người nhận hoặc từ chối trước khi chuyển.
    const withdrawalMutation = useMutation({
        mutationFn: async (input: AdminFinanceWithdrawalActionInput) => {
            switch (input.action) {
                case 'start':
                    return startAdminWithdrawalProcessing(
                        input.withdrawalId,
                        input.acknowledged === true,
                        input.note,
                    );
                case 'confirm':
                    return confirmAdminWithdrawalTransfer(
                        input.withdrawalId,
                        input.acknowledged === true,
                        input.note,
                    );
                case 'reject':
                    // Nhánh từ chối luôn mang lý do bắt buộc theo kiểu input trước khi gọi API.
                    await rejectAdminWithdrawal(input.withdrawalId, input.note);
                    return null;
            }
        },
        onSuccess: async (_result, input) => {
            await queryClient.invalidateQueries({
                queryKey: ['admin-finance'],
            });
            await queryClient.invalidateQueries({
                queryKey: ['admin-finance-withdrawal'],
            });
            setAdminNote('');
            setManualTransferAcknowledged(false);
            setRecipientConfirmed(false);
            if (input.action === 'start')
                toast.success(
                    'Yêu cầu đã chuyển sang xử lý. Hãy chuyển tiền bằng app ngân hàng và giữ nguyên memo.',
                );
            else if (input.action === 'confirm')
                toast.success('Đã ghi nhận chuyển tiền cho seller.');
            else toast.success('Đã từ chối yêu cầu rút tiền.');
        },
    });
    const batchMutation = useMutation({
        mutationFn: () => createAdminSettlementBatch(selectedLedgerIds),
        onSuccess: async (batch) => {
            setSelectedLedgerIds([]);
            setSettlementBatchId(batch.id);
            await queryClient.invalidateQueries({
                queryKey: ['admin-finance'],
            });
        },
    });
    const reconcileMutation = useMutation({
        mutationFn: (batchId: string) => reconcileAdminSettlementBatch(batchId),
        onSuccess: async () => {
            setSettlementBatchId(null);
            await queryClient.invalidateQueries({
                queryKey: ['admin-finance'],
            });
        },
    });
    const overview = overviewQuery.data;
    const detail = withdrawalQuery.data;
    // Reset checkbox khi đổi yêu cầu hoặc candidate để không tái sử dụng xác nhận cho giao dịch khác.
    useEffect(() => {
        setManualTransferAcknowledged(false);
        setRecipientConfirmed(false);
    }, [withdrawalId, detail?.pay2sTransactionId]);

    // Checkbox chỉ thay đổi selection cục bộ; batch API sẽ kiểm tra các dòng đó chưa được nhóm.
    function toggleLedgerSelection(
        entry: AdminFinanceLedgerEntry,
        checked: boolean | 'indeterminate',
    ) {
        setSelectedLedgerIds((current) =>
            checked
                ? [...new Set([...current, entry.id])]
                : current.filter((id) => id !== entry.id),
        );
    }

    // Xóa ghi chú và xác nhận tạm trước khi đóng để không gắn nhầm thao tác với yêu cầu tiếp theo.
    function closeWithdrawalDialog(open: boolean) {
        if (open) return;
        setWithdrawalId(null);
        setAdminNote('');
        setManualTransferAcknowledged(false);
        setRecipientConfirmed(false);
    }

    // Mỗi request mở đầu với ghi chú và xác nhận sạch để không mang lý do payout trước sang yêu cầu khác.
    function openWithdrawalDialog(id: string) {
        setAdminNote('');
        setManualTransferAcknowledged(false);
        setRecipientConfirmed(false);
        setWithdrawalId(id);
    }

    // Sao chép nguyên memo do server tạo; nếu trình duyệt chặn clipboard thì admin vẫn có thể chọn và copy thủ công.
    async function copyWithdrawalMemo() {
        if (!detail?.transferMemo) return;
        try {
            await navigator.clipboard.writeText(detail.transferMemo);
            toast.success('Đã sao chép nội dung chuyển khoản.');
        } catch {
            toast.error(
                'Không thể sao chép tự động. Hãy chọn và copy nội dung.',
            );
        }
    }

    if (overviewQuery.isPending) {
        return (
            <div className="space-y-4" aria-label="Đang tải tài chính admin">
                <div className="h-10 w-64 animate-pulse rounded-xl bg-zinc-200" />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-xl bg-zinc-100"
                        />
                    ))}
                </div>
                <div className="h-80 animate-pulse rounded-2xl bg-zinc-100" />
            </div>
        );
    }
    if (overviewQuery.isError || !overview) {
        return (
            <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-700"
            >
                Không thể tải dữ liệu tài chính. Vui lòng kiểm tra quyền xem tài
                chính và thử lại.
            </div>
        );
    }

    return (
        <main className="space-y-5 pb-8">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                        Quản lý dòng tiền
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        Quản lý dòng tiền nền tảng, tiền nạp ví seller và yêu
                        cầu rút do admin chuyển thủ công, đối soát qua Pay2S.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        void queryClient.invalidateQueries({
                            queryKey: ['admin-finance'],
                        })
                    }
                >
                    <RefreshCw aria-hidden="true" /> Làm mới
                </Button>
            </header>

            <FinanceMetrics overview={overview} />

            <section className="space-y-3" aria-label="Các bảng tài chính">
                <Tabs defaultValue="withdrawals" className="gap-3">
                    {/* Cho list tự cao theo các trigger để active tab không tràn khỏi nền khi dùng dạng grid. */}
                    <TabsList
                        aria-label="Danh sách giao dịch tài chính"
                        className="group-data-horizontal/tabs:h-auto grid h-auto w-full grid-cols-3 items-stretch gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50/80 p-1.5 shadow-sm"
                    >
                        <TabsTrigger
                            value="withdrawals"
                            className="h-12 min-w-0 flex-col gap-1.5 rounded-lg px-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:bg-white/70 hover:text-zinc-950 data-active:border-zinc-200 data-active:bg-white data-active:text-zinc-950 data-active:shadow-sm sm:h-11 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm"
                        >
                            <Landmark
                                className="size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="truncate">Rút tiền seller</span>
                            {withdrawalsQuery.data ? (
                                <span className="hidden rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500 sm:inline-flex">
                                    {withdrawalsQuery.data.total}
                                </span>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger
                            value="cod"
                            className="h-12 min-w-0 flex-col gap-1.5 rounded-lg px-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:bg-white/70 hover:text-zinc-950 data-active:border-zinc-200 data-active:bg-white data-active:text-zinc-950 data-active:shadow-sm sm:h-11 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm"
                        >
                            <Truck
                                className="size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="truncate">COD đối soát</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="ledger"
                            className="h-12 min-w-0 flex-col gap-1.5 rounded-lg px-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:bg-white/70 hover:text-zinc-950 data-active:border-zinc-200 data-active:bg-white data-active:text-zinc-950 data-active:shadow-sm sm:h-11 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm"
                        >
                            <BookOpenText
                                className="size-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="truncate">Sổ tiền nền tảng</span>
                            {ledgerQuery.data ? (
                                <span className="hidden rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] tabular-nums text-zinc-500 sm:inline-flex">
                                    {ledgerQuery.data.total}
                                </span>
                            ) : null}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="withdrawals" className="mt-0">
                        <SellerWithdrawalsSection
                            withdrawals={withdrawalsQuery.data?.items ?? []}
                            pendingWithdrawals={overview.pendingWithdrawals}
                            page={withdrawalsPage}
                            pageSize={FINANCE_TABLE_PAGE_SIZE}
                            total={withdrawalsQuery.data?.total ?? 0}
                            isLoading={withdrawalsQuery.isPending}
                            isFetching={withdrawalsQuery.isFetching}
                            isError={withdrawalsQuery.isError}
                            onPageChange={setWithdrawalsPage}
                            onSelectWithdrawal={openWithdrawalDialog}
                        />
                    </TabsContent>
                    <TabsContent value="cod" keepMounted className="mt-0">
                        <CodRemittanceSection />
                    </TabsContent>
                    <TabsContent value="ledger" className="mt-0">
                        <PlatformLedgerSection
                            ledger={ledgerQuery.data?.items ?? []}
                            page={ledgerPage}
                            pageSize={FINANCE_TABLE_PAGE_SIZE}
                            total={ledgerQuery.data?.total ?? 0}
                            isLoading={ledgerQuery.isPending}
                            isFetching={ledgerQuery.isFetching}
                            isError={ledgerQuery.isError}
                            onPageChange={setLedgerPage}
                            selectedLedgerIds={selectedLedgerIds}
                            settlementBatchId={settlementBatchId}
                            isBatchPending={batchMutation.isPending}
                            isReconcilePending={reconcileMutation.isPending}
                            onToggleLedgerSelection={toggleLedgerSelection}
                            onCreateBatch={() => batchMutation.mutate()}
                            onReconcileBatch={(batchId) =>
                                reconcileMutation.mutate(batchId)
                            }
                        />
                    </TabsContent>
                </Tabs>
            </section>

            <section>
                <FinanceContextCards deposits={overview.deposits} />
            </section>

            <WithdrawalDialog
                open={Boolean(withdrawalId)}
                onOpenChange={closeWithdrawalDialog}
                isLoading={withdrawalQuery.isPending}
                isError={withdrawalQuery.isError}
                detail={detail}
                payoutReadiness={payoutReadinessQuery.data}
                manualTransferAcknowledged={manualTransferAcknowledged}
                recipientConfirmed={recipientConfirmed}
                adminNote={adminNote}
                onAdminNoteChange={setAdminNote}
                onManualTransferAcknowledgedChange={
                    setManualTransferAcknowledged
                }
                onRecipientConfirmedChange={setRecipientConfirmed}
                isWithdrawalPending={withdrawalMutation.isPending}
                isWithdrawalError={withdrawalMutation.isError}
                isReadinessPending={payoutReadinessQuery.isPending}
                isReadinessError={payoutReadinessQuery.isError}
                onCopyMemo={() => void copyWithdrawalMemo()}
                onStartProcessing={() => {
                    if (!detail) return;
                    withdrawalMutation.mutate({
                        withdrawalId: detail.id,
                        action: 'start',
                        acknowledged: manualTransferAcknowledged,
                        note: adminNote,
                    });
                }}
                onConfirmTransfer={() => {
                    if (!detail) return;
                    withdrawalMutation.mutate({
                        withdrawalId: detail.id,
                        action: 'confirm',
                        acknowledged: recipientConfirmed,
                        note: adminNote,
                    });
                }}
                onReject={() => {
                    // Không gửi yêu cầu từ chối nếu lý do rỗng sau khi bỏ khoảng trắng.
                    const rejectionReason = adminNote.trim();
                    if (!detail || !rejectionReason) return;
                    withdrawalMutation.mutate({
                        withdrawalId: detail.id,
                        action: 'reject',
                        note: rejectionReason,
                    });
                }}
            />
        </main>
    );
}
