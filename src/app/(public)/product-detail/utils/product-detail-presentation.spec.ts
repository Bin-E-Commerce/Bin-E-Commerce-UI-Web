// File này kiểm tra formatter mô tả plain text để nội dung cũ vẫn hiển thị đúng heading, bullet và paragraph.
// Test chỉ chạy trên chuỗi nội dung, không gọi API hoặc phụ thuộc DOMPurify.

import { formatProductDescriptionHtml } from './product-detail-presentation';

// Formatter phải tách các section và bullet inline thành HTML có cấu trúc đọc được trên trang chi tiết.
test('formats marketplace description sections and inline bullets', () => {
    // Arrange
    const description = 'Điểm nổi bật: - Chất liệu mềm - Thiết kế thoải mái Mô tả chi tiết: Phù hợp dùng hằng ngày.';

    // Act
    const html = formatProductDescriptionHtml(description);

    // Assert
    expect(html).toContain('<h3>Điểm nổi bật</h3>');
    expect(html).toContain('<ul><li>Chất liệu mềm</li><li>Thiết kế thoải mái</li></ul>');
    expect(html).toContain('<h3>Mô tả chi tiết</h3>');
});
