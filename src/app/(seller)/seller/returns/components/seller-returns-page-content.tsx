// Màn hình Seller xử lý riêng vòng đời hoàn hàng, tách khỏi danh sách đơn để tránh trộn hai luồng vận hành.
// Component chỉ gọi API theo shop scope và điều phối thao tác; quyền truy cập vẫn do Gateway/Order Service kiểm tra.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Check,
    ClipboardCheck,
    Eye,
    PackageCheck,
    RefreshCw,
    RotateCcw,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    getSellerOrder,
    inspectSellerReturn,
    listSellerReturns,
    reviewSellerReturn,
} from '@/services/order';
import { createSellerReturnShipment } from '@/services/shipping';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { SellerReturnDetailModal } from './seller-return-detail-modal';
import { SellerReturnRejectDialog } from './seller-return-reject-dialog';

type ReturnQueueFilter =
    | 'ALL'
    | 'REQUESTED'
    | 'AWAITING_SHIPMENT'
    | 'RECEIVED'
    | 'RESOLVED';

const ACTIONABLE_STATUSES = new Set([
    'REQUESTED',
    'AWAITING_SHIPMENT',
    'RECEIVED',
]);

type SellerReturnRequest = Awaited<
    ReturnType<typeof listSellerReturns>
>[number];

// Chuyển trạng thái kỹ thuật thành nhãn nghiệp vụ để Seller biết chính xác bước cần làm tiếp theo.
function getReturnStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        REQUESTED: 'Chờ shop duyệt',
        AWAITING_SHIPMENT: 'Chờ khách gửi hàng',
        IN_TRANSIT: 'Đang hoàn về shop',
        RECEIVED: 'Chờ kiểm tra hàng',
        REFUND_PENDING: 'Đã kiểm tra đạt · Chờ hoàn tiền',
        REJECTED: 'Đã từ chối',
        INSPECTION_FAILED: 'Kiểm tra không đạt · Chờ gửi trả sản phẩm',
    };

    return labels[status] ?? status;
}

// Lọc queue theo nhóm thao tác để Seller tập trung xử lý việc cần làm trước.
function matchesReturnFilter(
    status: string,
    filter: ReturnQueueFilter,
): boolean {
    if (filter === 'ALL') return true;
    if (filter === 'REQUESTED') return status === 'REQUESTED';
    if (filter === 'AWAITING_SHIPMENT') {
        return ['AWAITING_SHIPMENT', 'IN_TRANSIT'].includes(status);
    }
    if (filter === 'RECEIVED') return status === 'RECEIVED';
    return !ACTIONABLE_STATUSES.has(status);
}

// Định dạng số tiền hoàn theo locale Việt Nam nhưng vẫn giữ dữ liệu gốc do Order Service tính toán.
function formatRefundAmount(amount: string): string {
    return `${Number(amount).toLocaleString('vi-VN')} đ`;
}

// Định dạng thời gian cập nhật ngắn gọn để queue dễ quét trên desktop và mobile.
function formatUpdatedAt(value: string): string {
    return new Date(value).toLocaleString('vi-VN');
}

// Chuyển mã lý do từ API thành nhãn tiếng Việt để Seller hiểu nhanh nội dung cần xử lý.
function getReturnReasonLabel(reason: string): string {
    const labels: Record<string, string> = {
        DAMAGED: 'Sản phẩm bị hư hỏng',
        WRONG_ITEM: 'Giao sai sản phẩm',
        MISSING_ITEM: 'Thiếu sản phẩm',
        NOT_AS_DESCRIBED: 'Không đúng mô tả',
        CHANGE_OF_MIND: 'Không còn nhu cầu',
        OTHER: 'Lý do khác',
    };
    return labels[reason] ?? reason;
}

