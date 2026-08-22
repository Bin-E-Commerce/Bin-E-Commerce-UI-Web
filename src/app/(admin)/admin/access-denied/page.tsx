import { AdminAccessDeniedCard } from './components/AdminAccessDeniedCard';

// Trang riêng cho trường hợp đã đăng nhập nhưng chưa có role quản trị.
export default function AdminAccessDeniedPage() {
    return <AdminAccessDeniedCard />;
}
