// Trang điều phối danh sách hoàn tiền phân trang và khiếu nại; trạng thái tài chính vẫn do Order Service quyết định.
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    confirmAdminRefund,
    failAdminRefund,
    getAdminDeliveryIssues,
    getAdminRefunds,
    resolveAdminDeliveryIssue,
    updateAdminRefundRecipientAccount,
} from '@/services/admin/api/finance.api';
import type {
    AdminFinanceDeliveryIssue,
    AdminFinanceRefund,
    AdminRefundRecipientAccountInput,
} from '@/services/admin/types/finance.types';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { FINANCE_TABLE_PAGE_SIZE } from '../../constants/finance-pagination.constant';
import { FinanceSectionHeader } from '../shared/FinanceSectionHeader';
import { FinanceTableToolbar } from '../shared/FinanceTableToolbar';
import { RefundProcessingDialog } from './RefundProcessingDialog';
import { RefundQueueTable } from './RefundQueueTable';

// Ghép loại nguồn với ID để ghi chú và lựa chọn không va chạm giữa các bảng refund.
function getRefundKey(
    refund: Pick<AdminFinanceRefund, 'sourceType' | 'id'>,
): string {
    return `${refund.sourceType}-${refund.id}`;
}

// Tải danh sách hoàn phân trang và giữ nguyên snapshot API làm nguồn trạng thái.
// Hồ sơ đã hoàn vẫn nằm trong danh sách, nhưng popup chỉ cho xem lịch sử.
export function RefundQueueSection() {
    const queryClient = useQueryClient();
    const [failedNotes, setFailedNotes] = useState<Record<string, string>>({});
    const [issueNotes, setIssueNotes] = useState<Record<string, string>>({});
    const [refundPage, setRefundPage] = useState(1);
    const [refundSearch, setRefundSearch] = useState('');
    const [refundStatus, setRefundStatus] = useState('ALL');
    const [issueSearch, setIssueSearch] = useState('');
    const [issuePaymentStatus, setIssuePaymentStatus] = useState('ALL');
    const [selectedRefundKey, setSelectedRefundKey] = useState<string | null>(
        null,
    );
    const refundsQuery = useQuery({
        queryKey: [
            'admin-finance',
            'refunds',
            refundPage,
            FINANCE_TABLE_PAGE_SIZE,
            refundStatus,
            refundSearch,
        ],
        queryFn: () =>
            getAdminRefunds(
                refundPage,
                FINANCE_TABLE_PAGE_SIZE,
                refundStatus === 'ALL' ? undefined : refundStatus,
                refundSearch || undefined,
            ),
        staleTime: 10_000,
        refetchInterval: 5_000,
        refetchIntervalInBackground: false,
    });
    const issuesQuery = useQuery({
        queryKey: ['admin-finance', 'delivery-issues'],
        queryFn: getAdminDeliveryIssues,
        staleTime: 10_000,
    });
    // Ưu tiên thời điểm hoàn tất; hồ sơ đang mở dùng ngày phát sinh.
    // Sắp lại trang hiện tại để chống thứ tự sai từ replica cũ.
    const refunds = [...(refundsQuery.data?.items ?? [])].sort(
        (left, right) => {
            const newestFirst =
                Date.parse(right.refundProcessedAt ?? right.createdAt) -
                Date.parse(left.refundProcessedAt ?? left.createdAt);
            return newestFirst || right.id.localeCompare(left.id);
        },
    );
    const refundTotal = refundsQuery.data?.total ?? 0;
    const refundTotalPages = Math.max(
        1,
        Math.ceil(refundTotal / FINANCE_TABLE_PAGE_SIZE),
    );
    const selectedRefund = refunds.find(
        (refund) => getRefundKey(refund) === selectedRefundKey,
    );

    // Nếu xử lý xong đơn cuối trang làm tổng số trang giảm, quay về trang hợp lệ gần nhất.
    useEffect(() => {
        if (!refundsQuery.isPending && refundPage > refundTotalPages) {
            setRefundPage(refundTotalPages);
        }
    }, [refundPage, refundTotalPages, refundsQuery.isPending]);

    // Làm mới các bảng liên quan sau khi backend ghi refund ledger hoặc xử lý issue.
    async function invalidateFinanceQueues(): Promise<void> {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['admin-finance', 'refunds'],
            }),
            queryClient.invalidateQueries({
                queryKey: ['admin-finance', 'delivery-issues'],
            }),
            queryClient.invalidateQueries({ queryKey: ['admin-finance'] }),
        ]);
    }

    const confirmMutation = useMutation({
        mutationFn: confirmAdminRefund,
        onSuccess: async () => {
            setSelectedRefundKey(null);
            await invalidateFinanceQueues();
            toast.success('Đã ghi nhận khoản hoàn tiền.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const failMutation = useMutation({
        mutationFn: failAdminRefund,
        onSuccess: async (_result, input) => {
            setFailedNotes((current) => ({
                ...current,
                [getRefundKey(input)]: '',
            }));
            await invalidateFinanceQueues();
            toast.success('Đã lưu lỗi chuyển khoản để xử lý lại.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const issueMutation = useMutation({
        mutationFn: (input: {
            issueId: string;
            decision: 'REFUND' | 'REJECT';
            note: string;
        }) =>
            resolveAdminDeliveryIssue(
                input.issueId,
                input.decision,
                input.note,
            ),
        onSuccess: async (_result, input) => {
            setIssueNotes((current) => ({
                ...current,
                [input.issueId]: '',
            }));
            await invalidateFinanceQueues();
            toast.success(
                input.decision === 'REFUND'
                    ? 'Đã duyệt hoàn, khoản tiền đã vào hàng đợi chuyển.'
                    : 'Đã ghi nhận khiếu nại bị từ chối; đơn trở lại chờ khách xác nhận.',
            );
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    // Sau khi tài khoản được lưu, tải lại refund queue để QR chỉ dùng snapshot đã được server ghi nhận.
    const recipientAccountMutation = useMutation({
        mutationFn: updateAdminRefundRecipientAccount,
        onSuccess: async () => {
            await invalidateFinanceQueues();
            toast.success('Đã lưu tài khoản nhận tiền cho khoản hoàn.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    // Issue decision có ghi chú bắt buộc để giữ lại lý do từ chối hoặc căn cứ duyệt hoàn.
    function resolveIssue(
        issue: AdminFinanceDeliveryIssue,
        decision: 'REFUND' | 'REJECT',
    ): void {
        const note = issueNotes[issue.id]?.trim() ?? '';
        if (note.length < 10) return;
        issueMutation.mutate({ issueId: issue.id, decision, note });
    }

    // Mở đúng refund được chọn; callback giữ danh sách gọn và không hiển thị dữ liệu nhận tiền đại trà.
    function selectRefund(refund: AdminFinanceRefund): void {
        setSelectedRefundKey(getRefundKey(refund));
    }

    // Đóng popup khi chuyển trang để không giữ thao tác trên snapshot của trang cũ.
    function changeRefundPage(page: number): void {
        setSelectedRefundKey(null);
        setRefundPage(page);
    }

    // Chỉ cập nhật ghi chú cho refund đang mở; khóa theo nguồn và ID tránh đè ghi chú đơn khác.
    function updateSelectedFailureNote(value: string): void {
        if (!selectedRefund) return;
        setFailedNotes((current) => ({
            ...current,
            [getRefundKey(selectedRefund)]: value,
        }));
    }

    // Ghi lỗi chuyển khoản chỉ khi có đơn đang mở và phần mô tả đạt yêu cầu tối thiểu của API.
    function recordSelectedRefundFailure(): void {
        if (!selectedRefund) return;
        const note = failedNotes[getRefundKey(selectedRefund)]?.trim() ?? '';
        if (note.length < 10) return;
        failMutation.mutate({
            sourceType: selectedRefund.sourceType,
            id: selectedRefund.id,
            note,
        });
    }

    // Chặn lưu tài khoản với nguồn không hỗ trợ; API chỉ nhận tài khoản cho payment attempt.
    function saveSelectedRecipientAccount(
        account: AdminRefundRecipientAccountInput,
    ): void {
        if (!selectedRefund || selectedRefund.sourceType !== 'PAYMENT_ATTEMPT')
            return;
        recipientAccountMutation.mutate({
            paymentAttemptId: selectedRefund.id,
            account,
        });
    }

    // Truyền nguyên số tiền snapshot cho API; không tự tính lại hoặc xác nhận khi popup đã đóng.
    async function confirmSelectedRefund(): Promise<void> {
        if (!selectedRefund) return;
        await confirmMutation.mutateAsync({
            sourceType: selectedRefund.sourceType,
            id: selectedRefund.id,
            amount: selectedRefund.amount,
        });
    }

    const issues = issuesQuery.data ?? [];
    // Khiếu nại API chỉ trả các hồ sơ đang mở; lọc theo trạng thái thanh toán để quyết định khả năng hoàn nhanh hơn.
    const normalizedIssueSearch = issueSearch.toLocaleLowerCase('vi-VN');
    const filteredIssues = issues.filter((issue) => {
        const matchesSearch =
            !normalizedIssueSearch ||
            [issue.orderNumber, issue.note ?? '', issue.reason, issue.id]
                .join(' ')
                .toLocaleLowerCase('vi-VN')
                .includes(normalizedIssueSearch);
        const matchesPaymentStatus =
            issuePaymentStatus === 'ALL' ||
            issue.paymentStatus === issuePaymentStatus;
        return matchesSearch && matchesPaymentStatus;
    });

    // Mỗi thay đổi bộ lọc quay về trang đầu và đóng popup cũ để không thao tác nhầm hồ sơ ngoài kết quả hiện tại.
    function updateRefundSearch(value: string): void {
        setSelectedRefundKey(null);
        setRefundPage(1);
        setRefundSearch(value);
    }

    // Trạng thái mới có thể làm thay đổi tổng trang, nên làm sạch lựa chọn trước khi tải lại danh sách.
    function updateRefundStatus(value: string): void {
        setSelectedRefundKey(null);
        setRefundPage(1);
        setRefundStatus(value);
    }

    return (
        <div className="space-y-5">
            <RefundQueueTable
                refunds={refunds}
                total={refundTotal}
                page={refundPage}
                pageSize={FINANCE_TABLE_PAGE_SIZE}
                isLoading={refundsQuery.isPending}
                isFetching={refundsQuery.isFetching}
                isError={refundsQuery.isError}
                search={refundSearch}
                status={refundStatus}
                onRefresh={() => void refundsQuery.refetch()}
                onSearchChange={updateRefundSearch}
                onStatusChange={updateRefundStatus}
                onPageChange={changeRefundPage}
                onSelectRefund={selectRefund}
            />
            <RefundProcessingDialog
                open={Boolean(selectedRefund)}
                onOpenChange={(open) => {
                    if (!open) setSelectedRefundKey(null);
                }}
                refund={selectedRefund ?? null}
                failureNote={
                    selectedRefund
                        ? (failedNotes[getRefundKey(selectedRefund)] ?? '')
                        : ''
                }
                isSavingRecipientAccount={
                    Boolean(selectedRefund) &&
                    recipientAccountMutation.isPending &&
                    recipientAccountMutation.variables?.paymentAttemptId ===
                        selectedRefund?.id
                }
                isConfirmingRefund={
                    Boolean(selectedRefund) &&
                    confirmMutation.isPending &&
                    confirmMutation.variables?.id === selectedRefund?.id &&
                    confirmMutation.variables?.sourceType ===
                        selectedRefund?.sourceType
                }
                isRecordingFailure={
                    Boolean(selectedRefund) &&
                    failMutation.isPending &&
                    failMutation.variables?.id === selectedRefund?.id &&
                    failMutation.variables?.sourceType ===
                        selectedRefund?.sourceType
                }
                onFailureNoteChange={updateSelectedFailureNote}
                onSaveRecipientAccount={saveSelectedRecipientAccount}
                onConfirmRefund={confirmSelectedRefund}
                onRecordFailure={recordSelectedRefundFailure}
            />

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                {/* Giữ trạng thái lỗi riêng để không báo số 0 như thể danh sách đã tải xong. */}
                <FinanceSectionHeader
                    icon={AlertCircle}
                    title="Khiếu nại chưa nhận hàng"
                    description="Kiểm tra bằng chứng trước khi đóng khiếu nại hoặc đưa khoản đã thu vào hàng đợi hoàn."
                    countLabel={
                        issuesQuery.isError
                            ? 'Không tải được'
                            : issuesQuery.isPending
                              ? 'Đang tải…'
                              : `${issues.length} khiếu nại`
                    }
                    actions={
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            aria-label="Làm mới danh sách khiếu nại giao hàng"
                            className="size-9 rounded-xl border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50"
                            onClick={() => void issuesQuery.refetch()}
                            disabled={issuesQuery.isFetching}
                        >
                            <RefreshCw
                                className={
                                    issuesQuery.isFetching
                                        ? 'animate-spin'
                                        : undefined
                                }
                                aria-hidden="true"
                            />
                        </Button>
                    }
                />
                <FinanceTableToolbar
                    searchValue={issueSearch}
                    searchLabel="Tìm khiếu nại giao hàng"
                    searchPlaceholder="Tìm theo mã đơn, nội dung hoặc mã khiếu nại"
                    onSearchChange={setIssueSearch}
                    statusValue={issuePaymentStatus}
                    statusLabel="Lọc trạng thái thanh toán khiếu nại"
                    statusOptions={[
                        { value: 'ALL', label: 'Mọi trạng thái thanh toán' },
                        { value: 'PAID', label: 'Đã thanh toán' },
                        {
                            value: 'COD_PENDING_COLLECTION',
                            label: 'COD chưa thu',
                        },
                        { value: 'PENDING', label: 'Chờ thanh toán' },
                        { value: 'FAILED', label: 'Thanh toán thất bại' },
                        { value: 'REFUND_PENDING', label: 'Chờ hoàn' },
                        { value: 'REFUNDED', label: 'Đã hoàn' },
                    ]}
                    onStatusChange={setIssuePaymentStatus}
                />
                {issuesQuery.isPending ? (
                    <p className="px-5 py-8 text-sm text-zinc-500">
                        Đang tải khiếu nại...
                    </p>
                ) : issuesQuery.isError ? (
                    <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        Không thể tải khiếu nại giao hàng. Hãy thử làm mới dữ
                        liệu tài chính.
                    </div>
                ) : filteredIssues.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-zinc-500">
                        {issues.length
                            ? 'Không tìm thấy khiếu nại phù hợp.'
                            : 'Không có khiếu nại giao hàng đang chờ phân xử.'}
                    </p>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {filteredIssues.map((issue) => {
                            const note = issueNotes[issue.id]?.trim() ?? '';
                            const isPaid = issue.paymentStatus === 'PAID';
                            return (
                                <article
                                    key={issue.id}
                                    className="space-y-4 px-5 py-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-zinc-950">
                                                Đơn {issue.orderNumber} · khách
                                                báo chưa nhận hàng
                                            </p>
                                            <p className="mt-1 text-sm text-zinc-600">
                                                {issue.note ||
                                                    'Khách chưa ghi thêm mô tả.'}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Thanh toán:{' '}
                                                {issue.paymentStatus} ·{' '}
                                                {new Date(
                                                    issue.createdAt,
                                                ).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                                            Chờ phân xử
                                        </span>
                                    </div>
                                    {issue.evidence.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {issue.evidence.map((media) => (
                                                <a
                                                    key={media.assetId}
                                                    href={media.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 underline"
                                                >
                                                    Mở{' '}
                                                    {media.type === 'video'
                                                        ? 'video'
                                                        : 'ảnh'}{' '}
                                                    bằng chứng
                                                </a>
                                            ))}
                                        </div>
                                    ) : null}
                                    {!isPaid ? (
                                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                                            Đơn chưa ghi nhận đã thu tiền nên
                                            không thể hoàn tiền. Chỉ từ chối khi
                                            đã xác minh đơn được giao; nếu chưa
                                            rõ, giữ khiếu nại mở để làm việc với
                                            đơn vị vận chuyển.
                                        </p>
                                    ) : null}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`delivery-issue-note-${issue.id}`}
                                        >
                                            Căn cứ quyết định (tối thiểu 10 ký
                                            tự)
                                        </Label>
                                        <Textarea
                                            id={`delivery-issue-note-${issue.id}`}
                                            value={issueNotes[issue.id] ?? ''}
                                            onChange={(event) =>
                                                setIssueNotes((current) => ({
                                                    ...current,
                                                    [issue.id]:
                                                        event.target.value,
                                                }))
                                            }
                                            maxLength={500}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                note.length < 10 ||
                                                issueMutation.isPending
                                            }
                                            onClick={() =>
                                                resolveIssue(issue, 'REJECT')
                                            }
                                        >
                                            <X aria-hidden="true" /> Từ chối
                                            khiếu nại
                                        </Button>
                                        {isPaid ? (
                                            <Button
                                                type="button"
                                                disabled={
                                                    note.length < 10 ||
                                                    issueMutation.isPending
                                                }
                                                onClick={() =>
                                                    resolveIssue(
                                                        issue,
                                                        'REFUND',
                                                    )
                                                }
                                            >
                                                <RotateCcw aria-hidden="true" />{' '}
                                                Duyệt hoàn tiền
                                            </Button>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
