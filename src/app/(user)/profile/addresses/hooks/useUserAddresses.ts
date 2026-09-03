// Hook điều phối query và mutation cho danh sách địa chỉ của Customer hiện tại.
// Hook sở hữu cache đồng bộ với checkout nhưng không chịu trách nhiệm render layout hoặc form field.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    authService,
    getUserAddressesQueryKey,
    type CreateAddressPayload,
    type UserAddress,
} from '@/services/auth';
import { toAddressPayload } from '../utils/address-payload';

interface SaveAddressVariables {
    payload: CreateAddressPayload;
    addressId?: string;
}

// Cung cấp một boundary duy nhất cho đọc, ghi, xóa và đổi địa chỉ mặc định.
// Sau mỗi mutation, cache được cập nhật ngay rồi invalidate để checkout và profile cùng nhận dữ liệu từ server.
// User ID nằm trong query key nhằm ngăn cache của tài khoản trước bị dùng cho tài khoản đăng nhập sau.
export function useUserAddresses(userId: string | null) {
    const queryClient = useQueryClient();
    const queryKey = getUserAddressesQueryKey(userId);

    const addressesQuery = useQuery({
        queryKey,
        queryFn: async () => (await authService.getAddresses()).data,
        enabled: Boolean(userId),
        staleTime: 60_000,
    });

    const saveMutation = useMutation({
        mutationFn: ({ payload, addressId }: SaveAddressVariables) =>
            addressId
                ? authService.updateAddress(addressId, payload)
                : authService.createAddress(payload),
        onSuccess: async (response, variables) => {
            queryClient.setQueryData<UserAddress[]>(
                queryKey,
                (addresses = []) =>
                    variables.addressId
                        ? addresses.map((address) =>
                              address.id === response.data.id
                                  ? response.data
                                  : address,
                          )
                        : [...addresses, response.data],
            );
            await queryClient.invalidateQueries({ queryKey });
            toast.success('Đã lưu địa chỉ.');
        },
        onError: () => {
            toast.error('Không thể lưu địa chỉ.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (addressId: string) => authService.deleteAddress(addressId),
        onSuccess: async (_response, deletedAddressId) => {
            queryClient.setQueryData<UserAddress[]>(
                queryKey,
                (addresses = []) =>
                    addresses.filter(
                        (address) => address.id !== deletedAddressId,
                    ),
            );
            await queryClient.invalidateQueries({ queryKey });
            toast.success('Đã xóa địa chỉ.');
        },
        onError: () => {
            toast.error('Không thể xóa địa chỉ.');
        },
    });

    const defaultMutation = useMutation({
        mutationFn: async (address: UserAddress) => {
            const payload = toAddressPayload(address);
            if (!payload) {
                throw new Error('Địa chỉ chưa đủ mã GHN.');
            }

            return authService.updateAddress(address.id, {
                ...payload,
                isDefault: true,
            });
        },
        onSuccess: async (response) => {
            queryClient.setQueryData<UserAddress[]>(
                queryKey,
                (addresses = []) =>
                    addresses.map((address) =>
                        address.id === response.data.id
                            ? response.data
                            : { ...address, isDefault: false },
                    ),
            );
            await queryClient.invalidateQueries({ queryKey });
            toast.success('Đã đổi địa chỉ mặc định.');
        },
        onError: () => {
            toast.error('Không thể đổi địa chỉ mặc định.');
        },
    });

    // Bọc mutateAsync để form nhận được kết quả boolean và tự quyết định có reset/đóng hay không.
    async function saveAddress(
        payload: CreateAddressPayload,
        addressId?: string,
    ): Promise<boolean> {
        try {
            await saveMutation.mutateAsync({ payload, addressId });
            return true;
        } catch {
            return false;
        }
    }

    return {
        addresses: addressesQuery.data ?? [],
        addressesQuery,
        deleteAddress: (addressId: string) => deleteMutation.mutate(addressId),
        deletingAddressId: deleteMutation.isPending
            ? deleteMutation.variables
            : undefined,
        isSaving: saveMutation.isPending,
        saveAddress,
        setDefaultAddress: (address: UserAddress) =>
            defaultMutation.mutate(address),
    };
}
