import type { CatalogCategory } from '@/services/catalog';
import type { PublicProduct, ProductExternalShop } from '@/services/product';

export interface HomeData {
    products: PublicProduct[];
    categories: CatalogCategory[];
    totalProducts: number;
}

export interface HomeShopSummary extends ProductExternalShop {
    productCount: number;
}
