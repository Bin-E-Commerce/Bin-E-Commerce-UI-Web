// Các kiểu trình bày insight được suy ra từ payload API có discriminant.
// Frontend chỉ dùng chúng để type-narrow; định nghĩa dữ liệu chuẩn vẫn thuộc seller service.
import type { SellerCopilotInsight } from '@/services/seller/types/seller-copilot-insight.types';

export type ExtractSellerCopilotRevenueTrend = Extract<
    SellerCopilotInsight,
    { type: 'REVENUE_TREND' }
>;

export type ExtractSellerCopilotProfile = Extract<
    SellerCopilotInsight,
    { type: 'SELLER_PROFILE' }
>;

export type ExtractSellerCopilotOrders = Extract<
    SellerCopilotInsight,
    {
        type:
            | 'ORDER_DETAILS'
            | 'RETURN_ORDERS'
            | 'ACTIONABLE_ORDERS'
            | 'CANCELLED_ORDERS'
            | 'DELIVERED_ORDERS'
            | 'COMPLETED_ORDERS';
    }
>;

export type ExtractSellerCopilotProductCatalog = Extract<
    SellerCopilotInsight,
    { type: 'PRODUCT_CATALOG' }
>;

export type ExtractSellerCopilotProductsWithoutRevenue = Extract<
    SellerCopilotInsight,
    { type: 'PRODUCTS_WITHOUT_REVENUE' }
>;

// Sản phẩm và tổng đơn vị là hai đơn vị đo khác nhau nên giữ type summary riêng.
export type ExtractSellerCopilotStockSummary = Extract<
    SellerCopilotInsight,
    { type: 'PRODUCT_STOCK_SUMMARY' }
>;
