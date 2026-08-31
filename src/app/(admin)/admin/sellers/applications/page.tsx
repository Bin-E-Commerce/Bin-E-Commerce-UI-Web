import { AdminSellerApplicationsPageClient } from './components/list/AdminSellerApplicationsPageClient';

// Trang list hồ sơ seller đầu tiên của Admin Center, dữ liệu được tải phía client để dùng token hiện tại.
export default function AdminSellerApplicationsPage() {
    return <AdminSellerApplicationsPageClient />;
}
