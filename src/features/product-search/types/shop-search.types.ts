// Kiểu dữ liệu riêng cho danh sách và thẻ shop trong kết quả tìm kiếm.
import type { PublicShopListItem } from '@/services/seller';

export interface ShopSearchResultCardProps {
    item: PublicShopListItem;
}

export interface ShopSearchResultsProps {
    query: string;
    page: number;
}
