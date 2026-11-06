// Thẻ quản lý nhiều tài khoản hoàn của user hiện tại; số tài khoản được che riêng trên từng thẻ.
'use client';

import { useState } from 'react';
import {
    Building2,
    Check,
    CreditCard,
    Eye,
    EyeOff,
    LoaderCircle,
    PencilLine,
    Plus,
    RefreshCw,
    ShieldCheck,
    Star,
    Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { RefundBankAccountProfile } from '@/services/auth';
import { useRefundBankAccounts } from '../hooks/useRefundBankAccount';
import type { RefundBankAccountCardProps } from '../types/refund-bank-account.type';
import { RefundBankAccountDialog } from './RefundBankAccountDialog';

// Che mọi chữ số trừ bốn số cuối để thông tin tài khoản không lộ trong danh sách hồ sơ.
function maskAccountNumber(accountNumber: string): string {
    return `${'•'.repeat(Math.max(accountNumber.length - 4, 0))}${accountNumber.slice(-4)}`;
}

// Render danh sách ngân hàng cùng CRUD và mặc định; mọi thay đổi đi qua query hook để đồng bộ form hoàn tiền.
export function RefundBankAccountCard({ userId }: RefundBankAccountCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] =
        useState<RefundBankAccountProfile | null>(null);
    const [visibleAccountId, setVisibleAccountId] = useState<string | null>(
        null,
    );
    const {
        accounts,
        isLoading,
        isError,
        refetch,
        isSaving,
        isDeleting,
        isSettingDefault,
        deletingAccountId,
        saveAccount,
        deleteAccount,
        setDefaultAccount,
    } = useRefundBankAccounts(userId);

    // Mở form rỗng để tạo tài khoản mới, không mang số tài khoản từ thẻ đang xem sang draft.
    function openCreateDialog(): void {
        setEditingAccount(null);
        setIsDialogOpen(true);
    }

    // Gắn bản ghi được chọn vào dialog để form dùng đúng endpoint cập nhật của tài khoản đó.
    function openEditDialog(account: RefundBankAccountProfile): void {
        setEditingAccount(account);
        setVisibleAccountId(null);
        setIsDialogOpen(true);
    }

    // Lưu bản ghi đang chỉnh sửa hoặc tạo mới; hook ném lỗi để dialog giữ draft nếu API thất bại.
    async function handleSave(
        payload: Parameters<typeof saveAccount>[0],
    ): Promise<void> {
        await saveAccount(payload, editingAccount?.id);
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
                                Lưu nhiều tài khoản và chọn tài khoản mặc định
                            </p>
                        </div>
                    </div>
                    {!isLoading && !isError ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-xl border-zinc-200 px-3.5"
                            onClick={openCreateDialog}
                        >
                            <Plus className="size-4" /> Thêm tài khoản
                        </Button>
                    ) : null}
                </div>

                <div className="p-5 sm:p-6">
                    {isLoading ? (
                        <div className="grid gap-3 lg:grid-cols-2">
                            <Skeleton className="h-40 rounded-xl" />
                            <Skeleton className="h-40 rounded-xl" />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 sm:flex-row sm:items-center">
                            <p className="text-sm text-red-700">
                                Không tải được danh sách tài khoản. Vui lòng thử
                                lại.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 rounded-xl border-red-200 bg-white px-3 text-red-700 hover:bg-red-100"
                                onClick={() => void refetch()}
                            >
                                <RefreshCw className="size-4" /> Thử lại
                            </Button>
                        </div>
                    ) : accounts.length === 0 ? (
                        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-4 sm:flex-row sm:items-center">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-500 shadow-sm">
                                <ShieldCheck className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-zinc-800">
                                    Bạn chưa thêm tài khoản nhận hoàn.
                                </p>
                                <p className="mt-1 text-sm leading-5 text-zinc-500">
                                    Thêm tài khoản để chọn nhanh khi gửi yêu cầu
                                    hoàn tiền.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {accounts.map((account) => {
                                const isAccountVisible =
                                    visibleAccountId === account.id;
                                return (
                                    <article
                                        key={account.id}
                                        className={`min-w-0 rounded-2xl border p-4 shadow-sm ${account.isDefault ? 'border-zinc-950 bg-zinc-50/70' : 'border-zinc-200 bg-white'}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-start gap-3">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                                    <Building2 className="size-5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-zinc-950">
                                                            {account.bankName}
                                                        </h3>
                                                        {account.isDefault ? (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2 py-1 text-xs font-semibold text-white">
                                                                <Check className="size-3" />
                                                                Mặc định
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="mt-1 break-words text-sm text-zinc-600">
                                                        {account.accountHolder}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label="Chỉnh sửa tài khoản"
                                                    onClick={() =>
                                                        openEditDialog(account)
                                                    }
                                                >
                                                    <PencilLine className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label="Xóa tài khoản"
                                                    disabled={isDeleting}
                                                    onClick={() => {
                                                        if (
                                                            visibleAccountId ===
                                                            account.id
                                                        ) {
                                                            setVisibleAccountId(
                                                                null,
                                                            );
                                                        }
                                                        deleteAccount(
                                                            account.id,
                                                        );
                                                    }}
                                                >
                                                    {deletingAccountId ===
                                                    account.id ? (
                                                        <LoaderCircle className="size-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="size-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5">
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-zinc-500">
                                                    Số tài khoản
                                                </p>
                                                <p className="mt-1 break-all font-mono text-sm font-semibold tracking-wide text-zinc-900">
                                                    {isAccountVisible
                                                        ? account.accountNumber
                                                        : maskAccountNumber(
                                                              account.accountNumber,
                                                          )}
                                                </p>
                                            </div>
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
                                                    setVisibleAccountId(
                                                        isAccountVisible
                                                            ? null
                                                            : account.id,
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

                                        {account.isDefault ? (
                                            <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                                                <Star className="size-3.5 fill-current" />
                                                Tài khoản này được chọn sẵn khi
                                                tạo yêu cầu hoàn tiền.
                                            </p>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="mt-2 px-2 text-zinc-700"
                                                disabled={isSettingDefault}
                                                onClick={() =>
                                                    setDefaultAccount(
                                                        account.id,
                                                    )
                                                }
                                            >
                                                <Star className="size-4" /> Đặt
                                                làm mặc định
                                            </Button>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <RefundBankAccountDialog
                account={editingAccount}
                isOpen={isDialogOpen}
                isSaving={isSaving}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
            />
        </>
    );
}
