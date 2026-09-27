// Public facade của Recommendation Service để component chỉ phụ thuộc vào contract tracking cần dùng.

export {
    getRecommendations,
    mergeRecommendationSession,
    trackRecommendationInteraction,
    trackRecommendationInteractions,
} from './api/recommendation.api';
export { queueRecommendationImpression } from './tracking/impression-queue';
export {
    clearRecommendationSession,
    getRecommendationSessionId,
} from './session/recommendation-session';
export {
    clearRecommendationAttribution,
    getStoredRecommendationAttribution,
    rememberRecommendationAttribution,
} from './tracking/recommendation-attribution';
export { useRecommendationSessionId } from './hooks/use-recommendation-session';
export type {
    RecommendationAttributionContext,
    RecommendationInteractionType,
    TrackRecommendationInteractionInput,
} from './types/recommendation.types';
