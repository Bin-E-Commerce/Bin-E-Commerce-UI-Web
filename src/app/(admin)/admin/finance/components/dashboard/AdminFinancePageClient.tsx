// Trang vận hành dòng tiền: admin gửi payout seller qua payOS Kênh Chi và theo dõi trạng thái provider.
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    confirmAdminPay2sLateRefund,
    confirmAdminPay2sRefund,
    createAdminSettlementBatch,
    getAdminFinance,
    getAdminPayoutReadiness,
    getAdminWithdrawal,
    processAdminWithdrawalPayout,
    rejectAdminWithdrawal,
    reconcileAdminSettlementBatch,
    syncAdminWithdrawalPayout,
} from '@/services/admin/api/finance.api';
import type { AdminFinanceLedgerEntry } from '@/services/admin/types/finance.types';
import { FinanceContextCards } from './FinanceContextCards';
import { FinanceMetrics } from './FinanceMetrics';
import { PlatformLedgerSection } from '../ledger/PlatformLedgerSection';
import { ManualRefundSection } from '../refunds/ManualRefundSection';
import { SellerWithdrawalsSection } from '../withdrawals/SellerWithdrawalsSection';
import { WithdrawalDialog } from '../withdrawals/WithdrawalDialog';
import type {
    AdminFinanceRefundInput,
    AdminFinanceWithdrawalActionInput,
} from '../../types/admin-finance.types';
import { CodRemittanceSection } from '../cod-remittance/CodRemittanceSection';

