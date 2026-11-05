// Hook sở hữu truy vấn và cập nhật tài khoản nhận hoàn trong hồ sơ Customer.
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authService, type RefundBankAccountProfile } from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Đưa userId vào key để tránh tái sử dụng dữ liệu ngân hàng giữa hai phiên tài khoản trên cùng trình duyệt.
export function getRefundBankAccountQueryKey(userId: string) {
    return ['profile-refund-bank-account', userId] as const;
}

// Chỉ truy vấn khi đã có userId; dữ liệu nhạy cảm được giữ trong cache thời gian ngắn và không lưu vào Redux.
export function useRefundBankAccount(userId: string) {
    const queryClient = useQueryClient();
    const queryKey = getRefundBankAccountQueryKey(userId);
    const query = useQuery({
        queryKey,
        queryFn: async () => (await authService.getRefundBankAccount()).data,
        enabled: Boolean(userId),
        staleTime: 30_000,
        gcTime: 30_000,
    });
    const mutation = useMutation({
        mutationFn: (payload: RefundBankAccountProfile) =>
            authService.updateRefundBankAccount(payload),
        // Ghi đè cache theo đúng chủ tài khoản để trang hồ sơ và luồng hủy đơn cùng thấy dữ liệu mới nhất.
        onSuccess: (response) => {
            queryClient.setQueryData(queryKey, response.data);
            toast.success('Đã lưu tài khoản nhận hoàn.');
        },
        // Giữ dialog mở để người dùng sửa hoặc gửi lại khi API từ chối dữ liệu.
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    return {
        account: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
        isSaving: mutation.isPending,
        saveAccount: mutation.mutateAsync,
    };
}

// Tải hồ sơ trong dialog hủy đơn bằng cùng cache/user boundary với trang profile.
export function useSavedRefundBankAccount(enabled: boolean, userId: string) {
    return useQuery({
        queryKey: getRefundBankAccountQueryKey(userId || 'anonymous'),
        queryFn: async () => (await authService.getRefundBankAccount()).data,
        enabled: Boolean(userId) && enabled,
        staleTime: 30_000,
        gcTime: 30_000,
    });
}
