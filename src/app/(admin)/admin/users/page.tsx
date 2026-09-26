import { AdminUsersPageClient } from './components/list/AdminUsersPageClient';

// Route mỏng; state lọc và gọi API nằm ở client component để giữ server boundary rõ ràng.
export default function AdminUsersPage() {
    return <AdminUsersPageClient />;
}
