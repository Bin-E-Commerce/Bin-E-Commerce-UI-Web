// Adapter Admin Recommendation gọi qua Gateway; không gọi trực tiếp Recommendation Service từ browser.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    RecommendationAdminActorsResponse,
    RecommendationAdminActivityResponse,
    RecommendationAdminOverview,
    RecommendationAdminExperiment,
    RecommendationAdminPolicy,
    UpdateRecommendationPolicyPayload,
} from '../types/recommendation.types';

export interface RecommendationAnalyticsRange {
    from: string;
    to: string;
}

export const adminRecommendationService = {
    // Lấy KPI aggregate trong khoảng mặc định do backend giới hạn 31 ngày.
    getOverview: (range?: RecommendationAnalyticsRange) =>
        authorizedAxios
            .get<RecommendationAdminOverview>(
                `${API_VERSION}/admin/recommendation/overview`,
                { params: range },
            )
            .then((response) => response.data),

    // Lấy aggregate từng variant để Admin kiểm tra A/B trước khi tăng traffic treatment.
    getExperiments: (range?: RecommendationAnalyticsRange) =>
        authorizedAxios
            .get<
                RecommendationAdminExperiment[]
            >(`${API_VERSION}/admin/recommendation/experiments`, { params: range })
            .then((response) => response.data),

    // Lấy danh sách user/session có activity, phục vụ màn hình điều tra theo tài khoản.
    getActors: (
        params: RecommendationAnalyticsRange & {
            page: number;
            pageSize: number;
            actorType?: 'USER' | 'SESSION';
            search?: string;
        },
    ) =>
        authorizedAxios
            .get<RecommendationAdminActorsResponse>(
                `${API_VERSION}/admin/recommendation/users`,
                { params },
            )
            .then((response) => response.data),

    // Lấy một trang event recommendation của user theo đúng khoảng thời gian đang xem.
    getUserActivity: (
        userId: string,
        params: RecommendationAnalyticsRange & {
            page: number;
            pageSize: number;
        },
    ) =>
        authorizedAxios
            .get<RecommendationAdminActivityResponse>(
                `${API_VERSION}/admin/recommendation/users/${encodeURIComponent(userId)}/activity`,
                { params },
            )
            .then((response) => response.data),

    // Đọc policy runtime và version active.
    getPolicy: () =>
        authorizedAxios
            .get<RecommendationAdminPolicy>(
                `${API_VERSION}/admin/recommendation/config`,
            )
            .then((response) => response.data),

    // Cập nhật policy đã được backend normalize, audit và activate atomically.
    updatePolicy: (payload: UpdateRecommendationPolicyPayload) =>
        authorizedAxios
            .patch<RecommendationAdminPolicy>(
                `${API_VERSION}/admin/recommendation/config`,
                payload,
            )
            .then((response) => response.data),

    // Đọc lịch sử policy để hiển thị rollback có kiểm soát.
    getPolicyHistory: () =>
        authorizedAxios
            .get<
                RecommendationAdminPolicy[]
            >(`${API_VERSION}/admin/recommendation/config/history`)
            .then((response) => response.data),

    // Rollback theo version, vẫn tạo active version mới để audit không bị mất lịch sử.
    rollbackPolicy: (version: string) =>
        authorizedAxios
            .post<RecommendationAdminPolicy>(
                `${API_VERSION}/admin/recommendation/config/rollback/${encodeURIComponent(version)}`,
            )
            .then((response) => response.data),
};
