import { AdminSellerApplicationDetailClient } from '../components/detail/AdminSellerApplicationDetailClient';

interface AdminSellerApplicationDetailPageProps {
    params: Promise<{ id: string }>;
}

// Route chi tiết chỉ lấy id từ URL rồi giao phần fetch/render cho client component dùng React Query.
export default async function AdminSellerApplicationDetailPage({
    params,
}: AdminSellerApplicationDetailPageProps) {
    const { id } = await params;

    return <AdminSellerApplicationDetailClient applicationId={id} />;
}
