// Màn seller finance quản lý số dư, nạp Pay2S Sandbox và yêu cầu admin chuyển khoản payout.
'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Banknote,
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
import type { SellerWalletAction } from '../types/seller-finance.types';
import { SellerFinanceSkeleton } from './SellerFinanceSkeleton';
import { getErrorMessage } from '@/utils/getErrorMessage';

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

// Tải ví, tạo nạp Sandbox hoặc gửi yêu cầu payout giữ chỗ theo tài khoản đã xác minh trong hồ sơ shop.
export function SellerFinancePageContent() {
    const queryClient = useQueryClient();
    const [activeAction, setActiveAction] = useState<SellerWalletAction | null>(
        null,
    );
    const [actionNotice, setActionNotice] = useState<string | null>(null);
    const walletQuery = useQuery({
        queryKey: ['seller-wallet', 1],
        queryFn: () => getSellerWallet(1, 30),
        staleTime: 30_000,
    });
    const profileQuery = useQuery({
        queryKey: ['seller', 'shop-profile'],
        queryFn: shopProfileService.getMine,
        staleTime: 60_000,
    });
    const withdrawalsQuery = useQuery({
        queryKey: ['seller-wallet-withdrawals', 1],
        queryFn: () => getSellerWalletWithdrawals(1, 20),
        staleTime: 15_000,
    });
    const depositMutation = useMutation({
        mutationFn: createSellerWalletDeposit,
        onSuccess: ({ paymentUrl }) => window.location.assign(paymentUrl),
    });
    const withdrawalMutation = useMutation({
        mutationFn: createSellerWalletWithdrawal,
        onSuccess: async () => {
            setActiveAction(null);
            setActionNotice(
                'Yêu cầu rút đã được gửi. Số tiền được giữ chỗ trong lúc admin xử lý.',
            );
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

    // Mở biểu mẫu được chọn và xóa thông báo cũ để mỗi lần thử bắt đầu rõ ràng.
    function openWalletAction(action: SellerWalletAction) {
        setActiveAction(action);
        setActionNotice(null);
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

    // Top-up điều hướng sang Sandbox; yêu cầu rút chỉ gửi số tiền để server tự lấy và snapshot tài khoản shop.
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
                                <Clock3
                                    className="size-3.5 text-zinc-200"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="line-clamp-2 min-w-0 text-xs font-medium leading-4 text-zinc-200">
                                Tiền hàng đang chờ
                            </span>
                        </div>
                        <span className="shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-medium text-zinc-200">
                            Đang đối soát
                        </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight">
                        {formatMoney(wallet?.pendingBalance ?? '0')}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-300">
                        Tổng tiền hàng từ các đơn chưa hoàn tất; xem mã đơn
                        trong lịch sử.
                    </p>
                </article>

                <article className="relative min-w-[280px] flex-1 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-slate-100 p-3.5 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                                <WalletCards
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="line-clamp-2 min-w-0 text-xs font-medium leading-4 text-zinc-600">
                                Số dư khả dụng
                            </span>
                        </div>
                        <span className="shrink-0 whitespace-nowrap rounded-full border border-zinc-200 bg-white/80 px-2 py-0.5 text-[9px] font-medium text-zinc-600">
                            Có thể sử dụng
                        </span>
                    </div>
                    <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">
                        {formatMoney(wallet?.availableBalance ?? '0')}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">
                        Có thể rút hoặc sử dụng; khoản đang chờ admin chuyển
                        được tách riêng.
                    </p>
                </article>

                <article className="relative min-w-[280px] flex-1 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800">
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
                        Nạp qua Pay2S Sandbox hoặc gửi yêu cầu rút về tài khoản
                        trong hồ sơ shop.
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

            {actionNotice && (
                <p
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                >
                    {actionNotice}
                </p>
            )}

            <Dialog
                open={activeAction !== null}
                onOpenChange={handleDialogOpenChange}
            >
                <DialogContent className="w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto overflow-x-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl sm:max-w-xl">
                    <DialogHeader className="border-b border-zinc-100 px-6 py-5 pr-12 sm:px-8 sm:py-6">
                        <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-950">
                            {activeAction === 'deposit'
                                ? 'Nạp tiền vào ví'
                                : 'Rút tiền từ ví'}
                        </DialogTitle>
                        <DialogDescription className="max-w-xl leading-5 text-zinc-500">
                            {activeAction === 'deposit'
                                ? 'Nhập số tiền rồi hoàn tất thanh toán trong Pay2S Sandbox.'
                                : 'Yêu cầu sẽ gửi tới admin; tài khoản nhận lấy từ hồ sơ shop.'}
                        </DialogDescription>
                    </DialogHeader>

                    {activeAction && (
                        <form
                            className="space-y-6 p-6 sm:p-8"
                            onSubmit={handleWalletActionSubmit}
                        >
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="wallet-action-amount">
                                        Số tiền{' '}
                                        {activeAction === 'deposit'
                                            ? 'nạp'
                                            : 'rút'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="wallet-action-amount"
                                            name="amount"
                                            type="number"
                                            min="10000"
                                            step="10000"
                                            placeholder="Tối thiểu 10.000 đ"
                                            className="h-12 rounded-xl border-zinc-300 bg-white px-4 pr-12 text-base shadow-sm focus-visible:ring-zinc-900/15"
                                            required
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-zinc-400">
                                            đ
                                        </span>
                                    </div>
                                </div>

                                {activeAction === 'deposit' ? (
                                    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                            <Banknote
                                                className="size-5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-zinc-500">
                                                Phương thức nạp
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold text-zinc-950">
                                                Pay2S Sandbox
                                            </p>
                                            <p className="mt-1 text-sm leading-5 text-zinc-500">
                                                Số dư chỉ tăng sau khi callback
                                                Pay2S Sandbox hợp lệ. Tiền nạp
                                                có thể rút.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200">
                                                <Landmark
                                                    className="size-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-zinc-950">
                                                    {payoutAccount?.payoutBankName ||
                                                        'Chưa thiết lập ngân hàng'}
                                                </p>
                                                <p className="mt-0.5 text-sm text-zinc-600">
                                                    {payoutAccount?.payoutAccountHolder ||
                                                        'Chưa có tên chủ tài khoản'}
                                                </p>
                                                <p className="mt-1 font-mono text-xs text-zinc-500">
                                                    STK:{' '}
                                                    {payoutAccount?.payoutAccountNumberMasked ||
                                                        '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-3 border-t border-zinc-200 pt-3 text-sm leading-5 text-zinc-500">
                                            Admin chuyển khoản thủ công. Số dư
                                            sẽ được giữ chỗ ngay khi gửi yêu
                                            cầu.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {(depositMutation.isError ||
                                withdrawalMutation.isError) && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800"
                                >
                                    {activeAction === 'deposit'
                                        ? getErrorMessage(depositMutation.error)
                                        : getErrorMessage(
                                              withdrawalMutation.error,
                                          )}
                                </div>
                            )}

                            <DialogFooter className="-mx-6 -mb-6 rounded-b-3xl border-zinc-100 bg-zinc-50/80 px-6 py-4 sm:-mx-8 sm:-mb-8 sm:px-8 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() =>
                                        handleDialogOpenChange(false)
                                    }
                                >
                                    Đóng
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-xl"
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

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="font-semibold text-zinc-950">
                            Yêu cầu rút tiền
                        </h2>
                        <p className="mt-1 text-xs text-zinc-500">
                            Tiền được giữ chỗ khi gửi và chỉ trừ hẳn khi admin
                            xác nhận đã chuyển.
                        </p>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                        {withdrawalsQuery.data?.total ?? 0} yêu cầu
                    </span>
                </div>
                {withdrawalsQuery.isError ? (
                    <p role="alert" className="px-5 py-8 text-sm text-rose-700">
                        Không thể tải lịch sử yêu cầu rút.
                    </p>
                ) : withdrawalsQuery.isPending ? (
                    <div
                        className="h-20 animate-pulse bg-zinc-50"
                        aria-label="Đang tải yêu cầu rút"
                    />
                ) : withdrawalsQuery.data?.items.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                <tr>
                                    <th className="px-5 py-3 sm:px-6">
                                        Số tiền
                                    </th>
                                    <th className="px-5 py-3">
                                        Tài khoản nhận
                                    </th>
                                    <th className="px-5 py-3">Trạng thái</th>
                                    <th className="px-5 py-3 sm:px-6">
                                        Ngày gửi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {withdrawalsQuery.data.items.map(
                                    (withdrawal) => (
                                        <tr key={withdrawal.id}>
                                            <td className="px-5 py-4 font-semibold tabular-nums sm:px-6">
                                                {formatMoney(withdrawal.amount)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-medium">
                                                    {withdrawal.bankName}
                                                </p>
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {withdrawal.accountHolder} ·{' '}
                                                    {
                                                        withdrawal.accountNumberMasked
                                                    }
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs">
                                                    {getWithdrawalStatusLabel(
                                                        withdrawal.status,
                                                    )}
                                                </span>
                                                {withdrawal.adminNote ? (
                                                    <p className="mt-1 max-w-xs text-xs text-zinc-500">
                                                        {withdrawal.adminNote}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-zinc-500 sm:px-6">
                                                {new Date(
                                                    withdrawal.createdAt,
                                                ).toLocaleString('vi-VN')}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="px-5 py-9 text-center text-sm text-zinc-500">
                        Bạn chưa gửi yêu cầu rút tiền nào.
                    </p>
                )}
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
            </section>
        </div>
    );
}
