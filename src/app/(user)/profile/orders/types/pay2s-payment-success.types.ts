// Kiểu dữ liệu cho biên nhận Pay2S; không thay thế trạng thái thanh toán authoritative từ backend.

// Chi tiết chỉ được hiển thị sau khi backend xác minh callback thành PAID.
export interface Pay2sPaymentSuccessDetails {
    orderId: string;
    amount?: number;
    orderNumber?: string;
    transactionNumber?: string;
}

// Hợp đồng để dialog hiển thị biên nhận và trả thao tác đóng về page sở hữu state.
export interface Pay2sPaymentSuccessDialogProps {
    payment: Pay2sPaymentSuccessDetails | null;
    onClose: () => void;
}