// Điều phối query, bộ lọc và các mutation xử lý hoàn hàng trong workspace riêng của Seller.
export function SellerReturnsPageContent() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<ReturnQueueFilter>('ALL');
    const [selectedRequest, setSelectedRequest] =
        useState<SellerReturnRequest | null>(null);
    const [rejectingRequest, setRejectingRequest] =
        useState<SellerReturnRequest | null>(null);
    const returnsQuery = useQuery({
        queryKey: ['seller-returns'],
        queryFn: () => listSellerReturns(),
        staleTime: 15_000,
        refetchOnMount: 'always',
    });
    const selectedOrderQuery = useQuery({
        queryKey: ['seller-return-order', selectedRequest?.orderId],
        queryFn: () => getSellerOrder(selectedRequest!.orderId),
        enabled: Boolean(selectedRequest),
        staleTime: 30_000,
    });
    const reviewMutation = useMutation({
        mutationFn: ({
            returnId,
            approved,
            note,
        }: {
            returnId: string;
            approved: boolean;
            note?: string;
        }) => reviewSellerReturn(returnId, approved, note),
        onSuccess: () => {
            setRejectingRequest(null);
            invalidateReturnQueries(queryClient);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const inspectMutation = useMutation({
        mutationFn: ({
            returnId,
            passed,
        }: {
            returnId: string;
            passed: boolean;
        }) => inspectSellerReturn(returnId, passed),
        onSuccess: () => invalidateReturnQueries(queryClient),
    });
    const shipmentMutation = useMutation({
        mutationFn: createSellerReturnShipment,
        onSuccess: () => invalidateReturnQueries(queryClient),
    });
    const items = returnsQuery.data ?? [];
    const actionableCount = items.filter((item) =>
        ACTIONABLE_STATUSES.has(item.status),
    ).length;
    const visibleItems = items.filter((item) =>
        matchesReturnFilter(item.status, filter),
    );

    // Duyệt ngay với quyết định tích cực; quyết định từ chối phải đi qua dialog để bắt buộc có lý do.
    function handleReviewDecision(
        item: SellerReturnRequest,
        approved: boolean,
    ): void {
        if (!approved) {
            setRejectingRequest(item);
            return;
        }
        reviewMutation.mutate({ returnId: item.id, approved: true });
    }

    // Gửi lý do Seller đã xác nhận và đóng dialog sau khi API lưu thành công.
    function handleRejectSubmit(note: string): void {
        if (!rejectingRequest) return;
        reviewMutation.mutate({
            returnId: rejectingRequest.id,
            approved: false,
            note,
        });
    }

    return (
        <div className="min-w-0 space-y-5">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">
                        Xử lý hoàn hàng
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                        Duyệt yêu cầu, theo dõi hàng hoàn về shop và ghi nhận
                        kết quả kiểm tra minh bạch cho customer.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void returnsQuery.refetch()}
                    disabled={returnsQuery.isFetching}
                    className="inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        className={`size-4 ${returnsQuery.isFetching ? 'animate-spin' : ''}`}
                    />
                    Làm mới
                </button>
            </header>

            <section className="grid gap-3 sm:grid-cols-3">
                <SummaryCard
                    label="Tổng yêu cầu"
                    value={items.length}
                    description="Tất cả yêu cầu của shop"
                    icon={RotateCcw}
                    emphasized
                />
                <SummaryCard
                    label="Cần xử lý"
                    value={actionableCount}
                    description="Đang chờ thao tác của shop"
                    icon={PackageCheck}
                    emphasized={actionableCount > 0}
                />
                <SummaryCard
                    label="Đã hoàn tất bước shop"
                    value={
                        items.filter(
                            (item) => !ACTIONABLE_STATUSES.has(item.status),
                        ).length
                    }
                    description="Đang chờ hoàn tiền hoặc đã kết thúc"
                    icon={ClipboardCheck}
                    emphasized
                />
            </section>

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-4 py-5 sm:px-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                <RotateCcw className="size-5" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-950">
                                    Danh sách yêu cầu
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500">
                                    Chọn từng yêu cầu để thực hiện đúng bước
                                    tiếp theo.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                            {items.length} yêu cầu
                            {actionableCount > 0 ? (
                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] leading-none text-white">
                                    {actionableCount > 99
                                        ? '99+'
                                        : actionableCount}
                                </span>
                            ) : null}
                        </span>
                    </div>

                    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                        <ReturnFilterButton
                            active={filter === 'ALL'}
                            onClick={() => setFilter('ALL')}
                        >
                            Tất cả
                        </ReturnFilterButton>
                        <ReturnFilterButton
                            active={filter === 'REQUESTED'}
                            onClick={() => setFilter('REQUESTED')}
                            count={
                                items.filter(
                                    (item) => item.status === 'REQUESTED',
                                ).length
                            }
                        >
                            Chờ shop duyệt
                        </ReturnFilterButton>
                        <ReturnFilterButton
                            active={filter === 'AWAITING_SHIPMENT'}
                            onClick={() => setFilter('AWAITING_SHIPMENT')}
                            count={
                                items.filter((item) =>
                                    [
                                        'AWAITING_SHIPMENT',
                                        'IN_TRANSIT',
                                    ].includes(item.status),
                                ).length
                            }
                        >
                            Đang hoàn về
                        </ReturnFilterButton>
                        <ReturnFilterButton
                            active={filter === 'RECEIVED'}
                            onClick={() => setFilter('RECEIVED')}
                            count={
                                items.filter(
                                    (item) => item.status === 'RECEIVED',
                                ).length
                            }
                        >
                            Chờ kiểm tra
                        </ReturnFilterButton>
                        <ReturnFilterButton
                            active={filter === 'RESOLVED'}
                            onClick={() => setFilter('RESOLVED')}
                        >
                            Đã xử lý
                        </ReturnFilterButton>
                    </div>
                </div>

                {returnsQuery.isPending ? (
                    <div className="px-6 py-16 text-center text-sm text-zinc-500">
                        Đang tải yêu cầu hoàn hàng...
                    </div>
                ) : returnsQuery.isError ? (
                    <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:m-6">
                        Không thể tải danh sách hoàn hàng. Vui lòng thử làm mới
                        sau ít phút.
                    </div>
                ) : visibleItems.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                            <RotateCcw className="size-5" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-zinc-950">
                            Không có yêu cầu trong nhóm này
                        </h3>
                        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-zinc-500">
                            Khi khách hàng gửi yêu cầu hoàn hàng, yêu cầu sẽ
                            xuất hiện tại đây.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 p-4 sm:gap-4 sm:p-5">
                        {visibleItems.map((item) => (
                            <SellerReturnRequestCard
                                key={item.id}
                                item={item}
                                reviewPending={reviewMutation.isPending}
                                inspectPending={inspectMutation.isPending}
                                shipmentPending={shipmentMutation.isPending}
                                onReview={(approved) =>
                                    handleReviewDecision(item, approved)
                                }
                                onInspect={(passed) =>
                                    inspectMutation.mutate({
                                        returnId: item.id,
                                        passed,
                                    })
                                }
                                onCreateShipment={() =>
                                    shipmentMutation.mutate(item.id)
                                }
                                onViewDetails={() => setSelectedRequest(item)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {selectedRequest ? (
                <SellerReturnDetailModal
                    request={selectedRequest}
                    order={selectedOrderQuery.data}
                    loading={selectedOrderQuery.isPending}
                    error={selectedOrderQuery.isError}
                    onClose={() => setSelectedRequest(null)}
                />
            ) : null}
            {/* Đổi key theo request để form luôn mount mới, tự reset lý do mà không cần setState trong effect. */}
            <SellerReturnRejectDialog
                key={rejectingRequest?.id ?? 'closed'}
                open={Boolean(rejectingRequest)}
                pending={reviewMutation.isPending}
                onClose={() => setRejectingRequest(null)}
                onSubmit={handleRejectSubmit}
            />
        </div>
    );
}

// Làm mới cả queue hoàn hàng và order list sau mutation để badge/trạng thái ở các màn hình liên quan nhất quán.
function invalidateReturnQueries(
    queryClient: ReturnType<typeof useQueryClient>,
): void {
    void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['seller-returns'] }),
        queryClient.invalidateQueries({ queryKey: ['seller-orders'] }),
    ]);
}

// Hiển thị một chỉ số ngắn gọn ở đầu workspace để Seller nắm nhanh khối lượng cần xử lý.
// Thẻ tổng hợp dùng cùng nền đen và icon trắng khi được đánh dấu nổi bật để giữ một hệ thống thị giác thống nhất.
function SummaryCard({
    label,
    value,
    description,
    icon: Icon,
    emphasized = false,
}: {
    label: string;
    value: number;
    description: string;
    icon: typeof RotateCcw;
    emphasized?: boolean;
}) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-zinc-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-950">
                        {value}
                    </p>
                </div>
                <span
                    className={`flex size-10 items-center justify-center rounded-xl ${emphasized ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-600'}`}
                >
                    <Icon className="size-5" />
                </span>
            </div>
            <p className="mt-3 text-xs text-zinc-400">{description}</p>
        </div>
    );
}

