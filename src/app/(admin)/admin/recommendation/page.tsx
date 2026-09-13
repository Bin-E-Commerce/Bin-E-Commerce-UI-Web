import { AdminRecommendationPageClient } from './components/AdminRecommendationPageClient';

// Route mỏng, shell admin và accessProfile chịu trách nhiệm authentication/authorization.
export default function AdminRecommendationPage() {
    return <AdminRecommendationPageClient />;
}
