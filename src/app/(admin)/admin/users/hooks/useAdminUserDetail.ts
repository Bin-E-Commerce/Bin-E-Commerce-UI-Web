// Hook điều phối toàn bộ query/mutation của trang detail user.
// UI card chỉ nhận dữ liệu và callback; rule khóa tài khoản, optimistic boundary và invalidate cache nằm tập trung ở đây.
'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/services/admin';
import type { AdminUserRole, AdminUserStatus } from '@/services/admin';
import type { RootState } from '@/store';

export interface RevokeAdminUserSessionInput {
    sessionId?: string;
    revokeAll?: boolean;
}

// Tải profile/session/audit song song và cung cấp các mutation đã gắn sẵn cache invalidation.
export function useAdminUserDetail(userId: string) {
    const queryClient = useQueryClient();
    const currentUserId = useSelector(
        (state: RootState) => state.auth.user?.id,
    );
    const [selectedRole, setSelectedRole] = useState<AdminUserRole | null>(
        null,
    );
    const [selectedStatus, setSelectedStatus] =
        useState<AdminUserStatus | null>(null);
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const userQuery = useQuery({
        queryKey: ['admin-user', userId],
        queryFn: () => adminUsersService.getById(userId),
    });
    const sessionsQuery = useQuery({
        queryKey: ['admin-user-sessions', userId],
        queryFn: () => adminUsersService.getSessions(userId),
    });
    const auditQuery = useQuery({
        queryKey: ['admin-user-audit', userId],
        queryFn: () => adminUsersService.getAudit(userId),
    });
    const user = userQuery.data?.data;

    // Làm mới đồng thời các nguồn dữ liệu detail để profile, session và audit không lệch nhau sau mutation.
    async function invalidateDetailQueries(): Promise<void> {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['admin-user', userId] }),
            queryClient.invalidateQueries({
                queryKey: ['admin-user-sessions', userId],
            }),
            queryClient.invalidateQueries({
                queryKey: ['admin-user-audit', userId],
            }),
            queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        ]);
    }

    const mutation = useMutation({
        mutationFn: async () => {
            if (!user || !reason.trim()) {
                throw new Error('Cần nhập lý do thao tác');
            }
            if (selectedRole) {
                return adminUsersService.updateRole(user.id, {
                    role: selectedRole,
                    reason: reason.trim(),
                    expectedUpdatedAt: user.updatedAt,
                });
            }
            if (selectedStatus) {
                return adminUsersService.updateStatus(user.id, {
                    status: selectedStatus,
                    reason: reason.trim(),
                    expectedUpdatedAt: user.updatedAt,
                });
            }
            throw new Error('Chưa chọn thay đổi');
        },
        onSuccess: async () => {
            setMessage(
                'Đã cập nhật. Các session cũ đã được xử lý theo policy.',
            );
            setSelectedRole(null);
            setSelectedStatus(null);
            setReason('');
            setIsConfirmOpen(false);
            await invalidateDetailQueries();
        },
        onError: (error) =>
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Thao tác thất bại; hãy tải lại dữ liệu.',
            ),
    });

    const revokeMutation = useMutation({
        mutationFn: async ({
            sessionId,
            revokeAll,
        }: RevokeAdminUserSessionInput) => {
            if (revokeAll) {
                return adminUsersService.revokeAllSessions(
                    userId,
                    reason.trim(),
                );
            }
            if (!sessionId) {
                throw new Error('Thiếu session cần thu hồi');
            }
            return adminUsersService.revokeSession(
                userId,
                sessionId,
                reason.trim(),
            );
        },
        onSuccess: async () => {
            setMessage('Đã thu hồi session.');
            setReason('');
            await invalidateDetailQueries();
        },
        onError: () =>
            setMessage('Không thể thu hồi session; hãy tải lại và thử lại.'),
    });

    // Refresh thủ công cả ba query để nút Làm mới có cùng semantics với mutation thành công.
    async function refreshDetail(): Promise<void> {
        await Promise.all([
            userQuery.refetch(),
            sessionsQuery.refetch(),
            auditQuery.refetch(),
        ]);
    }

    // Chọn role mới sẽ hủy lựa chọn status trước đó để một mutation chỉ có một mục tiêu.
    function handleRoleChange(value: string): void {
        setSelectedRole(value === user?.role ? null : (value as AdminUserRole));
        setSelectedStatus(null);
    }

    // Chọn status mới sẽ hủy lựa chọn role trước đó để tránh gửi payload mơ hồ.
    function handleStatusChange(value: string): void {
        setSelectedStatus(
            value === user?.status ? null : (value as AdminUserStatus),
        );
        setSelectedRole(null);
    }

    // Chỉ mở confirm khi UI đã có mutation hợp lệ; validation reason vẫn được giữ ở nút submit và mutation.
    function openConfirm(): void {
        setMessage(null);
        setIsConfirmOpen(true);
    }

    return {
        userQuery,
        sessionsQuery,
        auditQuery,
        user,
        currentUserId,
        selectedRole,
        selectedStatus,
        reason,
        setReason,
        message,
        isConfirmOpen,
        setIsConfirmOpen,
        mutation,
        revokeMutation,
        refreshDetail,
        handleRoleChange,
        handleStatusChange,
        openConfirm,
        isSelfProtected: currentUserId === user?.id,
        isProtectedAdmin: user?.role === 'ADMIN',
        isMutationProtected:
            currentUserId === user?.id || user?.role === 'ADMIN',
    };
}
