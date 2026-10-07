// Unit test cho card sản phẩm của Copilot; kiểm tra link/ảnh từ insight backend mà không gọi API.
import { fireEvent, render, screen } from '@testing-library/react';
import { SellerCopilotInsightCard } from '@/app/(seller)/seller/ai/bingpt/components/answer/insights/SellerCopilotInsightCard';

// Card hiệu suất phải dẫn seller tới đúng product detail và hiển thị thumbnail đã scope từ dashboard.
it('renders product performance with detail link and thumbnail', () => {
    // Arrange
    const insight = {
        type: 'PRODUCT_PERFORMANCE',
        productId: '1f826d60-d9ca-4146-b006-ed8169b7caad',
        name: 'Áo thun thể thao cổ tim',
        thumbnailUrl: 'https://cdn.example.com/product.jpg',
        quantitySold: 3,
        revenue: 555000,
    } as const;

    // Act
    render(<SellerCopilotInsightCard insight={insight} />);

    // Assert
    expect(
        screen.getByRole('link', {
            name: /Áo thun thể thao cổ tim.*3 sản phẩm đã bán/i,
        }),
    ).toHaveAttribute(
        'href',
        '/seller/products/1f826d60-d9ca-4146-b006-ed8169b7caad',
    );
    expect(
        screen.getByRole('img', { name: 'Áo thun thể thao cổ tim' }),
    ).toHaveAttribute('src', 'https://cdn.example.com/product.jpg');
});

// Sản phẩm không doanh thu dùng chung khung link/ảnh với insight sản phẩm bán được.
it('renders products without revenue using the shared product-card layout', () => {
    render(
        <SellerCopilotInsightCard
            insight={{
                type: 'PRODUCTS_WITHOUT_REVENUE',
                range: { from: '2026-09-01', to: '2026-10-01' },
                hasMore: false,
                items: [
                    {
                        productId: 'product-no-revenue',
                        name: 'Giày chưa bán',
                        thumbnailUrl: 'https://cdn.test/shoe.png',
                    },
                ],
            }}
        />,
    );

    expect(screen.getByText('Giày chưa bán')).toBeInTheDocument();
    expect(
        screen.getByText('Chưa phát sinh doanh thu trong kỳ'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Giày chưa bán/ })).toHaveAttribute(
        'href',
        '/seller/products/product-no-revenue',
    );
});

