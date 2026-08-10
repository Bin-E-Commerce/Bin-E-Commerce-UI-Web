import { ShopProfileChangeRequestDetailClient } from '../components/detail/ShopProfileChangeRequestDetailClient';

interface AdminShopProfileChangeRequestPageProps {
    params: Promise<{ requestId: string }>;
}

// Route động chỉ giải nén requestId; toàn bộ trạng thái tải và quyết định review nằm trong feature component.
export default async function AdminShopProfileChangeRequestPage({
    params,
}: AdminShopProfileChangeRequestPageProps) {
    const { requestId } = await params;
    return <ShopProfileChangeRequestDetailClient requestId={requestId} />;
}
