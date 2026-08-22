import type {
    ShopProfileChangeRequestDto,
    ShopProfileChangeRequestStatus,
} from '@/services/seller';

export interface ListShopProfileChangeRequestsParams {
    status?: ShopProfileChangeRequestStatus | 'all';
    page?: number;
    pageSize?: number;
}

export interface ListShopProfileChangeRequestsResponse {
    items: ShopProfileChangeRequestDto[];
    meta: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

export interface ReviewShopProfileChangeRequestPayload {
    reviewNote?: string;
}

export interface RejectShopProfileChangeRequestPayload {
    reviewNote: string;
}
