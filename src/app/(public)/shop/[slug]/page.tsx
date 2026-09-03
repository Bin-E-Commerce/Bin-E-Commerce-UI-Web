import { ShopPageContent } from './components/ShopPageContent';

interface PublicShopPageProps {
    params: Promise<{ slug: string }>;
}

// Route chỉ đọc slug động và giao phần data/UI cho feature component của trang shop.
export default async function PublicShopPage({ params }: PublicShopPageProps) {
    const { slug } = await params;
    return <ShopPageContent slug={slug} />;
}
