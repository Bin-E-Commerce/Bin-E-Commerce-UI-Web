// Màn seller finance hiển thị tiền chờ, khả dụng và ledger; không cho yêu cầu rút tiền ở giai đoạn này.
'use client';

import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowDownLeft,
    ArrowDownToLine,
    ArrowUpRight,
    ArrowUpFromLine,
    Clock3,
    Info,
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
import { getSellerWallet } from '@/services/seller/api/seller-wallet.api';
import type { SellerWalletAction } from '../types/seller-finance.types';

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
    };
    return labels[kind] ?? kind;
}

// Tải snapshot ví và mở biểu mẫu prototype; các thao tác thử không gửi request hay đổi số dư.
export function SellerFinancePageContent() {
    const [activeAction, setActiveAction] = useState<SellerWalletAction | null>(
        null,
    );
    const [prototypeSubmitted, setPrototypeSubmitted] = useState(false);
    const walletQuery = useQuery({
        queryKey: ['seller-wallet', 1],
        queryFn: () => getSellerWallet(1, 30),
        staleTime: 30_000,
    });
    const wallet = walletQuery.data;

    // Mở biểu mẫu được chọn và xóa thông báo cũ để mỗi lần thử bắt đầu rõ ràng.
    function openPrototypeAction(action: SellerWalletAction) {
        setActiveAction(action);
        setPrototypeSubmitted(false);
    }

    // Đóng hộp thoại thì xóa trạng thái thử; không gửi dữ liệu tới API hoặc sửa số dư.
    function handleDialogOpenChange(open: boolean) {
        if (open) return;
        setActiveAction(null);
        setPrototypeSubmitted(false);
    }

    // Chỉ chạy kiểm tra HTML và hiện thông báo prototype; không tạo giao dịch thật.
    function handlePrototypeSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPrototypeSubmitted(true);
    }

    if (walletQuery.isPending) {
        return (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm">
                Đang tải số dư shop...
            </div>
        );
    }
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
            <section className="grid gap-3 xl:grid-cols-2" aria-label="Số dư ví">
                <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-5 text-white shadow-md shadow-zinc-900/10">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full border border-white/20"
                    />
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                                <Clock3 className="size-4 text-zinc-200" aria-hidden="true" />
                            </span>
                            <span className="text-sm font-medium text-zinc-200">
                                Tiền hàng đang chờ
                            </span>
                        </div>
                        <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-zinc-200">
                            Đang đối soát
                        </span>
                    </div>
                    <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                        {formatMoney(wallet?.pendingBalance ?? '0')}
                    </p>
                    <p className="mt-2 max-w-lg text-xs leading-5 text-zinc-300">
                        Khoản tiền được giữ tại đây đến khi đơn hoàn tất, hết hạn trả hàng và không còn yêu cầu hoàn mở.
                    </p>
                </article>

                <article className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-slate-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                <WalletCards className="size-4" aria-hidden="true" />
                            </span>
                            <span className="text-sm font-medium text-zinc-600">
                                Số dư khả dụng
                            </span>
                        </div>
                        <span className="rounded-full border border-zinc-200 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-zinc-600">
                            Có thể sử dụng
                        </span>
                    </div>
                    <p className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                        {formatMoney(wallet?.availableBalance ?? '0')}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Số dư được theo dõi trong ví; thao tác nạp/rút hiện chỉ là giao diện thử nghiệm.
                    </p>
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
                        Mở biểu mẫu mẫu; chưa phát sinh giao dịch hay thay đổi số dư.
                    </p>
                </div>
                <div className="relative flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-white/20 bg-white/5 px-4 text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/10 hover:text-white"
                        onClick={() => openPrototypeAction('deposit')}
                    >
                        <ArrowDownToLine aria-hidden="true" />
                        Nạp tiền
                    </Button>
                    <Button
                        type="button"
                        className="h-10 rounded-xl border-white/20 bg-gradient-to-r from-zinc-800 to-zinc-700 px-4 text-white shadow-md shadow-black/20 hover:from-zinc-700 hover:to-zinc-600"
                        onClick={() => openPrototypeAction('withdraw')}
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
                <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-md gap-0 overflow-y-auto overflow-x-hidden rounded-3xl border-zinc-200 bg-white p-0 shadow-2xl">
                    <DialogHeader className="border-b border-zinc-100 px-6 py-5 pr-12">
                        <DialogTitle className="text-lg font-semibold text-zinc-950">
                            {activeAction === 'deposit'
                                ? 'Nạp tiền vào ví'
                                : 'Rút tiền từ ví'}
                        </DialogTitle>
                        <DialogDescription className="leading-5 text-zinc-500">
                            {activeAction === 'deposit'
                                ? 'Nhập số tiền muốn nạp để xem trước biểu mẫu.'
                                : 'Nhập thông tin nhận tiền để xem trước biểu mẫu.'}
                        </DialogDescription>
                    </DialogHeader>

                    {activeAction && (
                        <form
                            className="space-y-5 p-6"
                            onSubmit={handlePrototypeSubmit}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="wallet-action-amount">
                                    Số tiền {activeAction === 'deposit' ? 'nạp' : 'rút'}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="wallet-action-amount"
                                        name="amount"
                                        type="number"
                                        min="10000"
                                        step="10000"
                                        placeholder="Tối thiểu 10.000 đ"
                                        className="h-11 rounded-xl pr-12"
                                        required
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-zinc-400">
                                        đ
                                    </span>
                                </div>
                            </div>

                            {activeAction === 'deposit' ? (
                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                    <p className="text-xs font-medium text-zinc-500">
                                        Phương thức mẫu
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                                        VNPay Sandbox
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                                        Chưa kết nối cổng thanh toán nạp ví.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="wallet-bank-name">
                                            Ngân hàng
                                        </Label>
                                        <Input
                                            id="wallet-bank-name"
                                            name="bankName"
                                            placeholder="Ví dụ: Vietcombank"
                                            className="h-11 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wallet-account-holder">
                                            Tên chủ tài khoản
                                        </Label>
                                        <Input
                                            id="wallet-account-holder"
                                            name="accountHolder"
                                            placeholder="NGUYEN VAN A"
                                            className="h-11 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wallet-account-number">
                                            Số tài khoản
                                        </Label>
                                        <Input
                                            id="wallet-account-number"
                                            name="accountNumber"
                                            inputMode="numeric"
                                            placeholder="Nhập số tài khoản"
                                            className="h-11 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs leading-5 text-zinc-500">
                                        Thông tin chỉ dùng xem trước biểu mẫu; không gửi lên máy chủ hoặc lưu vào ví.
                                    </p>
                                </div>
                            )}

                            {prototypeSubmitted && (
                                <div
                                    role="status"
                                    className="flex gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-700"
                                >
                                    <Info
                                        className="mt-0.5 size-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    Đây là giao diện prototype. Yêu cầu chưa được gửi và số dư/lịch sử ví không thay đổi.
                                </div>
                            )}

                            <DialogFooter className="-mx-6 -mb-6 rounded-b-3xl border-zinc-100 bg-zinc-50/80 px-6 py-4 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => handleDialogOpenChange(false)}
                                >
                                    Đóng
                                </Button>
                                <Button type="submit" className="rounded-xl">
                                    Xem xác nhận mẫu
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                            <ArrowDownLeft className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="font-semibold text-zinc-950">Lịch sử giao dịch</h2>
                            <p className="mt-1 text-xs text-zinc-500">
                                Các khoản tiền hàng được ghi nhận vào ví shop
                            </p>
                        </div>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
                        {wallet?.total ?? 0} giao dịch
                    </span>
                </div>
                {!wallet?.transactions.length ? (
                    <div className="flex flex-col items-center px-5 py-12 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-slate-100 text-zinc-600">
                            <WalletCards className="size-6" aria-hidden="true" />
                        </span>
                        <p className="mt-4 font-medium text-zinc-900">
                            Chưa ghi nhận giao dịch nào
                        </p>
                        <p className="mt-1 max-w-md text-sm leading-6 text-zinc-500">
                            Tiền hàng sẽ xuất hiện sau khi thanh toán được xác nhận. Đơn COD chỉ được ghi nhận sau khi shop đã đối soát tiền thu hộ.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-100">
                        {wallet.transactions.map((transaction) => (
                            <li key={transaction.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-50/80 sm:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700">
                                        {transaction.amount.startsWith('-') ? (
                                            <ArrowUpRight className="size-4" aria-hidden="true" />
                                        ) : (
                                            <ArrowDownLeft className="size-4" aria-hidden="true" />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-medium text-zinc-900">
                                            {getTransactionLabel(transaction.kind)}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-zinc-500">
                                            Đơn {transaction.orderId}
                                        </p>
                                        <time
                                            className="mt-1 block text-xs text-zinc-400"
                                            dateTime={transaction.createdAt}
                                        >
                                            {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                                        </time>
                                    </div>
                                </div>
                                <p className="shrink-0 font-semibold tabular-nums text-zinc-950">
                                    {Number(transaction.amount) > 0 ? '+' : ''}
                                    {formatMoney(transaction.amount)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