// Danh sách catalog phải render ảnh cho từng sản phẩm và tồn/giá theo option thay vì tái sử dụng card bán chạy.
it('renders every catalog product with its image and per-variant stock', () => {
    render(
        <SellerCopilotInsightCard
            insight={{
                type: 'PRODUCT_CATALOG',
                totalCount: 2,
                hasMore: false,
                items: [
                    {
                        productId: 'shirt-1',
                        name: 'Áo thun thể thao',
                        description: 'Áo cổ tim phối màu.',
                        thumbnailUrl: 'https://cdn.example.test/shirt.jpg',
                        status: 'ACTIVE',
                        totalSold: 3,
                        availableTotal: 28,
                        variantCount: 2,
                        hasMoreVariants: false,
                        variants: [
                            {
                                variantId: 'variant-m',
                                name: 'Đen / M',
                                sku: 'SKU-M',
                                sellerSku: 'SHOP-M',
                                options: [
                                    { name: 'Màu sắc', value: 'Đen' },
                                    { name: 'Size', value: 'M' },
                                ],
                                price: 185000,
                                originalPrice: null,
                                available: 8,
                                reserved: 1,
                                quantitySold: 2,
                                lowStockThreshold: 5,
                                thumbnailUrl:
                                    'https://cdn.example.test/shirt.jpg',
                            },
                        ],
                    },
                    {
                        productId: 'shoes-1',
                        name: 'Giày sục nam',
                        description: null,
                        thumbnailUrl: 'https://cdn.example.test/shoes.jpg',
                        status: 'ACTIVE',
                        totalSold: 0,
                        availableTotal: 0,
                        variantCount: 0,
                        hasMoreVariants: false,
                        variants: [],
                    },
                ],
            }}
        />,
    );

    expect(
        screen.getByRole('region', { name: 'Danh sách sản phẩm và tồn kho' }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('img', { name: 'Áo thun thể thao' }),
    ).toHaveAttribute('src', 'https://cdn.example.test/shirt.jpg');
    expect(screen.getByRole('img', { name: 'Giày sục nam' })).toHaveAttribute(
        'src',
        'https://cdn.example.test/shoes.jpg',
    );
    expect(screen.getByText('Màu sắc: Đen · Size: M')).toBeInTheDocument();
    expect(screen.getByText(/SKU SHOP-M/)).toBeInTheDocument();
    expect(screen.getByText('185.000 ₫')).toBeInTheDocument();
    expect(
        screen
            .getByRole('img', { name: 'Áo thun thể thao' })
            .closest('article'),
    ).toHaveTextContent('Còn 28 sản phẩm · Đã bán 3');
});

// Ảnh sản phẩm lỗi tải phải chuyển sang placeholder mà vẫn giữ nguyên tên và số liệu insight.
it('falls back to the product placeholder when its thumbnail fails to load', () => {
    render(
        <SellerCopilotInsightCard
            insight={{
                type: 'PRODUCT_PERFORMANCE',
                productId: 'product-1',
                name: 'Áo thể thao',
                thumbnailUrl: 'https://cdn.example.test/broken.jpg',
                quantitySold: 2,
                revenue: null,
            }}
        />,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Áo thể thao' }));

    expect(screen.queryByRole('img', { name: 'Áo thể thao' })).toBeNull();
    expect(screen.getByText('Áo thể thao')).toBeInTheDocument();
});

// Hồ sơ phải kết hợp ảnh đại diện và logo shop với fallback chữ cái khi không có URL ảnh.
it('renders the account and shop profile with image fallbacks', () => {
    render(
        <SellerCopilotInsightCard
            insight={{
                type: 'SELLER_PROFILE',
                account: {
                    name: 'Đào Ngọc Anh',
                    avatarUrl: null,
                    email: 'seller@example.test',
                    phone: null,
                    role: 'SELLER',
                    status: 'ACTIVE',
                },
                shop: {
                    name: 'Bin Nè',
                    logoUrl: null,
                    description: 'Shop thời trang',
                    businessModel: 'RETAIL',
                    status: 'ACTIVE',
                },
            }}
        />,
    );

    expect(
        screen.getByRole('region', { name: 'Hồ sơ tài khoản và shop' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Đào Ngọc Anh')).toBeInTheDocument();
    expect(screen.getByText('Người bán')).toBeInTheDocument();
    expect(screen.getAllByText('Đang hoạt động')).toHaveLength(2);
    expect(screen.getByText('seller@example.test')).toBeInTheDocument();
    expect(screen.getByText('Số điện thoại')).toBeInTheDocument();
    expect(screen.getByText('Chưa cập nhật')).toBeInTheDocument();
    expect(screen.getByText('Bin Nè')).toBeInTheDocument();
    expect(screen.getByText('Bán lẻ')).toBeInTheDocument();
    expect(screen.getByText('Giới thiệu cửa hàng')).toBeInTheDocument();
    expect(screen.getByText('Shop thời trang')).toBeInTheDocument();
    expect(screen.getByText('NA')).toBeInTheDocument();
});

// Khi Auth/Shop có URL ảnh, profile card dùng đúng hai URL nguồn thay vì tạo avatar minh họa giả.
it('renders the account avatar and shop logo URLs supplied by the backend', () => {
    render(
        <SellerCopilotInsightCard
            insight={{
                type: 'SELLER_PROFILE',
                account: {
                    name: 'Đào Ngọc Anh',
                    avatarUrl: 'https://cdn.example.test/avatar.jpg',
                    email: 'seller@example.test',
                    phone: null,
                    role: 'SELLER',
                    status: 'ACTIVE',
                },
                shop: {
                    name: 'Bin Nè',
                    logoUrl: 'https://cdn.example.test/shop.jpg',
                    description: null,
                    businessModel: 'RETAIL',
                    status: 'ACTIVE',
                },
            }}
        />,
    );

    expect(
        screen.getByRole('img', { name: 'Ảnh đại diện Đào Ngọc Anh' }),
    ).toHaveAttribute('src', 'https://cdn.example.test/avatar.jpg');
    expect(screen.getByRole('img', { name: 'Logo Bin Nè' })).toHaveAttribute(
        'src',
        'https://cdn.example.test/shop.jpg',
    );
});

// Biểu đồ chỉ được dựng từ điểm backend đã chọn, đồng thời nêu rõ khoảng ngày đang xem.
it('renders the revenue trend insight with its date range', () => {
    render(
        <SellerCopilotInsightCard
            insight={{
                type: 'REVENUE_TREND',
                range: {
                    from: '2026-09-06T17:00:00.000Z',
                    to: '2026-10-06T09:44:08.018Z',
                },
                points: [
                    { date: '2026-10-01', grossRevenue: 100000 },
                    { date: '2026-10-02', grossRevenue: 200000 },
                ],
            }}
        />,
    );

    expect(
        screen.getByRole('region', { name: 'Biểu đồ doanh thu theo ngày' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Doanh thu theo ngày')).toBeInTheDocument();
    expect(screen.getByText('07/09 – 06/10')).toBeInTheDocument();
});

// Đơn hàng phải render đúng trạng thái và ảnh snapshot sản phẩm; danh sách hoàn trả dùng tiêu đề riêng.
it('renders order and return details with their product thumbnails', () => {
    const order = {
        id: 'order-1',
        orderNumber: 'BIN-ORDER-001',
        status: 'CONFIRMED',
        fulfillmentStatus: 'RETURN_REFUND',
        grossAmount: 450000,
        itemCount: 2,
        itemLineCount: 1,
        items: [
            {
                productId: 'product-1',
                name: 'Áo khoác thể thao',
                thumbnailUrl: 'https://cdn.example.test/jacket.jpg',
                quantity: 2,
                lineTotal: 450000,
            },
        ],
        createdAt: '2026-09-19T04:00:00.000Z',
    };
    const { rerender } = render(
        <SellerCopilotInsightCard
            insight={{ type: 'ORDER_DETAILS', orders: [order] }}
        />,
    );

    expect(
        screen.getByRole('region', { name: 'Thông tin đơn hàng' }),
    ).toBeInTheDocument();
    expect(screen.getByText('BIN-ORDER-001')).toBeInTheDocument();
    expect(screen.getByText('Đang hoàn trả')).toHaveClass(
        'border-red-300',
        'bg-red-50',
        'text-red-700',
    );
    expect(screen.getAllByText('450.000 ₫')).toHaveLength(2);
    expect(
        screen.getByRole('img', { name: 'Áo khoác thể thao' }),
    ).toHaveAttribute('src', 'https://cdn.example.test/jacket.jpg');

    rerender(
        <SellerCopilotInsightCard
            insight={{ type: 'RETURN_ORDERS', orders: [order] }}
        />,
    );

    expect(
        screen.getByRole('region', { name: 'Đơn hàng hoàn trả' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Đơn hàng hoàn trả')).toBeInTheDocument();
});

// Câu hỏi đếm đơn hoàn thành chỉ render aggregate toàn shop, không mượn danh sách đơn gần nhất để tạo card thừa.
it('renders only the exact completed-order count when a count insight is returned', () => {
    render(
        <SellerCopilotInsightCard
            insight={{
                type: 'ORDER_STATUS_COUNT',
                fulfillmentStatus: 'COMPLETED',
                count: 4,
            }}
        />,
    );

    expect(
        screen.getByRole('region', { name: 'Số đơn hoàn thành' }),
    ).toHaveTextContent('4 đơn');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
});