// Nút lọc có trạng thái active rõ ràng và badge đỏ cho nhóm còn việc cần xử lý.
function ReturnFilterButton({
    active,
    count = 0,
    onClick,
    children,
}: {
    active: boolean;
    count?: number;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
                active
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
        >
            {children}
            {count > 0 ? (
                <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${active ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'}`}
                >
                    {count > 99 ? '99+' : count}
                </span>
            ) : null}
        </button>
    );
}

interface SellerReturnRequestCardProps {
    item: Awaited<ReturnType<typeof listSellerReturns>>[number];
    reviewPending: boolean;
    inspectPending: boolean;
    shipmentPending: boolean;
    onReview: (approved: boolean) => void;
    onInspect: (passed: boolean) => void;
    onCreateShipment: () => void;
    onViewDetails: () => void;
}

// Hiển thị thông tin request và chỉ mở đúng action tương ứng với trạng thái hiện tại.
function SellerReturnRequestCard({
    item,
    reviewPending,
    inspectPending,
    shipmentPending,
    onReview,
    onInspect,
    onCreateShipment,
    onViewDetails,
}: SellerReturnRequestCardProps) {
    return (
        <article className="grid gap-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-8">
            <div className="min-w-0">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <RotateCcw className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-zinc-950">
                                Yêu cầu #{item.id.slice(0, 8)}
                            </h3>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                                {getReturnStatusLabel(item.status)}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                            Đơn hàng{' '}
                            <Link
                                href={`/seller/orders/${item.orderId}`}
                                className="font-semibold text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
                            >
                                #{item.orderId.slice(0, 8)}
                            </Link>
                            <span className="mx-2 text-zinc-300">·</span>
                            {item.itemIds.length} sản phẩm
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3">
                        <p className="text-xs text-zinc-500">Lý do hoàn</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            {getReturnReasonLabel(item.reason)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3">
                        <p className="text-xs text-zinc-500">Hoàn dự kiến</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            {formatRefundAmount(item.refundAmount)}
                        </p>
                    </div>
                </div>

                {item.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
                        <span className="font-medium text-zinc-500">
                            Ghi chú:
                        </span>{' '}
                        {item.description}
                    </p>
                ) : null}
                {item.status === 'REJECTED' && item.reviewNote ? (
                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
                        <span className="font-semibold">Lý do từ chối:</span>{' '}
                        {item.reviewNote}
                    </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                    <span>Cập nhật {formatUpdatedAt(item.updatedAt)}</span>
                    <button
                        type="button"
                        onClick={onViewDetails}
                        className="inline-flex cursor-pointer items-center gap-1 font-semibold text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
                    >
                        <Eye className="size-3.5" /> Xem chi tiết yêu cầu
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                {item.status === 'REQUESTED' ? (
                    <>
                        <button
                            type="button"
                            className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            disabled={reviewPending}
                            onClick={() => onReview(true)}
                        >
                            <Check className="size-4" /> Duyệt yêu cầu
                        </button>
                        <button
                            type="button"
                            className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            disabled={reviewPending}
                            onClick={() => onReview(false)}
                        >
                            <X className="size-4" /> Từ chối
                        </button>
                    </>
                ) : null}
                {item.status === 'AWAITING_SHIPMENT' ? (
                    <button
                        type="button"
                        className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        disabled={shipmentPending}
                        onClick={onCreateShipment}
                    >
                        <PackageCheck className="size-4" /> Tạo vận đơn hoàn
                    </button>
                ) : null}
                {item.status === 'IN_TRANSIT' ? (
                    <span className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-zinc-100 px-3 text-xs font-semibold text-zinc-700 sm:w-auto">
                        Vận đơn đã tạo · Đang hoàn về shop
                    </span>
                ) : null}
                {item.status === 'RECEIVED' ? (
                    <>
                        <button
                            type="button"
                            className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            disabled={inspectPending}
                            onClick={() => onInspect(true)}
                        >
                            <ClipboardCheck className="size-4" /> Đạt kiểm tra
                        </button>
                        <button
                            type="button"
                            className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 transition hover:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            disabled={inspectPending}
                            onClick={() => onInspect(false)}
                        >
                            Không đạt
                        </button>
                    </>
                ) : null}
            </div>
        </article>
    );
}
