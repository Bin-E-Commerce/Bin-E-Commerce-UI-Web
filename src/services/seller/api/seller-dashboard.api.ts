// Transport adapter cho dashboard snapshot; authorizedAxios giữ seller scope từ session hiện tại.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    SellerDashboardRange,
    SellerDashboardSnapshot,
} from '@/services/seller/types/seller-dashboard.types';

const SELLER_DASHBOARD_OVERVIEW = `${API_VERSION}/seller/dashboard/overview`;

// Lấy toàn bộ dữ liệu dashboard bằng một request để các card cùng một thời điểm snapshot.
export async function getSellerDashboardOverview(
    range: SellerDashboardRange,
): Promise<SellerDashboardSnapshot> {
    const response = await authorizedAxios.get<SellerDashboardSnapshot>(
        SELLER_DASHBOARD_OVERVIEW,
        { params: { range } },
    );
    return response.data;
}
