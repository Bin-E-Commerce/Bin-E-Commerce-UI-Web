import { SellerLayoutShell } from './components/SellerLayoutShell';

// Layout route seller giữ page con mỏng, còn auth/sidebar/topbar nằm trong shell riêng.
export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SellerLayoutShell>{children}</SellerLayoutShell>;
}
