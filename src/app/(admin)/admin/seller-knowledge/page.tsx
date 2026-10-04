import { SellerKnowledgePageClient } from './components/SellerKnowledgePageClient';

// Route chỉ giao phần hiển thị và state cho feature client; phân quyền vẫn được quyết định từ access profile/API.
export default function SellerKnowledgePage() {
    return <SellerKnowledgePageClient />;
}
