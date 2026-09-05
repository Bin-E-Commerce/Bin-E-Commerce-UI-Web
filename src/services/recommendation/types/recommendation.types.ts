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
}
