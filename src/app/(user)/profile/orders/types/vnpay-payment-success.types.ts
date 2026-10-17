// Kiểu dữ liệu chỉ phục vụ popup kết quả; không thay thế trạng thái thanh toán authoritative từ backend.

// Chi tiết được đọc từ callback đã được backend xác minh thành PAID, trường thiếu thì ẩn khỏi giao diện.
export interface VnpayPaymentSuccessDetails {
    orderId: string;
    amount?: number;
    orderNumber?: string;
    transactionNumber?: string;
}

// Hợp đồng tối thiểu để dialog chỉ hiển thị thông tin và trả quyền đóng về page sở hữu trạng thái.
export interface VnpayPaymentSuccessDialogProps {
    payment: VnpayPaymentSuccessDetails | null;
    onClose: () => void;
}
