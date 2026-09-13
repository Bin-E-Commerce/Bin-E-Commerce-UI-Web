// Kiểu nội bộ cho timeline overview, suy ra trực tiếp từ contract API để tránh khai báo trùng cấu trúc.

import type { RecommendationAdminOverview } from '@/services/admin';

export type DailyActivity = RecommendationAdminOverview['daily'][number];
export type TopProduct = RecommendationAdminOverview['topProducts'][number];
