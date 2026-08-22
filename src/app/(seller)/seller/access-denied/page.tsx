import { SellerAccessDeniedCard } from './components/SellerAccessDeniedCard';

// Trang riêng cho trường hợp đã đăng nhập nhưng chưa có quyền vào Seller Center.
export default function SellerAccessDeniedPage() {
    return <SellerAccessDeniedCard />;
}
