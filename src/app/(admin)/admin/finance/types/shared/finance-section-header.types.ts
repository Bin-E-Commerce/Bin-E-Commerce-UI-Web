// Props dùng chung để các bảng tài chính giữ cùng hợp đồng hiển thị phần đầu.
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FinanceSectionHeaderProps {
    icon: LucideIcon;
    title: string;
    description: string;
    countLabel?: string;
    actions?: ReactNode;
}
