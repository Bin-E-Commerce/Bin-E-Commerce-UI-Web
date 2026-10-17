// Hợp đồng đầu vào của mục lục điều hướng; component chỉ trình bày và cuộn tới phần đơn hàng.
export type OrderDetailSectionNavProps = {
    itemCount: number;
    paymentLabel: string;
    showDeliveryConfirmation: boolean;
    showReview: boolean;
    showReturns: boolean;
};
