import { AdminSellerApplicationsPageClient } from './components/AdminSellerApplicationsPageClient';

// Trang list hồ sơ seller đầu tiên của Admin Center, dữ liệu được tải phía client để dùng token hiện tại.
export default function AdminSellerApplicationsPage() {
    return <AdminSellerApplicationsPageClient />;
}
