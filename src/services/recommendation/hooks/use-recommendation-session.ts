// Hook này khởi tạo guest session sau khi browser mount; không đọc localStorage trong render để tránh SSR hydration mismatch.

'use client';

import { useEffect, useState } from 'react';

import { getRecommendationSessionId } from '../api/recommendation.api';
import { RECOMMENDATION_SESSION_CHANGED_EVENT } from '../session';

// Trả session ID ổn định cho query key và chỉ cho phép request chạy sau khi client đã hydrate.
export function useRecommendationSessionId(): string | null {
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        const syncSessionId = () => setSessionId(getRecommendationSessionId());
        syncSessionId();
        window.addEventListener(RECOMMENDATION_SESSION_CHANGED_EVENT, syncSessionId);
        return () =>
            window.removeEventListener(
                RECOMMENDATION_SESSION_CHANGED_EVENT,
                syncSessionId,
            );
    }, []);

    return sessionId;
}
