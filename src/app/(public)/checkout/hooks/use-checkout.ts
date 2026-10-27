// Hook quản lý địa chỉ, quote và tạo đơn COD của checkout.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    authService,
    getUserAddressesQueryKey,
    toAddressPayload,
    type CreateAddressPayload,
    type UserAddress,
} from '@/services/auth';
import { createCodOrder, getOrderQuote } from '@/services/order';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type {
    CheckoutOrderMutationInput,
    OrderResponse,
} from '../types/checkout.types';
import { getCheckoutIdempotencyKey } from '../utils/checkout-idempotency';

// Gom data flow checkout để component chỉ tập trung vào hiển thị và thao tác người dùng.
export function useCheckout() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const initialized = useAppSelector((state) => state.auth.initialized);
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const isAuthenticated = Boolean(initialized && accessToken && userId);
    const addressQueryKey = getUserAddressesQueryKey(userId);
    const addressesQuery = useQuery<UserAddress[]>({
        queryKey: addressQueryKey,
        queryFn: async () => (await authService.getAddresses()).data,
        enabled: isAuthenticated,
        staleTime: 60_000,
    });
    const createAddressMutation = useMutation({
        mutationFn: async (payload: CreateAddressPayload) =>
            (await authService.createAddress(payload)).data,
        onSuccess: async (address) => {
            queryClient.setQueryData<UserAddress[]>(
                addressQueryKey,
                (addresses = []) => [...addresses, address],
            );
            await queryClient.invalidateQueries({ queryKey: addressQueryKey });
            toast.success('Đã thêm địa chỉ giao hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    // Cập nhật địa chỉ ngay trong checkout và đồng bộ cache để card đang chọn hiển thị dữ liệu mới lập tức.
    const updateAddressMutation = useMutation({
        mutationFn: async ({
            id,
            payload,
        }: {
            id: string;
            payload: CreateAddressPayload;
        }) => (await authService.updateAddress(id, payload)).data,
        onSuccess: async (address) => {
            queryClient.setQueryData<UserAddress[]>(
                addressQueryKey,
                (addresses = []) =>
                    addresses.map((item) =>
                        item.id === address.id ? address : item,
                    ),
            );
            await queryClient.invalidateQueries({ queryKey: addressQueryKey });
            toast.success('Đã cập nhật địa chỉ giao hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    // Xóa địa chỉ qua Auth Service; checkout chỉ cập nhật lựa chọn sau khi server xác nhận xóa thành công.
    const deleteAddressMutation = useMutation({
        mutationFn: async (id: string) =>
            (await authService.deleteAddress(id)).data,
        onSuccess: async (_result, deletedAddressId) => {
            queryClient.setQueryData<UserAddress[]>(
                addressQueryKey,
                (addresses = []) =>
                    addresses.filter(
                        (address) => address.id !== deletedAddressId,
                    ),
            );
            await queryClient.invalidateQueries({ queryKey: addressQueryKey });
            toast.success('Đã xóa địa chỉ giao hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    // Đặt địa chỉ mặc định ngay tại checkout để lần sau tự chọn đúng địa chỉ.
    // Gửi lại snapshot đầy đủ giúp Auth Service giữ nguyên mã GHN; địa chỉ legacy thiếu mã sẽ bị từ chối trước khi gọi API.
    const setDefaultAddressMutation = useMutation({
        mutationFn: async (address: UserAddress) => {
            const payload = toAddressPayload(address);
            if (!payload) {
                throw new Error('Địa chỉ chưa đủ mã GHN.');
            }

            return (
                await authService.updateAddress(address.id, {
                    ...payload,
                    isDefault: true,
                })
            ).data;
        },
        onSuccess: async (address) => {
            // Cập nhật optimistic theo kết quả server để card hiện đúng duy nhất một địa chỉ mặc định.
            queryClient.setQueryData<UserAddress[]>(
                addressQueryKey,
                (addresses = []) =>
                    addresses.map((item) =>
                        item.id === address.id
                            ? address
                            : { ...item, isDefault: false },
                    ),
            );
            await queryClient.invalidateQueries({ queryKey: addressQueryKey });
            toast.success('Đã đổi địa chỉ mặc định.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    const orderMutation = useMutation<
        OrderResponse,
        unknown,
        CheckoutOrderMutationInput
    >({
        mutationFn: ({ order, cartFingerprint }) => {
            if (!userId) throw new Error('Phiên đăng nhập đã hết hạn.');

            // Retry hoặc reload trong cùng checkout phải gửi lại key; tạo key mới ở đây sẽ biến retry thành đơn mới.
            const idempotencyKey = getCheckoutIdempotencyKey(userId, {
                order,
                cartFingerprint,
            });
            return createCodOrder({ ...order, idempotencyKey });
        },
        onSuccess: async (order) => {
            await queryClient.invalidateQueries({
                queryKey: ['cart', userId ?? 'anonymous'],
            });
            if (order.warnings.length > 0) toast.warning(order.warnings[0]);
            else
                toast.success(
                    order.paymentMethod === 'COD'
                        ? 'Đặt hàng COD thành công.'
                        : 'Đã tạo đơn, đang chờ thanh toán Pay2S.',
                );
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
    return {
        addressesQuery,
        createAddressMutation,
        updateAddressMutation,
        deleteAddressMutation,
        setDefaultAddressMutation,
        orderMutation,
        isAuthenticated,
    };
}

// Tính quote theo địa chỉ GHN đã lưu trong Auth Service.
// Tính quote theo địa chỉ và tùy chọn item Mua ngay; bỏ cartItemId sẽ giữ nguyên checkout toàn bộ giỏ.
export function useCheckoutQuote(
    shippingAddressId: string,
    cartItemId?: string,
    paymentMethod: 'COD' | 'PAY2S' = 'COD',
) {
    return useQuery({
        queryKey: [
            'checkout-quote',
            shippingAddressId,
            cartItemId ?? 'cart',
            paymentMethod,
        ],
        queryFn: () =>
            getOrderQuote(shippingAddressId, cartItemId, paymentMethod),
        enabled: Boolean(shippingAddressId),
        staleTime: 20_000,
        refetchOnWindowFocus: false,
    });
}
