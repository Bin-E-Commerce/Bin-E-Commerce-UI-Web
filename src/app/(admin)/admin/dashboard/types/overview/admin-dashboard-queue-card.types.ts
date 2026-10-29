// Props của thẻ hàng đợi thuộc overview; dữ liệu và quyền truy cập do hook/API bên ngoài sở hữu.
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { AdminDashboardMetricState } from '../admin-dashboard-state.types';

export interface AdminDashboardQueueCardProps {
    href: string;
    icon: LucideIcon;
    value: number | null;
    state: AdminDashboardMetricState;
    title: ReactNode;
    description: ReactNode;
}
