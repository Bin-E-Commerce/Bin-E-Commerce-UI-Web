// Public facade của Recommendation Service để component chỉ phụ thuộc vào contract tracking cần dùng.

export {
    getRecommendationSessionId,
    getRecommendations,
    mergeRecommendationSession,
    trackRecommendationInteraction,
} from './api/recommendation.api';
export type {
    RecommendationInteractionType,
    TrackRecommendationInteractionInput,
} from './types/recommendation.types';
