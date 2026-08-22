import type { AdminAccessControlOverview } from '@/services/admin';
import { SummaryCard } from './SummaryCard';

interface AccessControlSummaryGridProps {
    overview: AdminAccessControlOverview | null;
}

// Hiển thị các chỉ số tổng quan để admin biết dữ liệu quyền đang được seed ở phiên bản nào.
export function AccessControlSummaryGrid({
    overview,
}: AccessControlSummaryGridProps) {
    return (
        <section className="grid gap-4 md:grid-cols-4">
            <SummaryCard
                label="Version quyền"
                value={overview?.permissionVersion ?? 'Đang tải'}
            />
            <SummaryCard
                label="Role"
                value={String(overview?.roles.length ?? 0)}
            />
            <SummaryCard
                label="Permission"
                value={String(overview?.permissions.length ?? 0)}
            />
            <SummaryCard
                label="Menu backend"
                value={String(overview?.navigation.length ?? 0)}
            />
        </section>
    );
}
