// Contract read-only của Seller Dashboard; UI không tự suy luận dữ liệu nghiệp vụ từ order/product riêng lẻ.

export type SellerDashboardRange = '7d' | '30d' | '90d';

export interface SellerDashboardSnapshot {
    generatedAt: string;
    timezone: 'Asia/Ho_Chi_Minh';
    shop: { id: string; name: string; status: string; logoUrl: string | null };
    range: {
        key: SellerDashboardRange;
        from: string;
        to: string;
        previousFrom: string;
        previousTo: string;
    };
    kpis: {
        grossRevenue: number;
        grossRevenuePreviousPeriod: number;
        grossRevenueChangePercent: number | null;
        orderCount: number;
        orderCountPreviousPeriod: number;
        orderChangePercent: number | null;
        pendingConfirmation: number;
        pendingShipment: number;
        shipping: number;
        pendingReturns: number;
        activeProducts: number;
        outOfStockProducts: number;
    };
    revenueTrend: Array<{
        date: string;
        grossRevenue: number;
        orderCount: number;
    }>;
    orderStatusCounts: {
        all: number;
        pendingConfirmation: number;
        pendingShipment: number;
        shipping: number;
        delivered: number;
        completed: number;
        cancelled: number;
        returnRefund: number;
    };
    latestOrders: Array<{
        id: string;
        orderNumber: string;
        status: string;
        fulfillmentStatus: string;
        grossAmount: number;
        itemCount: number;
        createdAt: string;
    }>;
    topProducts: Array<{
        productId: string;
        name: string;
        thumbnailUrl: string | null;
        quantitySold: number;
        revenue: number | null;
        stock: number | null;
    }>;
}
