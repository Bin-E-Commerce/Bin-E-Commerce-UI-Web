import type {
    SellerApplicationCorrectionTarget,
    SellerApplicationDto,
    SellerApplicationStatus,
} from '@/services/seller';

export interface ListSellerApplicationsParams {
    status?: SellerApplicationStatus | 'all';
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface ListSellerApplicationsResponse {
    items: SellerApplicationDto[];
    meta: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

// Chỉ chứa số hồ sơ đã gửi theo ngày; không trả nội dung đăng ký hay dữ liệu định danh.
export interface SellerApplicationActivityResponse {
    from: string;
    to: string;
    daily: Array<{ day: string; count: number }>;
}

export interface RejectSellerApplicationPayload {
    reason: string;
    correctionTargets: SellerApplicationCorrectionTarget[];
}
