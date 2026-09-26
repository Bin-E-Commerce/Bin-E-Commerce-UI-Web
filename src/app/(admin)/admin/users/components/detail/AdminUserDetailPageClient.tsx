// Orchestrator của màn hình detail user; giữ page client mỏng bằng cách giao data flow cho hook
// và giao từng vùng trình bày cho profile, role/status, session, audit và confirm dialog.
'use client';
import { Button } from '@/components/ui/button';

import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useAdminUserDetail } from '../../hooks/useAdminUserDetail';
import { AdminUserAuditTimeline } from './AdminUserAuditTimeline';
import { AdminUserChangeDialog } from './AdminUserChangeDialog';
import { AdminUserProfileCard } from './AdminUserProfileCard';
import { AdminUserRoleStatusCard } from './AdminUserRoleStatusCard';
import { AdminUserSessionsCard } from './AdminUserSessionsCard';

interface AdminUserDetailPageClientProps {
    userId: string;
}

// Điều phối loading/error state và bố cục detail; business mutation không nằm trong JSX page.
export function AdminUserDetailPageClient({
    userId,
}: AdminUserDetailPageClientProps) {
    const detail = useAdminUserDetail(userId);

    if (detail.userQuery.isLoading) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
                Đang tải hồ sơ...
            </div>
        );
    }

    if (detail.userQuery.isError || !detail.user) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                Không tải được hồ sơ hoặc tài khoản không tồn tại.
            </div>
        );
    }

    const user = detail.user;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
                >
                    <ArrowLeft className="size-4" /> Quay lại danh sách
                </Link>
                <Button
                    variant="ghost"
                    type="button"
                    onClick={() => void detail.refreshDetail()}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                    <RefreshCw className="size-4" /> Làm mới
                </Button>
            </div>

            <AdminUserProfileCard user={user} />

            <section className="grid gap-5 lg:grid-cols-2">
                <AdminUserRoleStatusCard
                    user={user}
                    isSelfProtected={detail.isSelfProtected}
                    isMutationProtected={detail.isMutationProtected}
                    selectedRole={detail.selectedRole}
                    selectedStatus={detail.selectedStatus}
                    reason={detail.reason}
                    message={detail.message}
                    isPending={detail.mutation.isPending}
                    onRoleChange={detail.handleRoleChange}
                    onStatusChange={detail.handleStatusChange}
                    onReasonChange={detail.setReason}
                    onSubmit={detail.openConfirm}
                />
                <AdminUserSessionsCard
                    sessions={detail.sessionsQuery.data?.data ?? []}
                    isMutationProtected={detail.isMutationProtected}
                    isSelfProtected={detail.isSelfProtected}
                    isPending={detail.revokeMutation.isPending}
                    reason={detail.reason}
                    onRevoke={(input) => detail.revokeMutation.mutate(input)}
                />
            </section>

            <AdminUserAuditTimeline
                entries={detail.auditQuery.data?.data ?? []}
            />

            <AdminUserChangeDialog
                isOpen={detail.isConfirmOpen}
                selectedRole={detail.selectedRole}
                selectedStatus={detail.selectedStatus}
                reason={detail.reason}
                isPending={detail.mutation.isPending}
                onCancel={() => detail.setIsConfirmOpen(false)}
                onConfirm={() => detail.mutation.mutate()}
            />
        </div>
    );
}
