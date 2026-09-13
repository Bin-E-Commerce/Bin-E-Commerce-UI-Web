// Queue này gom impression theo nhịp scroll, không sở hữu click/cart tracking và không thay đổi attribution contract.

import {
    getRecommendationSessionId,
    trackRecommendationInteractions,
} from '../api/recommendation.api';
import type { TrackRecommendationInteractionInput } from '../types/recommendation.types';

const IMPRESSION_BATCH_SIZE = 20;
const IMPRESSION_FLUSH_DELAY_MS = 120;

type QueuedImpression = {
    input: TrackRecommendationInteractionInput;
    sessionId: string | null;
};

const pendingImpressions: QueuedImpression[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let flushPromise: Promise<void> | undefined;
const knownImpressionKeys = new Set<string>();

// Tạo khóa ổn định theo recommendation item hoặc product/page để một card remount không phát sinh impression trùng.
function getImpressionKey(input: TrackRecommendationInteractionInput): string {
    return [
        input.productId ?? '',
        input.page ?? '',
        input.recommendationRequestId ?? '',
        input.recommendationItemId ?? '',
    ].join(':');
}

// Đẩy impression vào queue và flush sau một nhịp ngắn; batch tối đa 20 giúp giảm request nhưng không giữ event quá lâu.
export function queueRecommendationImpression(
    input: TrackRecommendationInteractionInput,
): void {
    if (typeof window === 'undefined' || !input.productId) return;

    const key = getImpressionKey(input);
    if (knownImpressionKeys.has(key)) return;
    knownImpressionKeys.add(key);
    pendingImpressions.push({
        input,
        sessionId: getRecommendationSessionId(),
    });

    if (pendingImpressions.length >= IMPRESSION_BATCH_SIZE) {
        void flushRecommendationImpressions();
        return;
    }

    if (!flushTimer) {
        flushTimer = setTimeout(() => {
            flushTimer = undefined;
            void flushRecommendationImpressions();
        }, IMPRESSION_FLUSH_DELAY_MS);
    }
}

// Flush tuần tự để không đảo thứ tự queue; các session khác nhau được tách request để không gán nhầm identity sau login.
async function flushRecommendationImpressions(): Promise<void> {
    if (flushPromise) return flushPromise;

    flushPromise = (async () => {
        while (pendingImpressions.length > 0) {
            const batch = pendingImpressions.splice(0, IMPRESSION_BATCH_SIZE);
            const grouped = new Map<string, QueuedImpression[]>();

            for (const impression of batch) {
                const groupKey = impression.sessionId ?? '';
                const group = grouped.get(groupKey) ?? [];
                group.push(impression);
                grouped.set(groupKey, group);
            }

            // Một session thông thường chỉ tạo một request; group bảo vệ trường hợp session đổi trong lúc queue chờ flush.
            await Promise.all(
                [...grouped.values()].map((group) =>
                    trackRecommendationInteractions(
                        group.map((item) => item.input),
                        group[0]?.sessionId,
                    ).catch(() => undefined),
                ),
            );
        }
    })().finally(() => {
        flushPromise = undefined;
    });

    return flushPromise;
}
