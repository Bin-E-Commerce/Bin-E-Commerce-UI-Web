// Chỉ khai báo các đường dẫn public đang tồn tại trong web; không thêm route giả
// để footer không dẫn người dùng tới trang 404 hoặc khu vực cần quyền nội bộ.
export const FOOTER_LINKS = {
    'Mua sắm': [
        { href: '/', label: 'Trang chủ' },
        { href: '/internal-shop', label: 'Gian hàng nội bộ' },
        { href: '/goi-y-hom-nay', label: 'Gợi ý hôm nay' },
    ],
    'Khám phá': [
        { href: '/showcase', label: 'Kiến trúc & công nghệ' },
        { href: '/showcase/ai-optimization', label: 'Tối ưu hình ảnh AI' },
        { href: '/showcase/recommendation', label: 'Gợi ý sản phẩm' },
    ],
} as const;
