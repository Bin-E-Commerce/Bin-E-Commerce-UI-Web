// Props tìm kiếm seller finance; component chỉ debounce từ khóa, cha vẫn sở hữu query và phân trang.
export interface SellerFinanceSearchProps {
    value: string;
    label: string;
    placeholder: string;
    onSearchChange: (value: string) => void;
}
