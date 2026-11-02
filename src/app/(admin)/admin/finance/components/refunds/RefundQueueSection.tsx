// Trang thao tác hoàn thủ công và phân xử khiếu nại chưa nhận hàng trong admin finance.
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Check, RefreshCw, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    confirmAdminRefund,
    failAdminRefund,
    getAdminDeliveryIssues,
    getAdminRefunds,
    resolveAdminDeliveryIssue,
} from '@/services/admin/api/finance.api';
import type {
    AdminFinanceDeliveryIssue,
    AdminFinanceRefund,
} from '@/services/admin/types/finance.types';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Làm tròn hiển thị theo VND, còn payload hoàn luôn giữ chuỗi decimal server trả về.
function formatRefundAmount(value: string): string {
    return `${Number(value).toLocaleString('vi-VN')} đ`;
}

// Hiển thị nguồn và trạng thái nghiệp vụ để admin không nhầm thanh toán trễ với return đã kiểm hàng.
function refundSourceLabel(refund: AdminFinanceRefund): string {
    if (refund.sourceType === 'PAYMENT_ATTEMPT') return 'Pay2S đến trễ';
    if (refund.sourceType === 'ORDER_RETURN') return 'Khách trả hàng';
    return 'Khiếu nại chưa nhận hàng';
}

