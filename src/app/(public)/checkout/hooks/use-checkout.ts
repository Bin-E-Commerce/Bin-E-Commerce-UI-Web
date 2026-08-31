// Hook quản lý địa chỉ, quote và tạo đơn COD của checkout.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService, type CreateAddressPayload, type UserAddress } from '@/services/auth';
import { createCodOrder, getOrderQuote } from '@/services/order/order.api';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { CreateCodOrderInput, OrderResponse } from '../types/checkout.types';

// Gom data flow checkout để component chỉ tập trung vào hiển thị và thao tác người dùng.
export function useCheckout() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const initialized = useAppSelector((state) => state.auth.initialized);
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const isAuthenticated = Boolean(initialized && accessToken && userId);
    const addressQueryKey = ['checkout-addresses', userId ?? 'anonymous'];
    const addressesQuery = useQuery<UserAddress[]>({ queryKey: addressQueryKey, queryFn: async () => (await authService.getAddresses()).data, enabled: isAuthenticated, staleTime: 60_000 });
    const createAddressMutation = useMutation({
        mutationFn: async (payload: CreateAddressPayload) => (await authService.createAddress(payload)).data,
        onSuccess: async (address) => { queryClient.setQueryData<UserAddress[]>(addressQueryKey, (addresses = []) => [...addresses, address]); await queryClient.invalidateQueries({ queryKey: addressQueryKey }); toast.success('Đã thêm địa chỉ giao hàng.'); },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    // Cập nhật địa chỉ ngay trong checkout và đồng bộ cache để card đang chọn hiển thị dữ liệu mới lập tức.
    const updateAddressMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string; payload: CreateAddressPayload }) =>
            (await authService.updateAddress(id, payload)).data,
        onSuccess: async (address) => {
            queryClient.setQueryData<UserAddress[]>(addressQueryKey, (addresses = []) =>
                addresses.map((item) => (item.id === address.id ? address : item)),
            );
            await queryClient.invalidateQueries({ queryKey: addressQueryKey });
            toast.success('Đã cập nhật địa chỉ giao hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    // Xóa địa chỉ qua Auth Service; checkout chỉ cập nhật lựa chọn sau khi server xác nhận xóa thành công.
    const deleteAddressMutation = useMutation({
        mutationFn: async (id: string) => (await authService.deleteAddress(id)).data,
        onSuccess: async (_result, deletedAddressId) => {
            queryClient.setQueryData<UserAddress[]>(addressQueryKey, (addresses = []) =>
                addresses.filter((address) => address.id !== deletedAddressId),
            );
            await queryClient.invalidateQueries({ queryKey: addressQueryKey });
            toast.success('Đã xóa địa chỉ giao hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const orderMutation = useMutation<OrderResponse, unknown, Omit<CreateCodOrderInput, 'idempotencyKey'>>({
        mutationFn: (input) => createCodOrder({ ...input, idempotencyKey: crypto.randomUUID() }),
        onSuccess: async (order) => { await queryClient.invalidateQueries({ queryKey: ['cart', userId ?? 'anonymous'] }); if (order.warnings.length > 0) toast.warning(order.warnings[0]); else toast.success('Đặt hàng COD thành công.'); },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    return {
        addressesQuery,
        createAddressMutation,
        updateAddressMutation,
        deleteAddressMutation,
        orderMutation,
        isAuthenticated,
    };
}

// Tính quote theo địa chỉ GHN đã lưu trong Auth Service.
export function useCheckoutQuote(shippingAddressId: string) {
    return useQuery({ queryKey: ['checkout-quote', shippingAddressId], queryFn: () => getOrderQuote(shippingAddressId), enabled: Boolean(shippingAddressId), staleTime: 20_000, refetchOnWindowFocus: false });
}
