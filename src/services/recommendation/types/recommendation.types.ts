// Contract frontend gửi tới Recommendation Service; userId và identity nhạy cảm luôn do Gateway bổ sung.

export type RecommendationInteractionType =
    | 'PRODUCT_VIEWED'
    | 'PRODUCT_CLICKED'
    | 'PRODUCT_IMPRESSED'
    | 'SEARCH_PERFORMED'
    | 'PRODUCT_ADDED_TO_CART'
    | 'PRODUCT_REMOVED_FROM_CART';

export interface TrackRecommendationInteractionInput {
    interactionType: RecommendationInteractionType;
    productId?: string;
    variantId?: string;
    categoryId?: string;
    query?: string;
    page?: string;
    position?: number;
    quantity?: number;
    recommendationRequestId?: string;
    recommendationItemId?: string;
    recommendationSource?: string;
    recommendationRank?: number;
    surface?: 'home' | 'product_detail' | 'recommendations_page';
}

import type { PublicProduct } from '@/services/product';

export interface RecommendationItem {
    product: PublicProduct;
    rank: number;
    score: number;
    source: string;
    reasons: string[];
}

export interface RecommendationResponse {
    requestId: string;
    strategy: 'PERSONALIZED' | 'SESSION_BASED' | 'COLD_START';
    profileState: 'USER' | 'GUEST' | 'NEW_USER';
    items: RecommendationItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    generatedAt: string;
    ruleVersion: string;
}
