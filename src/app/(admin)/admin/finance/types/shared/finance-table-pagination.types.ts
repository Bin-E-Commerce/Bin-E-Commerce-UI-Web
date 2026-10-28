// Kiểu props cho paginator được dùng bởi các bảng tài chính admin.
// Component chỉ nhận metadata và phát trang mới; việc tải dữ liệu thuộc component cha.

// Metadata phân trang và callback điều hướng của bảng đang hiển thị.
export interface FinanceTablePaginationProps {
    page: number;
    pageSize: number;
    total: number;
    isFetching: boolean;
    itemLabel: string;
    onPageChange: (page: number) => void;
}
