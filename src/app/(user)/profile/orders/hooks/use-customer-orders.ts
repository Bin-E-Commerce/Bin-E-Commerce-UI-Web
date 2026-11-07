'use client';

// File này quản lý query/mutation của lịch sử đơn hàng Customer và fallback ảnh cho dữ liệu order cũ.

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    cancelOrder,
    getOrder,
    listOrders,
    updateCancellationDetails,
    type CustomerOrderListItem,
    type CustomerOrderFilter,
    type CancelOrderInput,
} from '@/services/order';
import { authService } from '@/services/auth';
import { useOrderProductImages } from '@/hooks/orders/use-order-product-images';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { getRefundBankAccountsQueryKey } from '../../hooks/useRefundBankAccount';

// Lưu hồ sơ sau khi đơn đã được cập nhật; lỗi hồ sơ không được làm giao diện báo nhầm rằng thao tác order thất bại.
async function syncRefundBankAccountToProfile(
    input: CancelOrderInput,
): Promise<boolean | null> {
    if (!input.refundBankAccount) return null;
    // Tài khoản đã chọn từ danh sách hồ sơ chỉ cần snapshot vào đơn; dữ liệu mới được thêm vào hồ sơ sau khi order commit.
    if (input.savedRefundBankAccountId) return true;

    try {
        await authService.createRefundBankAccount(input.refundBankAccount);
        return true;
    } catch {
        return false;
    }
}

// Query danh sách giữ dữ liệu trang trước trong lúc chuyển trang để giao diện không bị nhấp nháy.
export function useCustomerOrders(
    filter: CustomerOrderFilter,
    page: number,
    enabled = true,
) {
    return useQuery({
        queryKey: [
            'customer-orders',
            filter.status ?? 'ALL_STATUS',
            filter.stage ?? 'ALL_STAGES',
            page,
        ],
        queryFn: () => listOrders({ ...filter, page, pageSize: 10 }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        enabled,
    });
}

// Lấy ảnh hiện tại của product chỉ cho preview item thiếu ảnh snapshot, giúp các đơn cũ vẫn có ảnh hiển thị.
// Query này không ghi ngược vào order và không thay thế snapshot của đơn mới; mỗi product chỉ được gọi một lần.
export function useLegacyOrderPreviewImages(orders: CustomerOrderListItem[]) {
    return useOrderProductImages(
        orders.flatMap((order) => order.previewItems ?? []),
    );
}

// Lấy ảnh hiện tại cho item thiếu snapshot ảnh, dùng chung cho cả danh sách và chi tiết đơn hàng cũ.
// Dữ liệu chỉ phục vụ fallback hiển thị; hook không ghi ngược hoặc làm thay đổi snapshot order.
export function useMissingProductImages(
    items: Array<{ productId: string; imageUrl: string | null }>,
) {
    return useOrderProductImages(items);
}

// Query chi tiết theo orderId và chỉ polling khi shipment hoặc khoản hoàn còn chờ backend chốt trạng thái.
export function useCustomerOrder(orderId: string, enabled = true) {
    return useQuery({
        queryKey: ['customer-order', orderId],
        queryFn: () => getOrder(orderId),
        enabled: Boolean(orderId) && enabled,
        staleTime: 30_000,
        refetchInterval: (query) => {
            const order = query.state.data;
            // Giữ nhịp polling shipment hiện tại để card nhận hàng xuất hiện sau webhook giao thành công.
            if (order?.fulfillmentStatus === 'SHIPPING') return 15_000;
            // Đơn chờ hoàn được làm mới đến khi admin xác nhận; trạng thái cuối dừng polling để tránh request nền.
            if (order?.paymentStatus === 'REFUND_PENDING') return 15_000;
            return false;
        },
    });
}

// Hủy đơn trước, sau đó lưu cùng tài khoản vào hồ sơ; lỗi đồng bộ hồ sơ được báo riêng vì order đã commit.
export function useCancelCustomerOrder(orderId: string) {
    const queryClient = useQueryClient();
    // Cache tài khoản nhận hoàn phải theo chủ tài khoản, cùng key với trang hồ sơ.
    const userId = useAppSelector((state) => state.auth.user?.id ?? '');

    return useMutation({
        mutationFn: async (input: CancelOrderInput) => {
            const order = await cancelOrder(orderId, input);
            const accountSaved = await syncRefundBankAccountToProfile(input);
            return { order, accountSaved };
        },
        onSuccess: async ({ order, accountSaved }, input) => {
            queryClient.setQueryData(['customer-order', orderId], order);
            if (accountSaved && input.refundBankAccount) {
                await queryClient.invalidateQueries({
                    queryKey: getRefundBankAccountsQueryKey(userId),
                });
            }
            await queryClient.invalidateQueries({
                queryKey: ['customer-orders'],
            });
            toast.success('Đã gửi yêu cầu hủy đơn hàng.');
            if (accountSaved === false) {
                toast.error(
                    'Đơn đã hủy nhưng tài khoản chưa được lưu vào hồ sơ. Bạn có thể bấm “Chỉnh sửa thông tin hủy” để lưu lại.',
                );
            }
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

// Cập nhật snapshot lý do/tài khoản của đơn đã hủy và đồng bộ tài khoản mặc định để lần sau được điền sẵn.
export function useUpdateCustomerCancellation(orderId: string) {
    const queryClient = useQueryClient();
    // Đơn và hồ sơ được cập nhật riêng, nhưng cache vẫn phải thuộc đúng user đang đăng nhập.
    const userId = useAppSelector((state) => state.auth.user?.id ?? '');

    return useMutation({
        mutationFn: async (input: CancelOrderInput) => {
            const order = await updateCancellationDetails(orderId, input);
            const accountSaved = await syncRefundBankAccountToProfile(input);
            return { order, accountSaved };
        },
        onSuccess: async ({ order, accountSaved }, input) => {
            queryClient.setQueryData(['customer-order', orderId], order);
            if (accountSaved && input.refundBankAccount) {
                await queryClient.invalidateQueries({
                    queryKey: getRefundBankAccountsQueryKey(userId),
                });
            }
            await queryClient.invalidateQueries({
                queryKey: ['customer-orders'],
            });
            toast.success('Đã cập nhật thông tin hủy đơn.');
            if (accountSaved === false) {
                toast.error(
                    'Thông tin đơn đã cập nhật nhưng chưa lưu được tài khoản vào hồ sơ. Hãy thử lưu lại.',
                );
            }
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}
