// Contract dữ liệu visual do Seller Service dựng từ nguồn xác thực; frontend chỉ chọn component phù hợp để render.

export type SellerCopilotVisualizationType =
    | 'revenue_trend'
    | 'top_products'
    | 'sold_products'
    | 'products_without_revenue'
    | 'product_catalog'
    | 'low_stock'
    | 'out_of_stock'
    | 'stock_summary'
    | 'seller_profile'
    | 'order_details'
    | 'completed_orders'
    | 'completed_order_list'
    | 'return_orders'
    | 'actionable_orders'
    | 'cancelled_orders'
    | 'delivered_orders';

export interface SellerCopilotOrderItemInsight {
    productId: string;
    name: string;
    thumbnailUrl: string | null;
    quantity: number;
    lineTotal: number;
}

export interface SellerCopilotOrderInsight {
    id: string;
    orderNumber: string;
    status: string;
    fulfillmentStatus: string;
    grossAmount: number;
    itemCount: number;
    itemLineCount: number;
    returnReason?: string | null;
    returnDescription?: string | null;
    cancelReason?: string | null;
    items: SellerCopilotOrderItemInsight[];
    createdAt: string;
}

export interface SellerCopilotProductOptionInsight {
    name: string;
    value: string;
}

export interface SellerCopilotProductVariantInsight {
    variantId: string;
    name: string;
    sku: string;
    sellerSku: string | null;
    options: SellerCopilotProductOptionInsight[];
    price: number;
    originalPrice: number | null;
    available: number;
    reserved: number;
    quantitySold: number;
    lowStockThreshold: number;
    thumbnailUrl: string | null;
}

export interface SellerCopilotProductCatalogItemInsight {
    productId: string;
    name: string;
    description: string | null;
    thumbnailUrl: string | null;
    status: string;
    totalSold: number;
    availableTotal: number;
    variants: SellerCopilotProductVariantInsight[];
    variantCount: number;
    hasMoreVariants: boolean;
}

export type SellerCopilotInsight =
    | {
          type: 'REVENUE_TREND';
          range: { from: string; to: string };
          points: Array<{ date: string; grossRevenue: number }>;
      }
    | {
          type: 'PRODUCT_PERFORMANCE';
          productId: string;
          name: string;
          thumbnailUrl: string | null;
          quantitySold: number;
          revenue: number | null;
      }
    | {
          type: 'PRODUCT_CATALOG';
          items: SellerCopilotProductCatalogItemInsight[];
          totalCount: number;
          hasMore: boolean;
      }
    | {
          type: 'PRODUCTS_WITHOUT_REVENUE';
          range: { from: string; to: string };
          hasMore: boolean;
          items: Array<{
              productId: string;
              name: string;
              thumbnailUrl: string | null;
          }>;
      }
    | {
          type: 'PRODUCT_STOCK_SUMMARY';
          catalogProducts: number;
          activeProducts: number;
          inStockProducts: number;
          stockUnits: number;
      }
    | {
          type: 'SELLER_PROFILE';
          account: {
              name: string;
              avatarUrl: string | null;
              email: string;
              phone: string | null;
              role: string;
              status: string;
          };
          shop: {
              name: string;
              logoUrl: string | null;
              description: string | null;
              businessModel: string;
              status: string;
          };
      }
    | {
          type:
              | 'ORDER_DETAILS'
              | 'RETURN_ORDERS'
              | 'ACTIONABLE_ORDERS'
              | 'CANCELLED_ORDERS'
              | 'DELIVERED_ORDERS'
              | 'COMPLETED_ORDERS';
          orders: SellerCopilotOrderInsight[];
          hasMore?: boolean;
      }
    | {
          type: 'ORDER_STATUS_COUNT';
          fulfillmentStatus: 'COMPLETED';
          count: number;
      }
    | {
          type: 'ORDER_QUEUE';
          pendingConfirmation: number;
          pendingShipment: number;
          pendingReturns: number;
      }
    | { type: 'SHOP_KPI' }
    | {
          type: 'LOW_STOCK';
          productId: string;
          name: string;
          thumbnailUrl: string | null;
          stock: number;
          variantName?: string;
      };
