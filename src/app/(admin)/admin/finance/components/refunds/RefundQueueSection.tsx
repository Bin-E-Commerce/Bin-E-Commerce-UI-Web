// Trang điều phối danh sách hoàn tiền phân trang và khiếu nại; trạng thái tài chính vẫn do Order Service quyết định.
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, X } from 'lucide-react';
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
import { RefundProcessingDialog } from './RefundProcessingDialog';
import { RefundQueueTable } from './RefundQueueTable';

// Ghép loại nguồn với ID để ghi chú và lựa chọn không va chạm giữa các bảng refund.
function getRefundKey(
    refund: Pick<AdminFinanceRefund, 'sourceType' | 'id'>,
): string {
    return `${refund.sourceType}-${refund.id}`;
}

// Tải hàng đợi hoàn có phân trang; chi tiết và thao tác chỉ xuất hiện sau khi admin mở một đơn.
export function RefundQueueSection() {
    const queryClient = useQueryClient();
    const [failedNotes, setFailedNotes] = useState<Record<string, string>>({});
    const [issueNotes, setIssueNotes] = useState<Record<string, string>>({});
    const [refundPage, setRefundPage] = useState(1);
    const [selectedRefundKey, setSelectedRefundKey] = useState<string | null>(
        null,
    );
    const refundsQuery = useQuery({
        queryKey: [
            'admin-finance',
            'refunds',
            refundPage,
            FINANCE_TABLE_PAGE_SIZE,
        ],
        queryFn: () => getAdminRefunds(refundPage, FINANCE_TABLE_PAGE_SIZE),
        staleTime: 10_000,
    });
    const issuesQuery = useQuery({
        queryKey: ['admin-finance', 'delivery-issues'],
        queryFn: getAdminDeliveryIssues,
        staleTime: 10_000,
    });
    const refunds = refundsQuery.data?.items ?? [];
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
                onRefresh={() => void refundsQuery.refetch()}
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
                <div className="border-b border-zinc-100 px-5 py-4">
                    <h2 className="font-semibold text-zinc-950">
                        Khiếu nại chưa nhận hàng
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Kiểm tra bằng chứng trước khi đóng khiếu nại hoặc đưa
                        khoản đã thu vào hàng đợi hoàn.
                    </p>
                </div>
                {issuesQuery.isPending ? (
                    <p className="px-5 py-8 text-sm text-zinc-500">
                        Đang tải khiếu nại...
                    </p>
                ) : issuesQuery.isError ? (
                    <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        Không thể tải khiếu nại giao hàng. Hãy thử làm mới dữ
                        liệu tài chính.
                    </div>
                ) : issues.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-zinc-500">
                        Không có khiếu nại giao hàng đang chờ phân xử.
                    </p>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {issues.map((issue) => {
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
