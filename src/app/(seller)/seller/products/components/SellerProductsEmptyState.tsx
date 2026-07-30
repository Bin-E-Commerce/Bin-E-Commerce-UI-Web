import { PackageSearch } from 'lucide-react';

interface SellerProductsEmptyStateProps {
    filtered: boolean;
    onClearFilters: () => void;
}

// Phân biệt shop chưa có sản phẩm với bộ lọc không có kết quả để người bán biết bước tiếp theo.
export function SellerProductsEmptyState({
    filtered,
    onClearFilters,
}: SellerProductsEmptyStateProps) {
    return (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                <PackageSearch className="size-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-zinc-950">
                {filtered
                    ? 'Không tìm thấy sản phẩm phù hợp'
                    : 'Shop chưa có sản phẩm'}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                {filtered
                    ? 'Hãy thử từ khóa khác hoặc quay về danh sách tất cả sản phẩm.'
                    : 'Sản phẩm do shop tạo sẽ xuất hiện tại đây cùng giá bán, tồn kho và trạng thái hiển thị.'}
            </p>
            {filtered ? (
                <button
                    type="button"
                    className="mt-5 text-sm font-semibold text-zinc-950 underline underline-offset-4"
                    onClick={onClearFilters}
                >
                    Xóa bộ lọc
                </button>
            ) : null}
        </div>
    );
}
