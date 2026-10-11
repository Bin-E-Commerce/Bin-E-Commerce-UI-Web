// File này gom kiểu props của trang chi tiết hồ sơ và các dialog review.
// Kiểu chỉ mô tả dữ liệu UI; quyền duyệt/từ chối vẫn do API và backend quyết định.
import type { SellerApplicationDto } from '@/services/seller';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AdminSellerApplicationDetailClientProps {
    applicationId: string;
}

export interface AdminSellerApplicationDetailContentProps {
    application: SellerApplicationDto;
    refreshing: boolean;
    onRefresh: () => void;
}

export interface ApplicationSectionProps {
    application: SellerApplicationDto;
}

export interface ApproveSellerApplicationDialogProps {
    applicationId: string;
    shopName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface RejectSellerApplicationDialogProps {
    applicationId: string;
    shopName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface AdminSellerApplicationDetailSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    icon?: LucideIcon;
    density?: 'default' | 'compact';
}

export interface AdminSellerApplicationDetailFieldProps {
    label: string;
    value: ReactNode;
    muted?: boolean;
    className?: string;
    compact?: boolean;
}
