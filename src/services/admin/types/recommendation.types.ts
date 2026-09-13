// Contract Admin Recommendation phản ánh aggregate và account/product projection đã được kiểm soát quyền truy cập.

export interface RecommendationAdminOverview {
    range: { from: string; to: string };
    totals: {
        events: number;
        totalInteractions: number;
        eventBreakdown: {
            productViews: number;
            impressions: number;
            clicks: number;
            searches: number;
            cartAdds: number;
            cartRemovals: number;
            purchaseCompleted: number;
            purchaseReturned: number;
        };
        impressions: number;
        clicks: number;
        cartAdds: number;
        totalCartAdds: number;
        uniqueActors: number;
        clickThroughRate: number;
        clickToCartRate: number;
    };
    daily: Array<{
        day: string;
        events: number;
        productViews: number;
        impressions: number;
        clicks: number;
        searches: number;
        cartAdds: number;
        cartRemovals: number;
        purchaseCompleted: number;
        purchaseReturned: number;
    }>;
    topProducts: Array<{
        productId: string;
        productName: string | null;
        imageUrl: string | null;
        originType: 'INTERNAL' | 'EXTERNAL' | null;
        events: number;
        clicks: number;
        cartAdds: number;
    }>;
}

export interface RecommendationAdminExperiment {
    experimentId: string;
    variant: string;
    events: number;
    impressions: number;
    clicks: number;
    cartAdds: number;
    clickThroughRate: number;
    clickToCartRate: number;
}

export interface RecommendationAdminActorsResponse {
    items: Array<{
        actorId: string;
        actorType: 'USER' | 'SESSION';
        lastInteractionAt: string;
        events: number;
        clicks: number;
        cartAdds: number;
        account: RecommendationAdminAccount | null;
    }>;
    page: number;
    pageSize: number;
    total: number;
}

export interface RecommendationAdminAccount {
    keycloakId: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
}

export interface RecommendationAdminActivityItem {
    eventId: string;
    interactionType: string;
    productId: string | null;
    productName: string | null;
    productImageUrl: string | null;
    recommendationRequestId: string | null;
    recommendationSource: string | null;
    recommendationRank: number | null;
    surface: string | null;
    occurredAt: string;
}

export interface RecommendationAdminActivityResponse {
    items: RecommendationAdminActivityItem[];
    page: number;
    pageSize: number;
    total: number;
}

export interface RecommendationPolicyConfig {
    hybridWeights: Record<string, number>;
    mlEnabled: boolean;
    mlBlend: number;
}

export interface RecommendationAdminPolicy {
    id?: string;
    version: string;
    status: string;
    config: RecommendationPolicyConfig;
    createdBy: string | null;
    reason: string | null;
    createdAt: string | null;
}

export interface UpdateRecommendationPolicyPayload {
    hybridWeights: Record<string, number>;
    mlEnabled: boolean;
    mlBlend: number;
    reason?: string;
}
