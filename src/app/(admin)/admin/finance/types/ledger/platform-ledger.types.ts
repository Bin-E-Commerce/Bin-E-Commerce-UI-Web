// Kiểu props cho bảng lịch sử dòng tiền chỉ đọc của admin.
// Component nhận dữ liệu đã phân trang và chuyển yêu cầu tìm kiếm/trang lên trang cha.
import type { AdminFinanceLedgerEntry } from '@/services/admin/types/finance.types';

// Bảng ledger chỉ cho phép tra cứu và điều hướng qua các trang dữ liệu.
export interface PlatformLedgerSectionProps {
    ledger: AdminFinanceLedgerEntry[];
    page: number;
    pageSize: number;
    total: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
}
