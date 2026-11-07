// Hợp đồng bộ lọc bảng tài chính admin; giá trị lọc được component cha áp dụng vào query hoặc dữ liệu đã tải.
export interface FinanceTableFilterOption {
    value: string;
    label: string;
}

// Props cho thanh tìm kiếm/lọc dùng chung trong các bảng tài chính admin.
export interface FinanceTableToolbarProps {
    searchValue: string;
    searchPlaceholder: string;
    searchLabel: string;
    onSearchChange: (value: string) => void;
    statusValue?: string;
    statusLabel?: string;
    statusOptions?: FinanceTableFilterOption[];
    onStatusChange?: (value: string) => void;
}
