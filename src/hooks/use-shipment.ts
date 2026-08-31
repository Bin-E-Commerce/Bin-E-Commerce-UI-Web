// Query/mutation shipment dùng chung cho Seller và Customer, không còn action mô phỏng.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    advanceDemoSellerShipment,
    cancelSellerShipment,
    createSellerShipment,
    getCustomerTracking,
    getSellerShipment,
    printSellerShipmentLabel,
    refreshSellerShipment,
} from '@/services/shipping/shipping.api';
import { getErrorMessage } from '@/utils/getErrorMessage';

const shipmentKey = (role: 'seller' | 'customer', orderId: string) => ['shipment', role, orderId] as const;

// Query shipment Seller và chấp nhận 404 là trạng thái chưa tạo vận đơn.
export function useSellerShipment(orderId: string, enabled = true) {
    return useQuery({
        queryKey: shipmentKey('seller', orderId),
        queryFn: () => getSellerShipment(orderId),
        enabled: Boolean(orderId) && enabled,
        staleTime: 10_000,
    });
}

// Customer polling khi còn shipment active, dừng khi đã vào trạng thái kết thúc.
export function useCustomerTracking(orderId: string, enabled = true) {
    return useQuery({
        queryKey: shipmentKey('customer', orderId),
        queryFn: () => getCustomerTracking(orderId),
        enabled: Boolean(orderId) && enabled,
        staleTime: 10_000,
        refetchInterval: (query) => {
            const shipments = query.state.data?.shipments ?? [];
            const active = shipments.some((shipment) => ['READY_TO_SHIP', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'RETURNING'].includes(shipment.status));
            return active ? 15_000 : false;
        },
    });
}

// Dùng chung invalidate/cache/toast cho các thao tác Seller shipment.
function useSellerShipmentMutation<T>(orderId: string, mutationFn: () => Promise<T>, successMessage: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: async (shipment) => {
            queryClient.setQueryData(shipmentKey('seller', orderId), shipment);
            await queryClient.invalidateQueries({ queryKey: ['seller-order-detail', orderId] });
            await queryClient.invalidateQueries({ queryKey: shipmentKey('customer', orderId) });
            toast.success(successMessage);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

// Seller tạo shipment GHN Test sau khi đơn đã sẵn sàng.
export function useCreateSellerShipment(orderId: string) {
    return useSellerShipmentMutation(orderId, () => createSellerShipment(orderId), 'Shop đã chuẩn bị hàng và tạo vận đơn thành công.');
}

// Seller làm mới trạng thái từ GHN, không tự đẩy trạng thái.
export function useRefreshSellerShipment(orderId: string) {
    return useSellerShipmentMutation(orderId, () => refreshSellerShipment(orderId), 'Đã làm mới trạng thái vận chuyển.');
}

// Seller hủy shipment theo điều kiện GHN cho phép.
export function useCancelSellerShipment(orderId: string) {
    return useSellerShipmentMutation(orderId, () => cancelSellerShipment(orderId), 'Đã hủy vận đơn.');
}

// Seller bỏ qua một chặng demo và cập nhật lại timeline/map từ response backend.
export function useAdvanceDemoSellerShipment(orderId: string) {
    return useSellerShipmentMutation(orderId, () => advanceDemoSellerShipment(orderId), 'Đã chuyển sang chặng tiếp theo.');
}

// Tải nhãn GHN và chọn đúng đuôi file theo content type server trả về.
export function usePrintSellerShipmentLabel(orderId: string) {
    return useMutation({
        mutationFn: () => printSellerShipmentLabel(orderId),
        onSuccess: (blob) => {
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            const extension = blob.type.toLowerCase().includes('html') ? 'html' : 'pdf';
            anchor.download = `ghn-${orderId}.${extension}`;
            anchor.click();
            URL.revokeObjectURL(url);
            toast.success(extension === 'html' ? 'Đã tải nhãn vận đơn. Mở file HTML để in.' : 'Đã tải nhãn vận đơn.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}
