// Kiểm tra badge tên file gom citation trùng và không hiển thị đường dẫn mục.
import { render, screen } from '@testing-library/react';
import type { SellerCopilotCitation } from '@/services/seller/types/seller-copilot.types';
import { SellerCopilotSources } from './SellerCopilotSources';

// Các chunk cùng file phải tạo một badge duy nhất chỉ chứa tên tài liệu.
it('shows one source filename badge and omits retrieved sections', () => {
    // Arrange
    const title = 'Phí giao hàng và doanh thu của shop';
    const citations: SellerCopilotCitation[] = [
        {
            id: 'point-1',
            label: `${title} · ${title} > Các khoản phí trong checkout`,
            title,
            sectionPath: [title, 'Các khoản phí trong checkout'],
            type: 'seller_knowledge',
            documentId: 'document-1',
        },
        {
            id: 'point-2',
            label: `${title} · ${title} > Ghi nhận tiền thu hộ`,
            title,
            sectionPath: [title, 'Ghi nhận tiền thu hộ'],
            type: 'seller_knowledge',
            documentId: 'document-1',
        },
    ];

    // Act
    render(<SellerCopilotSources citations={citations} />);

    // Assert
    const source = screen.getByLabelText('Nguồn thông tin');
    expect(source).toHaveTextContent('Nguồn:');
    expect(screen.getAllByText(title)).toHaveLength(1);
    expect(screen.getByText(title).parentElement).toHaveClass('rounded-md');
    expect(source).not.toHaveTextContent('Các khoản phí trong checkout');
    expect(source).not.toHaveTextContent('Ghi nhận tiền thu hộ');
    expect(
        screen.queryByRole('region', { name: 'Tài liệu tham khảo' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('1 tài liệu')).not.toBeInTheDocument();
});

// Citation lịch sử chỉ có label vẫn rút đúng tên tài liệu cho badge.
it('keeps a readable filename badge when only a legacy label is available', () => {
    // Arrange
    const title = 'Chính sách đổi trả';
    const citations: SellerCopilotCitation[] = [
        {
            id: 'point-legacy',
            label: `${title} · ${title} > Điều kiện đổi trả`,
            type: 'seller_knowledge',
        },
    ];

    // Act
    render(<SellerCopilotSources citations={citations} />);

    // Assert
    const source = screen.getByLabelText('Nguồn thông tin');
    expect(screen.getByText(title).parentElement).toHaveClass('rounded-md');
    expect(source).not.toHaveTextContent('Điều kiện đổi trả');
});
