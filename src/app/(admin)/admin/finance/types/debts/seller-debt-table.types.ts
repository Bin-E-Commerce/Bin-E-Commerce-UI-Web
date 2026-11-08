// Hợp đồng bảng công nợ: nhận dữ liệu đã phân trang và chỉ phát thay đổi trang về component sở hữu query.
import type {
    AdminSellerWalletDebt,
    AdminSellerWalletDebtFilter,
} from '@/services/admin/types/finance.types';
import type { PublicShopResponse } from '@/services/seller/types/public-shop.types';

export interface SellerDebtTableProps {
    items: AdminSellerWalletDebt[];
    shopsById: Map<string, PublicShopResponse['shop'] | undefined>;
    page: number;
    pageSize: number;
    total: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    search: string;
    status: AdminSellerWalletDebtFilter;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onPageChange: (page: number) => void;
}