// Trang chỉ dùng dữ liệu finance đã được backend giới hạn quyền; số dư và ledger luôn lấy từ snapshot API.
// State tại đây chỉ giữ thao tác tạm của admin, còn payout/refund/đối soát được backend xác thực và ghi sổ.
// Raw account number chỉ được tải khi admin mở chi tiết payout để tránh lộ thông tin trong snapshot chung.
export function AdminFinancePageClient() {
    const queryClient = useQueryClient();
    const [withdrawalId, setWithdrawalId] = useState<string | null>(null);
    const [selectedLedgerIds, setSelectedLedgerIds] = useState<string[]>([]);
    const [adminNote, setAdminNote] = useState('');
    const [refundCaseType, setRefundCaseType] =
        useState<AdminFinanceRefundInput['caseType']>('RETURN');
    const [refundTargetId, setRefundTargetId] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReference, setRefundReference] = useState('');
    const [refundProofUrl, setRefundProofUrl] = useState('');
    const [refundProofAssetId, setRefundProofAssetId] = useState('');
    const [settlementBatchId, setSettlementBatchId] = useState<string | null>(
        null,
    );
    const overviewQuery = useQuery({
        queryKey: ['admin-finance', 1],
        queryFn: () => getAdminFinance(1, 50),
        staleTime: 15_000,
    });
    const withdrawalQuery = useQuery({
        queryKey: ['admin-finance-withdrawal', withdrawalId],
        queryFn: () => getAdminWithdrawal(withdrawalId!),
        enabled: Boolean(withdrawalId),
        refetchInterval: false,
    });
    const payoutReadinessQuery = useQuery({
        queryKey: ['admin-finance-payout-readiness'],
        queryFn: getAdminPayoutReadiness,
        enabled: Boolean(withdrawalId),
    });
    const payoutStatusQuery = useQuery({
        queryKey: ['admin-finance-withdrawal-payout-status', withdrawalId],
        queryFn: () => syncAdminWithdrawalPayout(withdrawalId!),
        enabled: Boolean(
            withdrawalId &&
            withdrawalQuery.data?.status === 'PROCESSING' &&
            withdrawalQuery.data.transferReference?.startsWith('PAYOS:'),
        ),
        refetchInterval: (query) =>
            query.state.status === 'error' ||
            query.state.data?.status === 'PROCESSING'
                ? 5_000
                : false,
    });

    // Retry chỉ gửi lại payload với idempotency key ổn định; từ chối vẫn là thao tác riêng trước khi bắt đầu payout.
    const withdrawalMutation = useMutation({
        mutationFn: async (input: AdminFinanceWithdrawalActionInput) => {
            if (input.action === 'payout')
                return processAdminWithdrawalPayout(
                    input.withdrawalId,
                    input.note,
                );
            await rejectAdminWithdrawal(input.withdrawalId, input.note);
            return null;
        },
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({
                queryKey: ['admin-finance'],
            });
            await queryClient.invalidateQueries({
                queryKey: ['admin-finance-withdrawal'],
            });
            setAdminNote('');
            if (result?.status === 'PAID')
                toast.success('payOS xác nhận đã chuyển tiền cho seller.');
            else if (result?.status === 'FAILED')
                toast.error(
                    'payOS xác nhận lệnh chi thất bại; tiền giữ chỗ đã được hoàn lại cho seller.',
                );
            else if (result?.status === 'PROCESSING')
                toast.success(
                    'payOS đã nhận lệnh hoặc đang xử lý; hệ thống sẽ tự cập nhật trạng thái.',
                );
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
    const refundMutation = useMutation({
        mutationFn: (input: AdminFinanceRefundInput) => {
            const body = {
                amount: input.amount,
                reference: input.reference,
                proof: {
                    assetId: input.proofAssetId,
                    url: input.proofUrl,
                    type: 'image' as const,
                },
            };
            return input.caseType === 'RETURN'
                ? confirmAdminPay2sRefund(input.targetId, body)
                : confirmAdminPay2sLateRefund(input.targetId, body);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['admin-finance'],
            });
            setRefundTargetId('');
            setRefundAmount('');
            setRefundReference('');
            setRefundProofUrl('');
            setRefundProofAssetId('');
        },
    });
    const overview = overviewQuery.data;
    const detail = withdrawalQuery.data;
    const isPayosWithdrawal = Boolean(
        detail?.transferReference?.startsWith('PAYOS:'),
    );
    const hasEnoughPayoutBalance = Boolean(
        detail &&
        payoutReadinessQuery.data?.ready &&
        Number(payoutReadinessQuery.data.balance ?? 0) >= Number(detail.amount),
    );

    // Đồng bộ payOS có thể chốt PAID/FAILED trong lúc dialog mở; cập nhật lại dashboard và danh sách sau đó.
    useEffect(() => {
        if (
            detail?.status === 'PAID' ||
            payoutStatusQuery.data?.status === 'PAID' ||
            payoutStatusQuery.data?.status === 'FAILED'
        )
            void queryClient.invalidateQueries({
                queryKey: ['admin-finance'],
            });
    }, [detail?.status, payoutStatusQuery.data?.status, queryClient]);

    const canSubmitRefund = Boolean(
        refundTargetId.trim() &&
        refundAmount.trim() &&
        refundReference.trim() &&
        refundProofUrl.trim() &&
        refundProofAssetId.trim() &&
        !refundMutation.isPending,
    );

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

    // Xóa ghi chú tạm trước khi đóng để không gắn nhầm nội dung với yêu cầu payout tiếp theo.
    function closeWithdrawalDialog(open: boolean) {
        if (open) return;
        setWithdrawalId(null);
        setAdminNote('');
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
                        Sổ mô phỏng nền tảng, nạp ví Sandbox và yêu cầu rút tiền
                        do admin gửi trực tiếp qua Kênh Chi payOS.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => void overviewQuery.refetch()}
                >
                    <RefreshCw aria-hidden="true" /> Làm mới
                </Button>
            </header>

            <FinanceMetrics overview={overview} />

            <CodRemittanceSection />

            <SellerWithdrawalsSection
                withdrawals={overview.withdrawals}
                pendingWithdrawals={overview.pendingWithdrawals}
                onSelectWithdrawal={setWithdrawalId}
            />

            <PlatformLedgerSection
                ledger={overview.ledger}
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

            <section className="grid gap-4 xl:grid-cols-2">
                <ManualRefundSection
                    refundCaseType={refundCaseType}
                    setRefundCaseType={setRefundCaseType}
                    refundTargetId={refundTargetId}
                    setRefundTargetId={setRefundTargetId}
                    refundAmount={refundAmount}
                    setRefundAmount={setRefundAmount}
                    refundReference={refundReference}
                    setRefundReference={setRefundReference}
                    refundProofAssetId={refundProofAssetId}
                    setRefundProofAssetId={setRefundProofAssetId}
                    refundProofUrl={refundProofUrl}
                    setRefundProofUrl={setRefundProofUrl}
                    canSubmitRefund={canSubmitRefund}
                    isRefundError={refundMutation.isError}
                    isRefundPending={refundMutation.isPending}
                    onSubmitRefund={() =>
                        refundMutation.mutate({
                            caseType: refundCaseType,
                            targetId: refundTargetId.trim(),
                            amount: refundAmount.trim(),
                            reference: refundReference.trim(),
                            proofUrl: refundProofUrl.trim(),
                            proofAssetId: refundProofAssetId.trim(),
                        })
                    }
                />
                <FinanceContextCards deposits={overview.deposits} />
            </section>

            <WithdrawalDialog
                open={Boolean(withdrawalId)}
                onOpenChange={closeWithdrawalDialog}
                isLoading={withdrawalQuery.isPending}
                isError={withdrawalQuery.isError}
                detail={detail}
                isPayosWithdrawal={isPayosWithdrawal}
                payoutReadiness={payoutReadinessQuery.data}
                payoutStatus={payoutStatusQuery.data}
                adminNote={adminNote}
                onAdminNoteChange={setAdminNote}
                isWithdrawalPending={withdrawalMutation.isPending}
                isWithdrawalError={withdrawalMutation.isError}
                isReadinessPending={payoutReadinessQuery.isPending}
                isReadinessError={payoutReadinessQuery.isError}
                isPayoutStatusError={payoutStatusQuery.isError}
                hasEnoughPayoutBalance={hasEnoughPayoutBalance}
                onCopyMemo={() => void copyWithdrawalMemo()}
                onPayout={() => {
                    if (!detail) return;
                    withdrawalMutation.mutate({
                        withdrawalId: detail.id,
                        action: 'payout',
                        note: adminNote,
                    });
                }}
                onReject={() => {
                    if (!detail) return;
                    withdrawalMutation.mutate({
                        withdrawalId: detail.id,
                        action: 'reject',
                        note: adminNote,
                    });
                }}
            />
        </main>
    );
}
