// Hợp đồng chỉ chứa số liệu cần để Seller xác nhận phí hoàn trước khi duyệt request.
export interface SellerReturnFinancePreview {
    availableBalance: string;
    currentDebtBalance: string;
    estimatedOutboundShippingFee: string;
    estimatedReturnShippingFee: string;
    estimatedShippingFee: string;
    debtLimit: string;
    shopLocked: boolean;
}
