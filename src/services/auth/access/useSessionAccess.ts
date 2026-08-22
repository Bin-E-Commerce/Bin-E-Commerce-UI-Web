'use client';

import { useSelector } from 'react-redux';

import type { RootState } from '@/store';
import {
    canAccessAdmin,
    canAccessAdminDashboard,
    canAccessSellerCenter,
    canReadSellerApplications,
    hasPermission,
} from './session-access';
import type { SessionPermission } from './types/session-access.types';

// Hook đọc session hiện tại từ Redux và trả các cờ truy cập thường dùng cho component client.
// Component không cần tự hiểu role/permission, chỉ dùng kết quả đã được backend tính trong session.
export function useSessionAccess() {
    const user = useSelector((state: RootState) => state.auth.user);

    return {
        user,
        canAccessAdmin: canAccessAdmin(user),
        canAccessAdminDashboard: canAccessAdminDashboard(user),
        canAccessSellerCenter: canAccessSellerCenter(user),
        canReadSellerApplications: canReadSellerApplications(user),
    };
}

// Hook kiểm tra một permission đơn lẻ khi button hoặc block UI cần ẩn/hiện theo session.
export function useSessionPermission(permission: SessionPermission): boolean {
    const user = useSelector((state: RootState) => state.auth.user);
    return hasPermission(user, permission);
}
