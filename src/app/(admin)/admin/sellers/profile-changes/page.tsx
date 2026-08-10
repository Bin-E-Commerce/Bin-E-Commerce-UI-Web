import { ShopProfileChangeRequestsPageClient } from './components/ShopProfileChangeRequestsPageClient';

// Route danh sách chỉ ghép page client; logic truy vấn và filter được giữ trong feature để file route luôn mỏng.
export default function AdminShopProfileChangesPage() {
    return <ShopProfileChangeRequestsPageClient />;
}
