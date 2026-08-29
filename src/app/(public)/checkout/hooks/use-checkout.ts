// Hook này gom query địa chỉ, mutation tạo đơn và cache invalidation của checkout.
// Không optimistic update vì giá/tồn kho chỉ có ý nghĩa sau khi Order Service xác nhận.
// Mutation tự sinh idempotency key cho mỗi lần người dùng chủ động submit và khóa nút khi đang xử lý.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authService } from '@/services/auth';
import { createCodOrder } from '@/services/order/order.api';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { CreateAddressPayload, UserAddress } from '@/services/auth';
import type { CreateCodOrderInput, OrderResponse } from '../types/checkout.types';

// Quản lý toàn bộ data flow của checkout để component chỉ tập trung vào bố cục và thao tác người dùng.
export function useCheckout() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const initialized = useAppSelector((state) => state.auth.initialized);
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const isAuthenticated = Boolean(initialized && accessToken && userId);
    const addressQueryKey = ['checkout-addresses', userId ?? 'anonymous'];

    const addressesQuery = useQuery<UserAddress[]>({
        queryKey: addressQueryKey,
        queryFn: async () => (await authService.getAddresses()).data,
        enabled: isAuthenticated,
        staleTime: 60_000,
    });

    const createAddressMutation = useMutation({
        mutationFn: async (payload: CreateAddressPayload) => (await authService.createAddress(payload)).data,
        onSuccess: async (address) => {
            queryClient.setQueryData<UserAddress[]>(addressQueryKey, (addresses = []) => [...addresses, address]);
            await queryClient.invalidateQueries({ queryKey: addressQueryKey });
            toast.success('Đã thêm địa chỉ giao hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    const orderMutation = useMutation<OrderResponse, unknown, Omit<CreateCodOrderInput, 'idempotencyKey'>>({
        mutationFn: (input) => createCodOrder({ ...input, idempotencyKey: crypto.randomUUID() }),
        onSuccess: async (order) => {
            await queryClient.invalidateQueries({ queryKey: ['cart', userId ?? 'anonymous'] });
            if (order.warnings.length > 0) toast.warning(order.warnings[0]);
            else toast.success('Đặt hàng COD thành công.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });

    return {
        addressesQuery,
        createAddressMutation,
        orderMutation,
        isAuthenticated,
    };
}
