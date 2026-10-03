// Unit test cho card sản phẩm của Copilot; kiểm tra link/ảnh từ insight backend mà không gọi API.
import { render, screen } from '@testing-library/react';
import { SellerCopilotInsightCard } from '@/app/(seller)/seller/ai/bingpt/components/answer/insight/SellerCopilotInsightCard';

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
    };

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
