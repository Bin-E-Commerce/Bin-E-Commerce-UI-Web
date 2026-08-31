// Giữ tương thích URL cũ bằng redirect server-side sang tên tính năng mới.
import { redirect } from 'next/navigation';

// Redirect không render UI cũ và không tạo thêm request tới Seller Service.
export default function SellerShopShippingPage() {
    redirect('/seller/shipping/settings');
}
