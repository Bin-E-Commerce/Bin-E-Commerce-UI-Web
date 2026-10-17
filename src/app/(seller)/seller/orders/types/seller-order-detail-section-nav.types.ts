// File này định nghĩa dữ liệu đầu vào của mục lục trang chi tiết đơn Seller.
// Component điều hướng chỉ nhận trạng thái hiển thị, không sở hữu dữ liệu đơn hàng.

export interface SellerOrderDetailSectionNavProps {
    itemCount: number;
    paymentLabel: string;
    showShipment: boolean;
    showReview: boolean;
    showReturns: boolean;
}
