import type { CatalogCategory } from '@/services/catalog';
import type { PublicProduct } from '@/services/product';

export interface HomeData {
    products: PublicProduct[];
    categories: CatalogCategory[];
    totalProducts: number;
}
