import { SellerProductDetailClient } from '../product-detail/components/SellerProductDetailClient';

// Route seller chỉ compose màn chi tiết; việc tải dữ liệu và xử lý trạng thái nằm trong feature component.
export default function SellerProductDetailPage() {
    return <SellerProductDetailClient />;
}
