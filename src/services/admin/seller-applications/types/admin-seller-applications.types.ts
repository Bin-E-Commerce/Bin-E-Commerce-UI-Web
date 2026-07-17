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

export interface RejectSellerApplicationPayload {
    reason: string;
    correctionTargets: SellerApplicationCorrectionTarget[];
}
