// Public facade của Recommendation Service để component chỉ phụ thuộc vào contract tracking cần dùng.

export {
    getRecommendationSessionId,
    getRecommendations,
    mergeRecommendationSession,
    trackRecommendationInteraction,
    trackRecommendationInteractions,
} from './api/recommendation.api';
export { queueRecommendationImpression } from './tracking/impression-queue';
export { clearRecommendationSession } from './session';
export {
    clearRecommendationAttribution,
    getStoredRecommendationAttribution,
    rememberRecommendationAttribution,
} from './attribution';
export { useRecommendationSessionId } from './hooks/use-recommendation-session';
export type {
    RecommendationAttributionContext,
    RecommendationInteractionType,
    TrackRecommendationInteractionInput,
} from './types/recommendation.types';