// Tải và xử lý hàng đợi hoàn; mọi xác nhận đều yêu cầu admin đã chuyển khoản và nhập bằng chứng.
export function RefundQueueSection() {
    const queryClient = useQueryClient();
    const [references, setReferences] = useState<Record<string, string>>({});
    const [proofNotes, setProofNotes] = useState<Record<string, string>>({});
    const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
    const [failedNotes, setFailedNotes] = useState<Record<string, string>>({});
    const [transferAcknowledgements, setTransferAcknowledgements] = useState<
        Record<string, boolean>
    >({});
    const [issueNotes, setIssueNotes] = useState<Record<string, string>>({});
    const refundsQuery = useQuery({
        queryKey: ['admin-finance', 'refunds'],
        queryFn: () => getAdminRefunds(),
        staleTime: 10_000,
    });
    const issuesQuery = useQuery({
        queryKey: ['admin-finance', 'delivery-issues'],
        queryFn: getAdminDeliveryIssues,
        staleTime: 10_000,
    });

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
        onSuccess: async (_result, input) => {
            setReferences((current) => ({ ...current, [input.id]: '' }));
            setProofNotes((current) => ({ ...current, [input.id]: '' }));
            setProofUrls((current) => ({ ...current, [input.id]: '' }));
            setTransferAcknowledgements((current) => ({
                ...current,
                [input.id]: false,
            }));
            await invalidateFinanceQueues();
            toast.success('Đã ghi nhận khoản hoàn tiền.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const failMutation = useMutation({
        mutationFn: failAdminRefund,
        onSuccess: async (_result, input) => {
            setFailedNotes((current) => ({ ...current, [input.id]: '' }));
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

    // Bắt buộc xác nhận chuyển ngoài hệ thống và bằng chứng trước khi backend đổi trạng thái tài chính.
    function confirmRefund(refund: AdminFinanceRefund): void {
        const reference = references[refund.id]?.trim() ?? '';
        const proofNote = proofNotes[refund.id]?.trim() ?? '';
        if (
            !transferAcknowledgements[refund.id] ||
            reference.length < 3 ||
            proofNote.length < 5
        )
            return;
        confirmMutation.mutate({
            sourceType: refund.sourceType,
            id: refund.id,
            amount: refund.amount,
            reference,
            proof: {
                note: proofNote,
                receiptUrl: proofUrls[refund.id]?.trim() || null,
            },
        });
    }

    // Issue decision có ghi chú bắt buộc để giữ lại lý do từ chối hoặc căn cứ duyệt hoàn.
    function resolveIssue(
        issue: AdminFinanceDeliveryIssue,
        decision: 'REFUND' | 'REJECT',
    ): void {
        const note = issueNotes[issue.id]?.trim() ?? '';
        if (note.length < 10) return;
        issueMutation.mutate({ issueId: issue.id, decision, note });
    }

    const refunds = refundsQuery.data?.items ?? [];
    const issues = issuesQuery.data ?? [];

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-zinc-950">
                            Hoàn tiền cần xử lý
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Chuyển tiền qua ngân hàng trước, sau đó ghi
                            reference và chứng từ tại đây.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void refundsQuery.refetch()}
                        disabled={refundsQuery.isFetching}
                    >
                        <RefreshCw aria-hidden="true" /> Làm mới
                    </Button>
                </div>
                {refundsQuery.isPending ? (
                    <p className="px-5 py-8 text-sm text-zinc-500">
                        Đang tải hàng đợi hoàn tiền...
                    </p>
                ) : refundsQuery.isError ? (
                    <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        Không thể tải hàng đợi hoàn tiền. Hãy kiểm tra quyền tài
                        chính rồi thử lại.
                    </div>
                ) : refunds.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-zinc-500">
                        Không có khoản hoàn nào đang chờ xử lý.
                    </p>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        {refunds.map((refund) => {
                            const confirmed =
                                transferAcknowledgements[refund.id] === true;
                            const canConfirm =
                                confirmed &&
                                (references[refund.id]?.trim().length ?? 0) >=
                                    3 &&
                                (proofNotes[refund.id]?.trim().length ?? 0) >=
                                    5;
                            const failureNote =
                                failedNotes[refund.id]?.trim() ?? '';
                            return (
                                <article
                                    key={`${refund.sourceType}-${refund.id}`}
                                    className="space-y-4 px-5 py-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-zinc-950">
                                                {refundSourceLabel(refund)} ·
                                                đơn {refund.orderNumber}
                                            </p>
                                            <p className="mt-1 text-sm text-zinc-600">
                                                {refund.reason} ·{' '}
                                                {refund.paymentMethod} ·{' '}
                                                {refund.status ===
                                                'REFUND_FAILED'
                                                    ? 'Chuyển lần trước thất bại'
                                                    : 'Chờ chuyển khoản'}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {refund.providerTransactionId
                                                    ? `Mã giao dịch Pay2S: ${refund.providerTransactionId}`
                                                    : `Tạo lúc ${new Date(refund.createdAt).toLocaleString('vi-VN')}`}
                                            </p>
                                        </div>
                                        <p className="text-lg font-bold tabular-nums text-red-700">
                                            {formatRefundAmount(refund.amount)}
                                        </p>
                                    </div>
                                    {refund.refundFailureNote ? (
                                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                                            Lỗi trước:{' '}
                                            {refund.refundFailureNote}
                                        </p>
                                    ) : null}
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`refund-reference-${refund.id}`}
                                            >
                                                Mã giao dịch hoàn
                                            </Label>
                                            <Input
                                                id={`refund-reference-${refund.id}`}
                                                value={
                                                    references[refund.id] ?? ''
                                                }
                                                onChange={(event) =>
                                                    setReferences(
                                                        (current) => ({
                                                            ...current,
                                                            [refund.id]:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                maxLength={120}
                                                placeholder="Mã tham chiếu ngân hàng"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor={`refund-proof-url-${refund.id}`}
                                            >
                                                Link chứng từ (nếu có)
                                            </Label>
                                            <Input
                                                id={`refund-proof-url-${refund.id}`}
                                                value={
                                                    proofUrls[refund.id] ?? ''
                                                }
                                                onChange={(event) =>
                                                    setProofUrls((current) => ({
                                                        ...current,
                                                        [refund.id]:
                                                            event.target.value,
                                                    }))
                                                }
                                                maxLength={1000}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label
                                                htmlFor={`refund-proof-note-${refund.id}`}
                                            >
                                                Mô tả chứng từ
                                            </Label>
                                            <Textarea
                                                id={`refund-proof-note-${refund.id}`}
                                                value={
                                                    proofNotes[refund.id] ?? ''
                                                }
                                                onChange={(event) =>
                                                    setProofNotes(
                                                        (current) => ({
                                                            ...current,
                                                            [refund.id]:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                maxLength={500}
                                                rows={2}
                                                placeholder="Ví dụ: chuyển khoản ngân hàng lúc..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <label className="flex max-w-2xl items-start gap-2 text-sm text-zinc-700">
                                            <Checkbox
                                                checked={confirmed}
                                                onCheckedChange={(checked) =>
                                                    setTransferAcknowledgements(
                                                        (current) => ({
                                                            ...current,
                                                            [refund.id]:
                                                                checked ===
                                                                true,
                                                        }),
                                                    )
                                                }
                                            />
                                            <span>
                                                Tôi đã chuyển đủ{' '}
                                                {formatRefundAmount(
                                                    refund.amount,
                                                )}{' '}
                                                cho khách qua ngân hàng.
                                            </span>
                                        </label>
                                        <Button
                                            type="button"
                                            disabled={
                                                !canConfirm ||
                                                confirmMutation.isPending
                                            }
                                            onClick={() =>
                                                confirmRefund(refund)
                                            }
                                        >
                                            <Check aria-hidden="true" /> Xác
                                            nhận đã hoàn
                                        </Button>
                                    </div>
                                    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3 sm:flex-row sm:items-end">
                                        <div className="grid flex-1 gap-2">
                                            <Label
                                                htmlFor={`refund-failure-${refund.id}`}
                                            >
                                                Ghi chú nếu chuyển khoản thất
                                                bại
                                            </Label>
                                            <Input
                                                id={`refund-failure-${refund.id}`}
                                                value={
                                                    failedNotes[refund.id] ?? ''
                                                }
                                                onChange={(event) =>
                                                    setFailedNotes(
                                                        (current) => ({
                                                            ...current,
                                                            [refund.id]:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                maxLength={500}
                                                placeholder="Tối thiểu 10 ký tự"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                failureNote.length < 10 ||
                                                failMutation.isPending
                                            }
                                            onClick={() =>
                                                failMutation.mutate({
                                                    sourceType:
                                                        refund.sourceType,
                                                    id: refund.id,
                                                    note: failureNote,
                                                })
                                            }
                                        >
                                            <AlertCircle aria-hidden="true" />{' '}
                                            Ghi nhận lỗi
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

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
                                                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-blue-700 underline"
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
