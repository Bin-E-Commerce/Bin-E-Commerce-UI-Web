// Contract public của shop dùng cho trang customer.
// Không đưa email, phone, compliance hoặc địa chỉ đầy đủ vào read model này.

export type PublicShopStatus = 'active' | 'suspended' | 'closed';

export interface PublicShopResponse {
    shop: {
        id: string;
        slug: string;
        name: string;
        logoUrl: string;
        description: string | null;
        mainCategoryId: string;
        status: PublicShopStatus;
        createdAt: string;
        location: {
            province: string | null;
            district: string | null;
        };
    };
    stats: {
        followerCount: number;
        followingCount: number;
    };
    activity: {
        isOnline: boolean;
        lastActiveAt: string | null;
    };
    isFollowing: boolean;
}
