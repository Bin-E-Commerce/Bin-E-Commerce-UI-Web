// Kiểm tra mode event thành nội dung timeline truy cập được và dùng nhãn/icon đúng mode.
import { render, screen } from '@testing-library/react';
import { SellerCopilotModeChangeDivider } from './SellerCopilotModeChangeDivider';

describe('SellerCopilotModeChangeDivider', () => {
    // Mỗi enum mode phải tạo một mốc ngữ nghĩa rõ ràng, không phụ thuộc text do model sinh.
    it('should announce the selected mode as a timeline separator', () => {
        // Arrange

        // Act
        render(<SellerCopilotModeChangeDivider mode="shop_data" />);

        // Assert
        expect(
            screen.getByRole('separator', {
                name: 'Bạn đã chuyển sang chế độ Dữ liệu shop',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Bạn đã chuyển sang chế độ Dữ liệu shop'),
        ).toBeInTheDocument();
    });
});
