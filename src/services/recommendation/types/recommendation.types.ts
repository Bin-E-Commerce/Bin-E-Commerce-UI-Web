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
    recommendationPolicyVersion?: string;
    recommendationExperimentId?: string;
    recommendationExperimentVariant?: 'CONTROL' | 'HYBRID' | 'ML_HYBRID';
}

// Context đã được Recommendation Service ký để nối click của recommendation với hành động add-to-cart sau khi người dùng sang trang chi tiết.
// Các field này chỉ là metadata attribution, không thay thế user identity do API Gateway xác định.
export interface RecommendationAttributionContext {
    recommendationRequestId: string;
    recommendationItemId: string;
    recommendationSource: string;
    recommendationRank: number;
    surface: 'home' | 'product_detail' | 'recommendations_page';
    recommendationPolicyVersion: string;
    recommendationExperimentId?: string;
    recommendationExperimentVariant?: 'CONTROL' | 'HYBRID' | 'ML_HYBRID';
}

import type { PublicProduct } from '@/services/product';

export interface RecommendationItem {
    product: PublicProduct;
    recommendationItemId: string;
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
    rankingPolicyVersion: string;
    rankingModelVersion: string | null;
    experiment: {
        id: string;
        variant: 'CONTROL' | 'HYBRID' | 'ML_HYBRID';
    } | null;
}
