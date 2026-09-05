// Public facade của Recommendation Service để component chỉ phụ thuộc vào contract tracking cần dùng.

export { trackRecommendationInteraction } from './api/recommendation.api';
export type {
    RecommendationInteractionType,
    TrackRecommendationInteractionInput,
} from './types/recommendation.types';
