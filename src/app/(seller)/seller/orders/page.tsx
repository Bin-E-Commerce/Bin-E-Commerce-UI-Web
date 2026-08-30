// Page route mỏng cho Seller order list; feature state và UI nằm trong các component/hook cục bộ.

import { SellerOrdersPageContent } from './components/seller-orders-page-content';

// Compose màn hình danh sách order theo layout Seller Center đã xác thực ở parent route.
export default function SellerOrdersPage() {
    return <SellerOrdersPageContent />;
}
