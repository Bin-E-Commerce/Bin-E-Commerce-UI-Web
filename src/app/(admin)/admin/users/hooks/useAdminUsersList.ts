// Hook điều phối filter, phân trang và query danh sách; component chỉ nhận state đã chuẩn hóa
// để tập trung vào layout và không phải biết chi tiết query key/API adapter.
'use client';

import { useDeferredValue, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminUsersService } from '@/services/admin';
import type { AdminUserRole, AdminUserStatus } from '@/services/admin';

// Giữ trang hiện tại đồng bộ với filter và trì hoãn search để không bắn request theo từng phím gõ.
export function useAdminUsersList() {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState<AdminUserRole | ''>('');
    const [status, setStatus] = useState<AdminUserStatus | ''>('');
    const [page, setPage] = useState(1);
    const deferredSearch = useDeferredValue(search);
    const query = useQuery({
        queryKey: [
            'admin-users',
            { page, search: deferredSearch, role, status },
        ],
        queryFn: () =>
            adminUsersService.list({
                page,
                limit: 20,
                search: deferredSearch,
                role: role || undefined,
                status: status || undefined,
            }),
    });

    // Filter mới phải quay về trang đầu để không rơi vào trang rỗng sau khi thu hẹp kết quả.
    function resetPage(): void {
        setPage(1);
    }

    return {
        query,
        data: query.data?.data,
        search,
        setSearch,
        role,
        setRole,
        status,
        setStatus,
        page,
        setPage,
        resetPage,
    };
}
