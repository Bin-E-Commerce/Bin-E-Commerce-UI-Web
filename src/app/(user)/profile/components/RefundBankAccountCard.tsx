// Thẻ tóm tắt tài khoản nhận hoàn của người dùng, che số tài khoản cho đến khi chủ tài khoản chọn xem.
'use client';

import { useState } from 'react';
import {
    Building2,
    CreditCard,
    Eye,
    EyeOff,
    PencilLine,
    Plus,
    RefreshCw,
    ShieldCheck,
    UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRefundBankAccount } from '../hooks/useRefundBankAccount';
import type { RefundBankAccountCardProps } from '../types/refund-bank-account.type';
import { RefundBankAccountDialog } from './RefundBankAccountDialog';

// Che mọi chữ số trừ bốn số cuối; nút xem chỉ thay đổi cách hiển thị ở phiên hiện tại.
function maskAccountNumber(accountNumber: string): string {
    return `${'•'.repeat(Math.max(accountNumber.length - 4, 0))}${accountNumber.slice(-4)}`;
}

// Chỉ thẻ này tải và sửa tài khoản của user hiện tại; query error có nút thử lại thay vì giả báo chưa có dữ liệu.
export function RefundBankAccountCard({ userId }: RefundBankAccountCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAccountVisible, setIsAccountVisible] = useState(false);
    const { account, isLoading, isError, refetch, isSaving, saveAccount } =
        useRefundBankAccount(userId);

    // Che lại số tài khoản trước khi mở form để thông tin không còn lộ sau thao tác chỉnh sửa.
    function openEditDialog(): void {
        setIsAccountVisible(false);
        setIsDialogOpen(true);
    }

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                            <CreditCard className="size-5" />
                        </span>
                        <div>
                            <h2 className="font-semibold text-zinc-900">
                                Tài khoản nhận hoàn
                            </h2>
                            <p className="mt-0.5 text-sm text-zinc-500">
                                Thông tin ngân hàng dùng khi hoàn tiền đơn hàng
                            </p>
                        </div>
                    </div>
                    {!isLoading && !isError ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-xl border-zinc-200 px-3.5"
                            onClick={openEditDialog}
                        >
                            {account ? (
                                <PencilLine className="size-4" />
                            ) : (
                                <Plus className="size-4" />
                            )}
                            {account ? 'Chỉnh sửa' : 'Thêm tài khoản'}
                        </Button>
                    ) : null}
                </div>

                <div className="p-5 sm:p-6">
                    {isLoading ? (
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Skeleton className="h-20 rounded-xl" />
                            <Skeleton className="h-20 rounded-xl" />
                            <Skeleton className="h-20 rounded-xl" />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 sm:flex-row sm:items-center">
                            <p className="text-sm text-red-700">
                                Không tải được thông tin ngân hàng. Vui lòng thử
                                lại.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 rounded-xl border-red-200 bg-white px-3 text-red-700 hover:bg-red-100"
                                onClick={() => void refetch()}
                            >
                                <RefreshCw className="size-4" />
                                Thử lại
                            </Button>
                        </div>
                    ) : account ? (
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                    <Building2 className="size-4" />
                                    Ngân hàng
                                </div>
                                <p className="mt-2 break-words text-sm font-semibold text-zinc-900">
                                    {account.bankName}
                                </p>
                            </div>
                            <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                    <UserRound className="size-4" />
                                    Chủ tài khoản
                                </div>
                                <p className="mt-2 break-words text-sm font-semibold text-zinc-900">
                                    {account.accountHolder}
                                </p>
                            </div>
                            <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                                <div className="flex items-center justify-between gap-2 text-xs font-medium text-zinc-500">
                                    <span className="flex items-center gap-2">
                                        <CreditCard className="size-4" />
                                        Số tài khoản
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={
                                            isAccountVisible
                                                ? 'Ẩn số tài khoản'
                                                : 'Hiện số tài khoản'
                                        }
                                        onClick={() =>
                                            setIsAccountVisible(
                                                (visible) => !visible,
                                            )
                                        }
                                    >
                                        {isAccountVisible ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="mt-1.5 break-all font-mono text-sm font-semibold tracking-wide text-zinc-900">
                                    {isAccountVisible
                                        ? account.accountNumber
                                        : maskAccountNumber(
                                              account.accountNumber,
                                          )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-4 sm:flex-row sm:items-center">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm">
                                <ShieldCheck className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-zinc-800">
                                    Bạn chưa thêm tài khoản nhận hoàn.
                                </p>
                                <p className="mt-1 text-sm leading-5 text-zinc-500">
                                    Thêm ngân hàng, tên chủ tài khoản và số tài
                                    khoản để thuận tiện nhận tiền hoàn.
                                </p>
                            </div>
                        </div>
                    )}
                    {account && !isError ? (
                        <p className="mt-3 text-xs leading-5 text-zinc-500">
                            Hãy kiểm tra thông tin trước khi lưu; tài khoản này
                            có thể chỉnh sửa bất cứ lúc nào.
                        </p>
                    ) : null}
                </div>
            </section>

            <RefundBankAccountDialog
                account={account}
                isOpen={isDialogOpen}
                isSaving={isSaving}
                onOpenChange={setIsDialogOpen}
                onSave={saveAccount}
            />
        </>
    );
}
