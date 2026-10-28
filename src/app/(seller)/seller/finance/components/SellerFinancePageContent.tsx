// Màn tài chính seller hiển thị số dư, lịch sử và thao tác nạp/rút ví.
// UI gọi API; backend xác thực số dư, giữ chỗ và tài khoản payout.
'use client';

import { useState, type FormEvent } from 'react';
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import Link from 'next/link';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Banknote,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    CircleDollarSign,
    Landmark,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shopProfileService } from '@/services/seller';
import {
    createSellerWalletDeposit,
    createSellerWalletWithdrawal,
    getSellerWallet,
    getSellerWalletWithdrawals,
} from '@/services/seller/api/seller-wallet.api';
import type { SellerWalletWithdrawal } from '@/services/seller/types/seller-wallet.types';
import type { SellerWalletAction } from '../types/seller-finance.types';
import { SellerFinanceSkeleton } from './SellerFinanceSkeleton';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    SELLER_WALLET_HISTORY_PAGE_SIZE,
    SELLER_WITHDRAWALS_PAGE_SIZE,
} from '../constants/finance-pagination.constant';

// Định dạng VND không làm thay đổi số tiền decimal do backend lưu dưới dạng chuỗi.
function formatMoney(amount: string): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(amount));
}

// Chuyển ledger kind thành nhãn dành cho seller, giữ nguyên mã loại khi gặp dữ liệu mới.
function getTransactionLabel(kind: string): string {
    const labels: Record<string, string> = {
        SALE_PENDING: 'Tiền hàng đang chờ',
        RELEASE_AVAILABLE: 'Tiền hàng khả dụng',
        REFUND_PENDING_REVERSAL: 'Điều chỉnh hoàn tiền',
        REFUND_AVAILABLE_REVERSAL: 'Điều chỉnh số dư khả dụng',
        WALLET_DEPOSIT: 'Nạp tiền vào ví',
        WITHDRAWAL_RESERVED: 'Giữ chỗ yêu cầu rút',
        WITHDRAWAL_PAID: 'Đã tất toán khoản giữ chỗ',
        WITHDRAWAL_RELEASED: 'Hoàn giữ chỗ rút tiền',
        RETURN_SHIPPING_DEBIT: 'Phí vận chuyển hoàn hàng',
    };
    return labels[kind] ?? kind;
}

// Dịch trạng thái payout backend thành nhãn ngắn để seller hiểu admin đang ở bước nào.
function getWithdrawalStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        REQUESTED: 'Chờ admin xử lý',
        PROCESSING: 'Đang chuyển khoản',
        PAID: 'Đã chuyển',
        REJECTED: 'Đã từ chối',
        FAILED: 'Chuyển khoản thất bại',
    };
    return labels[status] ?? status;
}

// Dùng màu trung tính cho các trạng thái thường và màu cảnh báo cho yêu cầu cần xử lý hoặc bị lỗi.
function getWithdrawalStatusBadgeClassName(status: string): string {
    if (status === 'REQUESTED')
        return 'border-amber-200 bg-amber-50 text-amber-800';
    if (status === 'PROCESSING')
        return 'border-zinc-300 bg-zinc-100 text-zinc-800';
    if (status === 'PAID')
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    if (status === 'REJECTED' || status === 'FAILED')
        return 'border-rose-200 bg-rose-50 text-rose-700';
    return 'border-zinc-200 bg-white text-zinc-700';
}

