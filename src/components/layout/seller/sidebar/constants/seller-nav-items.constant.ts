import {
    BarChart3,
    Boxes,
    Building2,
    ChartNoAxesCombined,
    ClipboardList,
    CreditCard,
    Headphones,
    Home,
    Landmark,
    LayoutDashboard,
    MessageSquareText,
    PackageCheck,
    PackagePlus,
    PackageSearch,
    RefreshCcw,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Star,
    Store,
    Truck,
    WalletCards,
} from 'lucide-react';

import type { SellerNavGroup } from '../types/seller-nav-item.type';

// Nhóm điều hướng seller theo nghiệp vụ thật để người bán quét nhanh từng khu vực vận hành.
export const SELLER_NAV_GROUPS: SellerNavGroup[] = [
    {
        title: 'Tổng quan',
        items: [
            {
                href: '/seller',
                label: 'Bảng điều khiển',
                description: 'Doanh thu, đơn cần xử lý và sức khỏe shop',
                icon: LayoutDashboard,
                exact: true,
            },
        ],
    },
    {
        title: 'Quản lý đơn hàng',
        items: [
            {
                href: '/seller/orders',
                label: 'Tất cả đơn hàng',
                description: 'Theo dõi đơn, giao hàng và hoàn tiền',
                icon: ClipboardList,
                exact: true,
            },
            {
                href: '/seller/orders?status=pending',
                label: 'Chờ xử lý',
                description: 'Đơn mới cần xác nhận hoặc chuẩn bị hàng',
                icon: PackageCheck,
            },
            {
                href: '/seller/orders?status=returns',
                label: 'Trả hàng / Hoàn tiền',
                description: 'Yêu cầu đổi trả và khiếu nại sau bán',
                icon: RefreshCcw,
            },
        ],
    },
    {
        title: 'Quản lý sản phẩm',
        items: [
            {
                href: '/seller/products',
                label: 'Tất cả sản phẩm',
                description: 'Danh sách sản phẩm đang bán trong shop',
                icon: PackageSearch,
                exact: true,
            },
            {
                href: '/seller/products/new',
                label: 'Thêm sản phẩm',
                description: 'Tạo sản phẩm, biến thể, ảnh và tồn kho',
                icon: PackagePlus,
            },
            {
                href: '/seller/products/inventory',
                label: 'Kho hàng',
                description: 'Kiểm soát tồn kho và cảnh báo sắp hết hàng',
                icon: Boxes,
            },
        ],
    },
    {
        title: 'Quản lý shop',
        items: [
            {
                href: '/seller/shop',
                label: 'Hồ sơ shop',
                description: 'Tên shop, ảnh đại diện, mô tả và trạng thái',
                icon: Store,
                exact: true,
            },
            {
                href: '/seller/shop/design',
                label: 'Trang trí shop',
                description: 'Banner, bộ sưu tập và bố cục trang shop',
                icon: Home,
            },
            {
                href: '/seller/shop/shipping',
                label: 'Vận chuyển',
                description: 'Địa chỉ lấy hàng và đơn vị vận chuyển',
                icon: Truck,
            },
            {
                href: '/seller/shop/settings',
                label: 'Thiết lập shop',
                description: 'Chính sách vận hành và cấu hình bán hàng',
                icon: Settings,
            },
        ],
    },
    {
        title: 'Tài chính',
        items: [
            {
                href: '/seller/finance',
                label: 'Ví người bán',
                description: 'Số dư, tiền chờ thanh toán và rút tiền',
                icon: WalletCards,
                exact: true,
            },
            {
                href: '/seller/finance/reconciliation',
                label: 'Đối soát',
                description: 'Kiểm tra doanh thu, phí và hoàn tiền',
                icon: Landmark,
            },
            {
                href: '/seller/finance/bank-accounts',
                label: 'Tài khoản ngân hàng',
                description: 'Tài khoản nhận tiền sau đối soát',
                icon: CreditCard,
            },
        ],
    },
    {
        title: 'Chăm sóc khách hàng',
        items: [
            {
                href: '/seller/support',
                label: 'Tin nhắn',
                description: 'Hội thoại với khách mua hàng',
                icon: MessageSquareText,
                exact: true,
            },
            {
                href: '/seller/support/reviews',
                label: 'Đánh giá sản phẩm',
                description: 'Phản hồi đánh giá và cải thiện chất lượng',
                icon: Star,
            },
            {
                href: '/seller/support/tickets',
                label: 'Khiếu nại',
                description: 'Vấn đề cần seller xử lý cùng hệ thống',
                icon: Headphones,
            },
        ],
    },
    {
        title: 'Dữ liệu',
        items: [
            {
                href: '/seller/analytics',
                label: 'Tổng quan kinh doanh',
                description: 'Hiệu suất bán hàng và xu hướng tăng trưởng',
                icon: ChartNoAxesCombined,
                exact: true,
            },
            {
                href: '/seller/analytics/products',
                label: 'Phân tích sản phẩm',
                description: 'Lượt xem, chuyển đổi và sản phẩm chủ lực',
                icon: BarChart3,
            },
            {
                href: '/seller/analytics/shop-health',
                label: 'Sức khỏe shop',
                description: 'Điểm vận hành, vi phạm và tiêu chuẩn dịch vụ',
                icon: ShieldCheck,
            },
        ],
    },
    {
        title: 'Kênh bán hàng',
        items: [
            {
                href: '/',
                label: 'Về trang mua sắm',
                description: 'Quay lại giao diện khách mua hàng',
                icon: ShoppingBag,
            },
            {
                href: '/seller/shop/public-preview',
                label: 'Xem shop của tôi',
                description: 'Kiểm tra trang shop như khách hàng nhìn thấy',
                icon: Building2,
            },
        ],
    },
];
