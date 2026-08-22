export type LocationType = 'province' | 'district' | 'ward';

export interface LocationDto {
    id: string;
    parentId: string | null;
    code: string;
    codename: string | null;
    name: string;
    type: LocationType;
    divisionType: string | null;
    level: number;
    path: string | null;
    phoneCode: string | null;
    isActive: boolean;
    sourcePlatform: string;
    adminVersion: string;
    metadata: {
        sourceWardCount?: number;
        shortCodename?: string | null;
        sourceParentCode?: string;
    };
}

export interface PaginatedLocationResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ListLocationsParams {
    type?: LocationType;
    parentId?: string;
    parentCode?: string;
    search?: string;
    adminVersion?: string;
    page?: number;
    pageSize?: number;
}