// Tải số dư, hồ sơ nhận tiền và các trang lịch sử.
// Backend vẫn sở hữu quy tắc tạo top-up và yêu cầu payout.
export function SellerFinancePageContent() {
    const queryClient = useQueryClient();
    const [activeAction, setActiveAction] = useState<SellerWalletAction | null>(
        null,
    );
    const [successfulWithdrawal, setSuccessfulWithdrawal] =
        useState<SellerWalletWithdrawal | null>(null);
    const [walletPage, setWalletPage] = useState(1);
    const [withdrawalsPage, setWithdrawalsPage] = useState(1);
    const walletQuery = useQuery({
        queryKey: [
            'seller-wallet',
            walletPage,
            SELLER_WALLET_HISTORY_PAGE_SIZE,
        ],
        queryFn: () =>
            getSellerWallet(walletPage, SELLER_WALLET_HISTORY_PAGE_SIZE),
        // Giữ dữ liệu trang trước để số dư không nhấp nháy toàn trang trong khi truy vấn trang mới.
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
    const profileQuery = useQuery({
        queryKey: ['seller', 'shop-profile'],
        queryFn: shopProfileService.getMine,
        staleTime: 60_000,
    });
    const withdrawalsQuery = useQuery({
        queryKey: [
            'seller-wallet-withdrawals',
            withdrawalsPage,
            SELLER_WITHDRAWALS_PAGE_SIZE,
        ],
        queryFn: () =>
            getSellerWalletWithdrawals(
                withdrawalsPage,
                SELLER_WITHDRAWALS_PAGE_SIZE,
            ),
        // Giữ bảng đang xem trong khi tải trang kế để tránh nhảy layout toàn khu vực ví.
        placeholderData: keepPreviousData,
        staleTime: 15_000,
    });
    const depositMutation = useMutation({
        mutationFn: createSellerWalletDeposit,
        onSuccess: ({ paymentUrl }) => window.location.assign(paymentUrl),
    });
    const withdrawalMutation = useMutation({
        mutationFn: createSellerWalletWithdrawal,
        // Chỉ hiện xác nhận sau khi backend đã tạo yêu cầu và giữ chỗ số dư thành công.
        onSuccess: async (withdrawal) => {
            setSuccessfulWithdrawal(withdrawal);
            setActiveAction(null);
            // Giao dịch giữ chỗ mới nằm đầu lịch sử nên quay về trang đầu để seller thấy ngay.
            setWalletPage(1);
            // Yêu cầu mới nhất cũng nằm trang đầu của danh sách rút tiền.
            setWithdrawalsPage(1);
            await queryClient.invalidateQueries({
                queryKey: ['seller-wallet'],
            });
            await queryClient.invalidateQueries({
                queryKey: ['seller-wallet-withdrawals'],
            });
        },
    });
    const wallet = walletQuery.data;
    const payoutAccount = profileQuery.data?.tax;

    // Mở biểu mẫu được chọn và xóa mutation cũ để lần thử mới không hiện nhầm lỗi.
    function openWalletAction(action: SellerWalletAction) {
        setActiveAction(action);
        depositMutation.reset();
        withdrawalMutation.reset();
    }

    // Đóng hộp thoại thì xóa trạng thái mutation cũ để lần mở tiếp theo không hiện nhầm lỗi.
    function handleDialogOpenChange(open: boolean) {
        if (open) return;
        setActiveAction(null);
        depositMutation.reset();
        withdrawalMutation.reset();
    }

    // Đóng xác nhận thành công mà không thay đổi trạng thái yêu cầu rút đã được server lưu.
    function handleWithdrawalSuccessOpenChange(open: boolean) {
        if (open) return;
        setSuccessfulWithdrawal(null);
    }

    // Nạp chuyển sang trang thanh toán Pay2S; rút chỉ gửi số tiền.
    // Server tự lấy tài khoản từ hồ sơ shop rồi lưu snapshot cùng yêu cầu.
    function handleWalletActionSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const amount = String(
            new FormData(event.currentTarget).get('amount') ?? '',
        );
        if (activeAction === 'deposit') depositMutation.mutate(amount);
        if (activeAction === 'withdraw') withdrawalMutation.mutate(amount);
    }

    // Dùng placeholder có cùng cấu trúc trang để lúc chờ API không làm layout giật mạnh.
    if (walletQuery.isPending) return <SellerFinanceSkeleton />;
    if (walletQuery.isError) {
        return (
            <div
                role="alert"
                className="rounded-3xl border border-red-200 bg-white p-8 text-sm text-red-700 shadow-sm"
            >
                Không thể tải ví shop. Vui lòng thử lại sau.
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-8">
            {/* Giữ bề rộng tối thiểu để tiêu đề không bị ép; màn hình hẹp sẽ cuộn ngang thay vì làm thẻ méo. */}
            <section
                className="flex min-w-0 gap-3 overflow-x-auto pb-1"
                aria-label="Tổng quan tài chính shop"
            >
                <article className="relative min-w-[280px] flex-1 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-3.5 text-white shadow-md shadow-zinc-900/10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full border border-white/20"
                    />
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10">
                                <WalletCards
                                    className="size-3.5 text-zinc-200"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="line-clamp-2 min-w-0 text-xs font-medium leading-4 text-zinc-200">
                                Số dư khả dụng
                            </span>
                        </div>
                        <span className="shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-medium text-zinc-200">
                            Có thể sử dụng
                        </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight">
                        {formatMoney(wallet?.availableBalance ?? '0')}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-300">
                        Có thể rút hoặc sử dụng; khoản đang chờ admin chuyển
                        được tách riêng.
                    </p>
                </article>

                <article className="relative min-w-[280px] flex-1 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-slate-100 p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                                <Clock3
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="line-clamp-2 min-w-0 text-xs font-medium leading-4 text-zinc-600">
                                Tiền hàng đang chờ
                            </span>
                        </div>
                        <span className="shrink-0 whitespace-nowrap rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[9px] font-medium text-zinc-600">
                            Đang đối soát
                        </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">
                        {formatMoney(wallet?.pendingBalance ?? '0')}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">
                        Tổng tiền hàng từ các đơn chưa hoàn tất; xem mã đơn
                        trong lịch sử.
                    </p>
                </article>

                <article className="relative min-w-[280px] flex-1 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                            <ShieldCheck
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        </span>
                        <span className="line-clamp-2 text-xs font-medium leading-4 text-zinc-600">
                            Đang giữ chỗ rút tiền
                        </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">
                        {formatMoney(wallet?.reservedBalance ?? '0')}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">
                        Sẽ trừ hẳn khi admin xác nhận đã chuyển khoản.
                    </p>
                </article>

                <article className="relative min-w-[280px] flex-1 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                                <Landmark
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="min-w-0">
                                <p className="line-clamp-2 text-xs font-medium leading-4 text-zinc-600">
                                    Ngân hàng đang sử dụng
                                </p>
                                {profileQuery.isPending ? (
                                    <span className="mt-1 block h-3.5 w-24 animate-pulse rounded bg-zinc-100" />
                                ) : (
                                    <p className="mt-1 truncate text-xs font-semibold text-zinc-950">
                                        {payoutAccount?.payoutBankName ||
                                            'Chưa thiết lập'}
                                    </p>
                                )}
                            </div>
                        </div>
                        {payoutAccount?.payoutBankName ? (
                            <span className="shrink-0 whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[9px] font-medium text-zinc-600">
                                Theo hồ sơ shop
                            </span>
                        ) : null}
                    </div>

                    <div className="mt-3 border-t border-zinc-100 pt-2.5">
                        {profileQuery.isPending ? (
                            <div className="space-y-2" aria-hidden="true">
                                <span className="block h-3 w-32 animate-pulse rounded bg-zinc-100" />
                                <span className="block h-3 w-40 animate-pulse rounded bg-zinc-100" />
                            </div>
                        ) : profileQuery.isError ? (
                            <p className="text-xs leading-5 text-zinc-500">
                                Không tải được thông tin tài khoản nhận tiền.
                            </p>
                        ) : payoutAccount?.payoutBankName ? (
                            <div className="space-y-1 text-xs">
                                <p className="truncate text-zinc-600">
                                    STK:{' '}
                                    {payoutAccount.payoutAccountNumberMasked ||
                                        'Chưa cập nhật'}
                                </p>
                                <p className="truncate text-zinc-500">
                                    Chủ TK:{' '}
                                    {payoutAccount.payoutAccountHolder ||
                                        'Chưa cập nhật'}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs leading-5 text-zinc-500">
                                Chưa có tài khoản nhận tiền trong hồ sơ shop.
                            </p>
                        )}
                        <Link
                            className="mt-2 inline-flex text-xs font-semibold text-zinc-800 underline-offset-4 hover:underline"
                            href="/seller/shop"
                        >
                            Quản lý tại Hồ sơ shop
                        </Link>
                    </div>
                </article>
            </section>

            <section className="relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl border border-zinc-700/80 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 p-5 shadow-lg shadow-zinc-950/15 sm:flex-row sm:items-center sm:justify-between">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-20 -z-10 size-56 rounded-full bg-white/15 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-24 -z-10 size-48 rounded-full border border-white/15"
                />
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold tracking-wide text-white">
                            Thao tác ví
                        </h2>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-300">
                        Nạp qua Pay2S hoặc gửi yêu cầu rút về tài khoản trong hồ
                        sơ shop.
                    </p>
                </div>
                <div className="relative flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-white/20 bg-white/5 px-4 text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/10 hover:text-white"
                        onClick={() => openWalletAction('deposit')}
                    >
                        <ArrowDownToLine aria-hidden="true" />
                        Nạp tiền
                    </Button>
                    <Button
                        type="button"
                        disabled={
                            !payoutAccount?.payoutBankName ||
                            !payoutAccount?.payoutAccountNumberMasked
                        }
                        className="h-10 rounded-xl border-white/20 bg-gradient-to-r from-zinc-800 to-zinc-700 px-4 text-white shadow-md shadow-black/20 hover:from-zinc-700 hover:to-zinc-600"
                        onClick={() => openWalletAction('withdraw')}
                    >
                        <ArrowUpFromLine aria-hidden="true" />
                        Rút tiền
                    </Button>
                </div>
            </section>

            <Dialog
                open={activeAction !== null}
                onOpenChange={handleDialogOpenChange}
            >
                <DialogContent className="flex w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl sm:max-w-3xl">
                    <div className="shrink-0 border-b border-zinc-100 bg-gradient-to-r from-white via-zinc-50/80 to-white px-6 py-5 pr-14 sm:px-8 sm:py-6">
                        <DialogHeader className="flex-row items-start gap-4 space-y-0">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md shadow-zinc-950/15">
                                {activeAction === 'deposit' ? (
                                    <WalletCards
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <ArrowUpFromLine
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                )}
                            </span>
                            <div className="min-w-0 space-y-1.5">
                                <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                                    {activeAction === 'deposit'
                                        ? 'Nạp tiền vào ví'
                                        : 'Rút tiền từ ví'}
                                </DialogTitle>
                                <DialogDescription className="max-w-xl leading-5 text-zinc-500">
                                    {activeAction === 'deposit'
                                        ? 'Tạo giao dịch nạp tiền và hoàn tất thanh toán qua Pay2S.'
                                        : 'Gửi yêu cầu cho admin chuyển khoản đến tài khoản trong hồ sơ shop.'}
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                    </div>

                    {activeAction && (
                        <form
                            className="flex min-h-0 flex-1 flex-col"
                            onSubmit={handleWalletActionSubmit}
                        >
                            <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                                <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
                                    <section className="flex min-h-52 flex-col rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-50 p-5 shadow-sm sm:p-6">
                                        <div className="flex h-12 shrink-0 items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                                <CircleDollarSign
                                                    className="size-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <Label
                                                    htmlFor="wallet-action-amount"
                                                    className="text-sm font-semibold text-zinc-950"
                                                >
                                                    Số tiền{' '}
                                                    {activeAction === 'deposit'
                                                        ? 'nạp'
                                                        : 'rút'}
                                                </Label>
                                                <p className="mt-0.5 text-xs text-zinc-500">
                                                    Nhập giá trị giao dịch
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                                                VND
                                            </span>
                                        </div>
                                        <div className="relative mt-6">
                                            <Input
                                                id="wallet-action-amount"
                                                name="amount"
                                                type="number"
                                                min="10000"
                                                step="10000"
                                                placeholder="Tối thiểu 10.000 đ"
                                                className="h-14 rounded-xl border-zinc-300 bg-white px-4 pr-14 text-lg font-semibold tabular-nums shadow-sm transition-shadow focus-visible:shadow-md focus-visible:ring-zinc-900/15"
                                                required
                                            />
                                            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-zinc-500">
                                                đ
                                            </span>
                                        </div>
                                        <p className="mt-auto pt-4 text-xs leading-5 text-zinc-500">
                                            Mỗi giao dịch tối thiểu 10.000 đ.
                                        </p>
                                    </section>

                                    {activeAction === 'deposit' ? (
                                        <section className="flex min-h-52 flex-col justify-between rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-white p-5 shadow-sm sm:p-6">
                                            <div>
                                                <div className="flex h-12 shrink-0 items-center gap-3">
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                                        <Banknote
                                                            className="size-5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-zinc-950">
                                                            Pay2S
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-zinc-500">
                                                            Phương thức thanh
                                                            toán
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="mt-4 text-sm leading-5 text-zinc-600">
                                                    Ví chỉ được cộng sau khi
                                                    Pay2S xác nhận giao dịch hợp
                                                    lệ.
                                                </p>
                                            </div>
                                            <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-xs leading-5 text-zinc-600 shadow-sm shadow-zinc-950/[0.02]">
                                                <ShieldCheck
                                                    className="size-4 shrink-0 text-zinc-800"
                                                    aria-hidden="true"
                                                />
                                                <span>
                                                    Khoản nạp đã ghi nhận có thể
                                                    rút khỏi ví.
                                                </span>
                                            </div>
                                        </section>
                                    ) : (
                                        <section className="flex min-h-52 flex-col justify-between rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 via-white to-white p-5 shadow-sm sm:p-6">
                                            <div>
                                                <div className="flex h-12 shrink-0 items-center gap-3">
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                                        <Landmark
                                                            className="size-5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-zinc-950">
                                                            {payoutAccount?.payoutBankName ||
                                                                'Chưa thiết lập ngân hàng'}
                                                        </p>
                                                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                                                            {payoutAccount?.payoutAccountHolder ||
                                                                'Chưa có tên chủ tài khoản'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 shadow-sm shadow-zinc-950/[0.02]">
                                                    <span className="text-xs font-medium text-zinc-500">
                                                        Số tài khoản
                                                    </span>
                                                    <span className="truncate font-mono text-xs font-semibold tracking-wide text-zinc-800">
                                                        {payoutAccount?.payoutAccountNumberMasked ||
                                                            '—'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-xs leading-5 text-zinc-600 shadow-sm shadow-zinc-950/[0.02]">
                                                <Clock3
                                                    className="mt-0.5 size-4 shrink-0 text-zinc-800"
                                                    aria-hidden="true"
                                                />
                                                <span>
                                                    Admin chuyển khoản thủ công;
                                                    số dư được giữ chỗ khi gửi
                                                    yêu cầu.
                                                </span>
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {(depositMutation.isError ||
                                    withdrawalMutation.isError) && (
                                    <div
                                        role="alert"
                                        className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-5 text-rose-800"
                                    >
                                        {activeAction === 'deposit'
                                            ? getErrorMessage(
                                                  depositMutation.error,
                                              )
                                            : getErrorMessage(
                                                  withdrawalMutation.error,
                                              )}
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-zinc-100 bg-zinc-50/70 px-6 py-4 sm:px-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 rounded-xl border-zinc-200 bg-white px-5"
                                    onClick={() =>
                                        handleDialogOpenChange(false)
                                    }
                                >
                                    Đóng
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-10 rounded-xl bg-zinc-950 px-5 text-white shadow-sm hover:bg-zinc-800"
                                    disabled={
                                        depositMutation.isPending ||
                                        withdrawalMutation.isPending ||
                                        (activeAction === 'withdraw' &&
                                            (!payoutAccount?.payoutBankName ||
                                                !payoutAccount?.payoutAccountNumberMasked))
                                    }
                                >
                                    {depositMutation.isPending ||
                                    withdrawalMutation.isPending
                                        ? 'Đang xử lý…'
                                        : activeAction === 'deposit'
                                          ? 'Tiếp tục thanh toán'
                                          : 'Gửi yêu cầu rút'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={successfulWithdrawal !== null}
                onOpenChange={handleWithdrawalSuccessOpenChange}
            >
                <DialogContent className="w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl sm:max-w-lg">
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50/70 px-6 pb-7 pt-8 sm:px-8">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -left-16 bottom-0 size-36 rounded-full bg-emerald-100/60 blur-3xl"
                        />
                        <DialogHeader className="relative items-center text-center sm:text-center">
                            <span className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                                <span className="flex size-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                                    <Check
                                        className="size-8"
                                        strokeWidth={3}
                                        aria-hidden="true"
                                    />
                                </span>
                            </span>
                            <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-950">
                                Đã gửi yêu cầu rút tiền
                            </DialogTitle>
                            <DialogDescription className="max-w-sm text-sm leading-6 text-zinc-600">
                                Admin sẽ kiểm tra và xử lý yêu cầu trong vòng 24
                                giờ. Bạn có thể theo dõi tiến độ trong lịch sử
                                rút tiền bên dưới.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {successfulWithdrawal && (
                        <div className="space-y-4 px-6 py-5 sm:px-8">
                            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                                            Số tiền yêu cầu
                                        </p>
                                        <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
                                            {formatMoney(
                                                successfulWithdrawal.amount,
                                            )}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                                        <Clock3
                                            className="size-3.5"
                                            aria-hidden="true"
                                        />
                                        Chờ admin xử lý
                                    </span>
                                </div>
                                <div className="mt-4 flex items-start gap-3 border-t border-zinc-100 pt-4">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                                        <Landmark
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-zinc-900">
                                            {successfulWithdrawal.bankName}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm text-zinc-600">
                                            {successfulWithdrawal.accountHolder}
                                        </p>
                                        <p className="mt-1 font-mono text-xs text-zinc-500">
                                            STK:{' '}
                                            {
                                                successfulWithdrawal.accountNumberMasked
                                            }
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <p className="rounded-xl bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600 ring-1 ring-inset ring-zinc-200/80">
                                Số tiền đang được giữ chỗ trong ví. Khoản này
                                chỉ được trừ hẳn khi admin xác nhận đã chuyển
                                khoản.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.04]">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 bg-gradient-to-r from-white via-white to-zinc-50/80 px-5 py-5 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm ring-4 ring-zinc-100">
                            <ArrowUpFromLine
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-semibold tracking-tight text-zinc-950">
                                Yêu cầu rút tiền
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                Tiền được giữ chỗ khi gửi và chỉ trừ hẳn khi
                                admin xác nhận đã chuyển.
                            </p>
                        </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm">
                        {withdrawalsQuery.isError
                            ? 'Không tải được'
                            : withdrawalsQuery.isPending
                              ? 'Đang tải…'
                              : `${withdrawalsQuery.data?.total ?? 0} yêu cầu`}
                    </span>
                </header>
                {withdrawalsQuery.isError ? (
                    <p
                        role="alert"
                        className="px-5 py-10 text-center text-sm text-rose-700"
                    >
                        Không thể tải lịch sử yêu cầu rút. Hãy thử tải lại
                        trang.
                    </p>
                ) : withdrawalsQuery.isPending ? (
                    <div
                        role="status"
                        aria-label="Đang tải yêu cầu rút"
                        className="space-y-3 px-5 py-5"
                    >
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-14 animate-pulse rounded-xl bg-zinc-100"
                            />
                        ))}
                    </div>
                ) : withdrawalsQuery.data?.items.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-sm">
                            <thead className="bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                <tr>
                                    <th className="w-[16%] px-5 py-3.5 sm:px-6">
                                        Số tiền
                                    </th>
                                    <th className="w-[29%] px-5 py-3.5">
                                        Tài khoản nhận
                                    </th>
                                    <th className="w-[33%] px-5 py-3.5">
                                        Trạng thái
                                    </th>
                                    <th className="w-[22%] px-5 py-3.5 sm:px-6">
                                        Ngày gửi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100/80">
                                {withdrawalsQuery.data.items.map(
                                    (withdrawal) => (
                                        <tr
                                            key={withdrawal.id}
                                            className="group transition-colors hover:bg-zinc-50/70"
                                        >
                                            <td className="px-5 py-4 align-middle sm:px-6">
                                                <span className="font-semibold tracking-tight text-zinc-950 tabular-nums">
                                                    {formatMoney(
                                                        withdrawal.amount,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 transition-colors group-hover:bg-white">
                                                        <Landmark
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-zinc-900">
                                                            {
                                                                withdrawal.bankName
                                                            }
                                                        </p>
                                                        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2">
                                                            <span className="truncate text-xs font-medium text-zinc-700">
                                                                {
                                                                    withdrawal.accountHolder
                                                                }
                                                            </span>
                                                            <span className="inline-flex shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] tracking-wide text-zinc-500">
                                                                {
                                                                    withdrawal.accountNumberMasked
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <span
                                                    className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${getWithdrawalStatusBadgeClassName(withdrawal.status)}`}
                                                >
                                                    {getWithdrawalStatusLabel(
                                                        withdrawal.status,
                                                    )}
                                                </span>
                                                {withdrawal.adminNote ? (
                                                    <p className="mt-2 max-w-sm border-l-2 border-zinc-200 pl-2.5 text-xs leading-5 text-zinc-500">
                                                        {withdrawal.adminNote}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 align-middle sm:px-6">
                                                <p className="font-medium text-zinc-700">
                                                    {new Date(
                                                        withdrawal.createdAt,
                                                    ).toLocaleDateString(
                                                        'vi-VN',
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {new Date(
                                                        withdrawal.createdAt,
                                                    ).toLocaleTimeString(
                                                        'vi-VN',
                                                    )}
                                                </p>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center px-5 py-10 text-center">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                            <ArrowUpFromLine
                                className="size-5"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="mt-3 text-sm font-medium text-zinc-800">
                            Bạn chưa gửi yêu cầu rút tiền nào
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Yêu cầu mới sẽ được theo dõi tại đây.
                        </p>
                    </div>
                )}
                {withdrawalsQuery.data &&
                withdrawalsQuery.data.total > SELLER_WITHDRAWALS_PAGE_SIZE ? (
                    <footer className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p aria-live="polite" className="text-xs text-zinc-500">
                            Hiển thị{' '}
                            <span className="font-semibold text-zinc-800">
                                {(withdrawalsPage - 1) *
                                    SELLER_WITHDRAWALS_PAGE_SIZE +
                                    1}
                                –
                                {Math.min(
                                    withdrawalsPage *
                                        SELLER_WITHDRAWALS_PAGE_SIZE,
                                    withdrawalsQuery.data.total,
                                )}
                            </span>{' '}
                            trong {withdrawalsQuery.data.total} yêu cầu
                        </p>
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                aria-label="Trang yêu cầu rút trước"
                                disabled={
                                    withdrawalsPage <= 1 ||
                                    withdrawalsQuery.isFetching
                                }
                                onClick={() =>
                                    setWithdrawalsPage((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                            >
                                <ChevronLeft aria-hidden="true" />
                                Trước
                            </Button>
                            <span
                                aria-live="polite"
                                className="min-w-24 text-center text-xs font-medium text-zinc-700"
                            >
                                {withdrawalsQuery.isFetching
                                    ? 'Đang tải…'
                                    : `Trang ${withdrawalsPage} / ${Math.ceil(withdrawalsQuery.data.total / SELLER_WITHDRAWALS_PAGE_SIZE)}`}
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                aria-label="Trang yêu cầu rút tiếp theo"
                                disabled={
                                    withdrawalsPage >=
                                        Math.ceil(
                                            withdrawalsQuery.data.total /
                                                SELLER_WITHDRAWALS_PAGE_SIZE,
                                        ) || withdrawalsQuery.isFetching
                                }
                                onClick={() =>
                                    setWithdrawalsPage((current) => current + 1)
                                }
                            >
                                Sau
                                <ChevronRight aria-hidden="true" />
                            </Button>
                        </div>
                    </footer>
                ) : null}
            </section>

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-gradient-to-r from-zinc-50 via-white to-slate-50 px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-700 text-white shadow-md shadow-zinc-900/15">
                            <Banknote className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="font-semibold tracking-tight text-zinc-950">
                                Lịch sử giao dịch
                            </h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                Tiền bán hàng, nạp ví và các khoản điều chỉnh
                            </p>
                        </div>
                    </div>
                    <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                        {wallet?.total ?? 0} giao dịch
                    </span>
                </div>
                {!wallet?.transactions.length ? (
                    <div className="flex flex-col items-center px-5 py-12 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-slate-100 text-zinc-600">
                            <WalletCards
                                className="size-6"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="mt-4 font-medium text-zinc-900">
                            Chưa ghi nhận giao dịch nào
                        </p>
                        <p className="mt-1 max-w-md text-sm leading-6 text-zinc-500">
                            Tiền hàng sẽ xuất hiện sau khi thanh toán được xác
                            nhận. Đơn COD chỉ được ghi nhận sau khi shop đã đối
                            soát tiền thu hộ.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50/90 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                <tr>
                                    <th
                                        className="px-5 py-3.5 sm:px-6"
                                        scope="col"
                                    >
                                        Giao dịch
                                    </th>
                                    <th
                                        className="hidden px-5 py-3.5 md:table-cell"
                                        scope="col"
                                    >
                                        Mã tham chiếu
                                    </th>
                                    <th
                                        className="hidden px-5 py-3.5 md:table-cell"
                                        scope="col"
                                    >
                                        Thời gian
                                    </th>
                                    <th
                                        className="px-5 py-3.5 text-right sm:px-6"
                                        scope="col"
                                    >
                                        Số tiền
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {wallet.transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="group transition-colors hover:bg-gradient-to-r hover:from-zinc-50/80 hover:to-white"
                                    >
                                        <td className="px-5 py-4 sm:px-6">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-colors ${transaction.amount.startsWith('-') ? 'border-rose-100 bg-rose-50 text-rose-700' : 'border-zinc-200 bg-white text-zinc-900 group-hover:border-zinc-300'}`}
                                                >
                                                    <CircleDollarSign
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <span className="font-medium text-zinc-900">
                                                    {getTransactionLabel(
                                                        transaction.kind,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-1 pl-[52px] text-xs text-zinc-500 md:hidden">
                                                <span
                                                    title={
                                                        transaction.orderId
                                                            ? `Mã đơn đầy đủ: ${transaction.orderNumber ?? transaction.orderId}`
                                                            : undefined
                                                    }
                                                >
                                                    {transaction.orderNumber ??
                                                        (transaction.orderId
                                                            ? `#${transaction.orderId.slice(0, 8).toUpperCase()}`
                                                            : transaction.returnRequestId
                                                              ? `Hoàn #${transaction.returnRequestId.slice(0, 8).toUpperCase()}`
                                                              : 'Ví shop')}
                                                </span>
                                                <span aria-hidden="true">
                                                    {' '}
                                                    ·{' '}
                                                </span>
                                                <time
                                                    dateTime={
                                                        transaction.createdAt
                                                    }
                                                >
                                                    {new Date(
                                                        transaction.createdAt,
                                                    ).toLocaleString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </time>
                                            </p>
                                        </td>
                                        <td className="hidden px-5 py-4 md:table-cell">
                                            <span
                                                className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600"
                                                title={
                                                    transaction.orderId
                                                        ? `Mã đơn đầy đủ: ${transaction.orderNumber ?? transaction.orderId}`
                                                        : undefined
                                                }
                                            >
                                                {transaction.orderNumber ??
                                                    (transaction.orderId
                                                        ? `#${transaction.orderId.slice(0, 8).toUpperCase()}`
                                                        : transaction.returnRequestId
                                                          ? `Hoàn #${transaction.returnRequestId.slice(0, 8).toUpperCase()}`
                                                          : 'Ví shop')}
                                            </span>
                                        </td>
                                        <td className="hidden px-5 py-4 text-sm text-zinc-500 md:table-cell">
                                            <time
                                                dateTime={transaction.createdAt}
                                            >
                                                {new Date(
                                                    transaction.createdAt,
                                                ).toLocaleString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </time>
                                        </td>
                                        <td className="px-5 py-4 text-right sm:px-6">
                                            <span
                                                className={`font-semibold tabular-nums ${transaction.amount.startsWith('-') ? 'text-rose-700' : 'text-zinc-950'}`}
                                            >
                                                {transaction.kind ===
                                                'WITHDRAWAL_PAID'
                                                    ? '—'
                                                    : `${Number(transaction.amount) > 0 ? '+' : ''}${formatMoney(transaction.amount)}`}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {wallet && wallet.total > SELLER_WALLET_HISTORY_PAGE_SIZE ? (
                    <footer className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p aria-live="polite" className="text-xs text-zinc-500">
                            Hiển thị{' '}
                            <span className="font-semibold text-zinc-800">
                                {(walletPage - 1) *
                                    SELLER_WALLET_HISTORY_PAGE_SIZE +
                                    1}
                                –
                                {Math.min(
                                    walletPage *
                                        SELLER_WALLET_HISTORY_PAGE_SIZE,
                                    wallet.total,
                                )}
                            </span>{' '}
                            trong {wallet.total} giao dịch
                        </p>
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                aria-label="Trang giao dịch trước"
                                disabled={
                                    walletPage <= 1 || walletQuery.isFetching
                                }
                                onClick={() =>
                                    setWalletPage((current) =>
                                        Math.max(1, current - 1),
                                    )
                                }
                            >
                                <ChevronLeft aria-hidden="true" />
                                Trước
                            </Button>
                            <span
                                aria-live="polite"
                                className="min-w-24 text-center text-xs font-medium text-zinc-700"
                            >
                                {walletQuery.isFetching
                                    ? 'Đang tải…'
                                    : `Trang ${walletPage} / ${Math.ceil(wallet.total / SELLER_WALLET_HISTORY_PAGE_SIZE)}`}
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                aria-label="Trang giao dịch tiếp theo"
                                disabled={
                                    walletPage >=
                                        Math.ceil(
                                            wallet.total /
                                                SELLER_WALLET_HISTORY_PAGE_SIZE,
                                        ) || walletQuery.isFetching
                                }
                                onClick={() =>
                                    setWalletPage((current) => current + 1)
                                }
                            >
                                Sau
                                <ChevronRight aria-hidden="true" />
                            </Button>
                        </div>
                    </footer>
                ) : null}
            </section>
        </div>
    );
}
