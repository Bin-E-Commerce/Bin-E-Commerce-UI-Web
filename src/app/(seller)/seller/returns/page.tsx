// Route hiển thị workspace xử lý hoàn hàng độc lập với Seller Orders.

import { SellerReturnsPageContent } from './components/seller-returns-page-content';

// Compose trang hoàn hàng; state/query và UI chi tiết được giữ trong feature component.
export default function SellerReturnsPage() {
    return <SellerReturnsPageContent />;
}
