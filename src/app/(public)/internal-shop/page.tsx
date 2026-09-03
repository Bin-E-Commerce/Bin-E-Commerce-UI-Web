// Route public cho màn hình khám phá shop nội bộ.
// Page chỉ đọc URL boundary và giao phần tải dữ liệu/UI cho feature component, không chứa nghiệp vụ shop.

import { ShopDirectoryPageContent } from './components/shop-directory/ShopDirectoryPageContent';

// Render trang danh sách shop để customer chọn đúng dữ liệu có thể thêm giỏ và đặt đơn thử.
export default function ShopDirectoryPage() {
    return <ShopDirectoryPageContent />;
}
