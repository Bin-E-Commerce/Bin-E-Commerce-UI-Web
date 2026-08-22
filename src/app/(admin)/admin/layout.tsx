import type { ReactNode } from 'react';

import { AdminLayoutShell } from '@/components/layout/admin';

// Bọc toàn bộ route /admin bằng shell chung để dùng lại auth gate, sidebar và topbar quản trị.
export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
