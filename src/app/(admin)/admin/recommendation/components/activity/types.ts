// Kiểu dùng chung bên trong activity panel, lấy trực tiếp từ contract Admin API.

import type {
    RecommendationAdminActivityItem,
    RecommendationAdminActorsResponse,
} from '@/services/admin';

export type ActivityActor = RecommendationAdminActorsResponse['items'][number];
export type ActivityItem = RecommendationAdminActivityItem;
