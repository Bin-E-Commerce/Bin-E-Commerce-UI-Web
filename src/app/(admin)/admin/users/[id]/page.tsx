import { AdminUserDetailPageClient } from '../components/detail/AdminUserDetailPageClient';

// Route chỉ truyền id; toàn bộ thao tác cần token được thực hiện phía client qua API adapter.
export default async function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <AdminUserDetailPageClient userId={id} />;
}
