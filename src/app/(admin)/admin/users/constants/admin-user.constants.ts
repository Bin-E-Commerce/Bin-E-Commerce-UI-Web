// Hằng số kỹ thuật của feature quản lý user; chỉ chứa enum dùng để tạo request/filter,
// không chứa nội dung hiển thị để tránh trộn cấu hình với UI copy.
import type { AdminUserRole, AdminUserStatus } from '@/services/admin';

export const ADMIN_USER_ROLES: AdminUserRole[] = [
    'CUSTOMER',
    'SELLER',
    'SUPPORT_AGENT',
    'ADMIN',
];

export const ADMIN_USER_STATUSES: AdminUserStatus[] = ['ACTIVE', 'BANNED'];
