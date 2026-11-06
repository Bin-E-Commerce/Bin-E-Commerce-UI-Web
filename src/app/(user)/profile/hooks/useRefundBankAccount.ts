// Hook sở hữu query, cache và mutation của danh sách tài khoản nhận hoàn trong hồ sơ Customer.
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    authService,
    type RefundBankAccountPayload,
    type RefundBankAccountProfile,
} from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { SaveRefundBankAccountVariables } from '../types/refund-bank-account.type';

// Đưa userId vào key để dữ liệu ngân hàng không được dùng lại giữa hai tài khoản trên cùng trình duyệt.
export function getRefundBankAccountsQueryKey(userId: string) {
    return ['profile-refund-bank-accounts', userId] as const;
}

// Tải danh sách riêng tư và đồng bộ các thao tác CRUD về cache dùng chung với form hủy đơn.
export function useRefundBankAccounts(userId: string) {
    const queryClient = useQueryClient();
    const queryKey = getRefundBankAccountsQueryKey(userId);
    const query = useQuery({
        queryKey,
        queryFn: async () => (await authService.getRefundBankAccounts()).data,
        enabled: Boolean(userId),
        staleTime: 30_000,
        gcTime: 30_000,
    });

    const saveMutation = useMutation({
        mutationFn: ({ payload, accountId }: SaveRefundBankAccountVariables) =>
            accountId
                ? authService.updateRefundBankAccount(accountId, payload)
                : authService.createRefundBankAccount(payload),
        onSuccess: async (response, variables) => {
            queryClient.setQueryData<RefundBankAccountProfile[]>(
                queryKey,
                (accounts = []) =>
                    variables.accountId
                        ? accounts.map((account) =>
                              account.id === response.data.id
                                  ? response.data
                                  : account,
                          )
                        : [...accounts, response.data],
            );
            await queryClient.invalidateQueries({ queryKey });
            toast.success('Đã lưu tài khoản nhận hoàn.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const deleteMutation = useMutation({
        mutationFn: (accountId: string) =>
            authService.deleteRefundBankAccount(accountId),
        onSuccess: async (_response, deletedAccountId) => {
            queryClient.setQueryData<RefundBankAccountProfile[]>(
                queryKey,
                (accounts = []) =>
                    accounts.filter(
                        (account) => account.id !== deletedAccountId,
                    ),
            );
            await queryClient.invalidateQueries({ queryKey });
            toast.success('Đã xóa tài khoản ngân hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const defaultMutation = useMutation({
        mutationFn: (accountId: string) =>
            authService.setDefaultRefundBankAccount(accountId),
        onSuccess: async (response) => {
            queryClient.setQueryData<RefundBankAccountProfile[]>(
                queryKey,
                (accounts = []) =>
                    accounts.map((account) =>
                        account.id === response.data.id
                            ? response.data
                            : { ...account, isDefault: false },
                    ),
            );
            await queryClient.invalidateQueries({ queryKey });
            toast.success('Đã đổi tài khoản nhận hoàn mặc định.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    // Chuyển lỗi mutation về caller để dialog chỉ đóng khi server đã lưu thành công.
    async function saveAccount(
        payload: RefundBankAccountPayload,
        accountId?: string,
    ): Promise<void> {
        await saveMutation.mutateAsync({ payload, accountId });
    }

    return {
        accounts: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
        isSaving: saveMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isSettingDefault: defaultMutation.isPending,
        deletingAccountId: deleteMutation.isPending
            ? deleteMutation.variables
            : undefined,
        saveAccount,
        deleteAccount: (accountId: string) => deleteMutation.mutate(accountId),
        setDefaultAccount: (accountId: string) =>
            defaultMutation.mutate(accountId),
    };
}

// Chia sẻ cùng cache/user boundary với trang profile và tải account list khi dialog hoàn tiền được mở.
export function useSavedRefundBankAccounts(enabled: boolean, userId: string) {
    return useQuery({
        queryKey: getRefundBankAccountsQueryKey(userId || 'anonymous'),
        queryFn: async () => (await authService.getRefundBankAccounts()).data,
        enabled: Boolean(userId) && enabled,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}
