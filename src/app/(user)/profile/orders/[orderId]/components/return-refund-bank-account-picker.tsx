// Thành phần chọn tài khoản nhận hoàn đã xác minh trong Auth Service.
// Chỉ gửi account ID cho Order API; thông tin đầy đủ được Order đọc lại từ Auth và chụp snapshot phía server.
'use client';

import { useEffect, useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    BadgeCheck,
    Building2,
    Check,
    LoaderCircle,
    Pencil,
    Plus,
    Star,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { authService } from '@/services/auth';
import type {
    RefundBankAccountPayload,
    RefundBankAccountProfile,
} from '@/services/auth';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { RefundBankAccountDialog } from '@/app/(user)/profile/components/RefundBankAccountDialog';
import {
    getRefundBankAccountsQueryKey,
    useSavedRefundBankAccounts,
} from '@/app/(user)/profile/hooks/useRefundBankAccount';
import type { ReturnRefundBankAccountPickerProps } from '../types/returns/return-refund-bank-account-picker.type';

const EMPTY_REFUND_BANK_ACCOUNTS: RefundBankAccountProfile[] = [];

// Chọn hồ sơ ngân hàng đã lưu hoặc mở dialog tạo/sửa; component chỉ gửi account ID cho luồng hoàn tiền.
// Account mặc định được chọn sau khi dữ liệu tải xong, còn số tài khoản đầy đủ chỉ xuất hiện trong màn quản lý hồ sơ.
// Menu dùng chung Select của design system, mỗi dòng giữ rõ tên ngân hàng, chủ tài khoản, số đuôi và trạng thái mặc định.
export function ReturnRefundBankAccountPicker({
    selectedAccountId,
    onAccountChange,
}: ReturnRefundBankAccountPickerProps) {
    const userId = useAppSelector((state) => state.auth.user?.id ?? '');
    const accountFieldId = `return-refund-bank-account-${useId()}`;
    const queryClient = useQueryClient();
    const accountsQuery = useSavedRefundBankAccounts(true, userId);
    const accounts = accountsQuery.data ?? EMPTY_REFUND_BANK_ACCOUNTS;
    const selectedAccount = accounts.find(
        (account) => account.id === selectedAccountId,
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] =
        useState<RefundBankAccountProfile | null>(null);

    // Chọn mặc định chỉ sau khi danh sách tải xong; ID không tồn tại được thay bằng tài khoản hợp lệ đầu tiên.
    useEffect(() => {
        if (accountsQuery.isLoading) return;
        if (accounts.length === 0) {
            if (selectedAccountId) onAccountChange('');
            return;
        }
        if (!accounts.some((account) => account.id === selectedAccountId)) {
            onAccountChange(
                accounts.find((account) => account.isDefault)?.id ??
                    accounts[0].id,
            );
        }
    }, [accounts, accountsQuery.isLoading, onAccountChange, selectedAccountId]);

    // Tạo hoặc cập nhật hồ sơ qua Auth rồi chọn ID mà server vừa lưu thành công.
    const saveMutation = useMutation({
        mutationFn: (payload: RefundBankAccountPayload) =>
            editingAccount
                ? authService.updateRefundBankAccount(
                      editingAccount.id,
                      payload,
                  )
                : authService.createRefundBankAccount(payload),
        onSuccess: async (response) => {
            // Ghi ngay response vào cache trước khi chọn ID mới để effect không quay lại tài khoản cũ trong lúc refetch.
            queryClient.setQueryData<RefundBankAccountProfile[]>(
                getRefundBankAccountsQueryKey(userId),
                (current = []) =>
                    editingAccount
                        ? current.map((account) =>
                              account.id === response.data.id
                                  ? response.data
                                  : account,
                          )
                        : [...current, response.data],
            );
            onAccountChange(response.data.id);
            await queryClient.invalidateQueries({
                queryKey: getRefundBankAccountsQueryKey(userId),
            });
            toast.success('Đã lưu và chọn tài khoản nhận hoàn.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    // Giữ dialog mở khi API lỗi để khách có thể sửa dữ liệu mà không nhập lại từ đầu.
    async function saveAccount(
        payload: RefundBankAccountPayload,
    ): Promise<void> {
        await saveMutation.mutateAsync(payload);
    }

    // Mở form mới với draft sạch; account null khiến dialog không điền dữ liệu cũ.
    function addAccount(): void {
        setEditingAccount(null);
        setDialogOpen(true);
    }

    // Chỉ cho sửa hồ sơ đang chọn để nội dung đơn và lựa chọn trên màn hình không lệch nhau.
    function editSelectedAccount(): void {
        if (!selectedAccount) return;
        setEditingAccount(selectedAccount);
        setDialogOpen(true);
    }

    return (
        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 sm:p-5">
            <div className="space-y-1">
                <Label htmlFor={accountFieldId}>Tài khoản nhận tiền hoàn</Label>
                <p
                    id={`${accountFieldId}-help`}
                    className="text-xs leading-5 text-zinc-500"
                >
                    Chọn tài khoản đã lưu hoặc thêm tài khoản mới trước khi gửi
                    yêu cầu.
                </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <Select
                    value={selectedAccountId || null}
                    onValueChange={(value) => onAccountChange(value ?? '')}
                    disabled={accountsQuery.isLoading || accounts.length === 0}
                >
                    <SelectTrigger
                        id={accountFieldId}
                        className="h-16 min-h-16 min-w-0 w-full rounded-2xl border-zinc-200 bg-white py-2 pl-3 pr-3 shadow-sm transition-[border-color,box-shadow] hover:border-zinc-400 hover:shadow-md focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-900/10 data-[size=default]:h-16"
                        aria-describedby={`${accountFieldId}-help`}
                    >
                        <SelectValue
                            className="min-w-0 items-center"
                            placeholder="Chọn tài khoản nhận hoàn"
                        >
                            {selectedAccount ? (
                                <span className="flex min-w-0 flex-1 items-center gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                                        <Building2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="truncate text-sm font-semibold text-zinc-950">
                                                {selectedAccount.bankName}
                                            </span>
                                            {selectedAccount.isDefault ? (
                                                <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
                                                    <Star className="size-3 fill-current" />
                                                    Mặc định
                                                </span>
                                            ) : null}
                                        </span>
                                        <span className="truncate text-xs text-zinc-500">
                                            {selectedAccount.accountHolder}
                                        </span>
                                    </span>
                                    <span className="shrink-0 rounded-lg bg-zinc-100 px-2.5 py-1.5 font-mono text-xs font-semibold tracking-wide text-zinc-700">
                                        ••••{' '}
                                        {selectedAccount.accountNumber.slice(
                                            -4,
                                        )}
                                    </span>
                                </span>
                            ) : (
                                <span className="text-sm text-zinc-500">
                                    Chọn tài khoản nhận hoàn
                                </span>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-zinc-200 p-1.5 shadow-xl">
                        {accounts.map((account) => (
                            <SelectItem
                                key={account.id}
                                value={account.id}
                                className="min-h-[68px] items-center rounded-xl px-3 py-2.5 pr-10 transition-colors focus:bg-zinc-50 focus:text-zinc-950"
                            >
                                <span className="flex w-full min-w-0 items-center gap-3 whitespace-normal">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm">
                                        <Building2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                                        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="truncate text-sm font-semibold text-zinc-900">
                                                {account.bankName}
                                            </span>
                                            {account.isDefault ? (
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                                    <Star className="size-3 fill-current" />
                                                    Mặc định
                                                </span>
                                            ) : null}
                                        </span>
                                        <span className="truncate text-xs font-normal text-zinc-500">
                                            {account.accountHolder}
                                        </span>
                                    </span>
                                    <span className="shrink-0 rounded-lg bg-zinc-100 px-2 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-zinc-700">
                                        •••• {account.accountNumber.slice(-4)}
                                    </span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    type="button"
                    variant="outline"
                    className="h-full min-h-16 w-full shrink-0 self-stretch rounded-2xl border-zinc-300 bg-white px-4 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-100 sm:w-auto"
                    onClick={addAccount}
                >
                    <Plus className="size-4" aria-hidden="true" />
                    Thêm tài khoản
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="h-full min-h-16 w-full shrink-0 self-stretch rounded-2xl border-zinc-300 bg-white px-4 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-100 sm:w-auto"
                    onClick={editSelectedAccount}
                    disabled={!selectedAccount}
                >
                    <Pencil className="size-4" aria-hidden="true" />
                    Sửa tài khoản
                </Button>
            </div>

            {accountsQuery.isLoading ? (
                <p className="flex items-center gap-2 text-xs text-zinc-500">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Đang tải tài khoản đã lưu...
                </p>
            ) : null}
            {accountsQuery.isError ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-red-700">
                    <span>Không tải được tài khoản nhận hoàn.</span>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-lg"
                        onClick={() => void accountsQuery.refetch()}
                    >
                        Thử tải lại
                    </Button>
                </div>
            ) : null}
            {selectedAccount ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white px-3 py-2.5 text-xs text-emerald-900 shadow-sm">
                    <BadgeCheck
                        className="size-4 shrink-0"
                        aria-hidden="true"
                    />
                    <span className="min-w-0">
                        Sẽ hoàn đến {selectedAccount.bankName}, chủ tài khoản{' '}
                        <strong>{selectedAccount.accountHolder}</strong>, số
                        đuôi{' '}
                        <strong>
                            {selectedAccount.accountNumber.slice(-4)}
                        </strong>
                        .
                    </span>
                    <Check
                        className="ml-auto size-4 shrink-0 text-emerald-700"
                        aria-hidden="true"
                    />
                </div>
            ) : null}
            <p id={`${accountFieldId}-help`} className="text-xs text-zinc-500">
                Thông tin được lưu cùng yêu cầu để Admin chuyển hoàn đúng tài
                khoản, kể cả khi bạn cập nhật hồ sơ sau đó.
            </p>

            <RefundBankAccountDialog
                account={editingAccount}
                isOpen={dialogOpen}
                isSaving={saveMutation.isPending}
                onOpenChange={setDialogOpen}
                onSave={saveAccount}
            />
        </section>
    );
}
