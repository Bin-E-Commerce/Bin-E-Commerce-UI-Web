import type { ReactNode } from 'react';

// Route group riêng cho luồng tạo và chỉnh sửa, giữ layout này độc lập với danh sách/chi tiết.
export default function SellerProductEditorLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
