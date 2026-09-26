// Kiểm tra monitor request: threshold 8 giây, gộp cảnh báo và cleanup timer sau khi request kết thúc.

import {
    beginInfrastructureRequest,
    INFRASTRUCTURE_PENDING_THRESHOLD_MS,
    subscribeInfrastructureStatus,
} from './infrastructure-status.monitor';

describe('infrastructure status monitor', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-10-03T05:01:00.000Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should detect one pending request after eight seconds', () => {
        // Arrange
        const events: unknown[] = [];
        const unsubscribe = subscribeInfrastructureStatus((event) =>
            events.push(event),
        );
        const stopTracking = beginInfrastructureRequest();

        // Act
        jest.advanceTimersByTime(INFRASTRUCTURE_PENDING_THRESHOLD_MS);

        // Assert
        expect(events).toContainEqual({
            type: 'pending-changed',
            hasPendingRequests: true,
        });
        expect(events).toContainEqual({
            type: 'warning-detected',
            reason: 'request-pending',
        });

        stopTracking();
        unsubscribe();
    });

    it('should not warn when a request finishes before the threshold', () => {
        // Arrange
        const events: unknown[] = [];
        const unsubscribe = subscribeInfrastructureStatus((event) =>
            events.push(event),
        );
        const stopTracking = beginInfrastructureRequest();

        // Act
        jest.advanceTimersByTime(7_999);
        stopTracking();
        jest.advanceTimersByTime(1);

        // Assert
        expect(events).not.toContainEqual({
            type: 'warning-detected',
            reason: 'request-pending',
        });
        unsubscribe();
    });

    it('should delay a pending warning during server operating hours', () => {
        // Arrange
        jest.setSystemTime(new Date('2026-10-03T04:00:00.000Z'));
        const events: unknown[] = [];
        const unsubscribe = subscribeInfrastructureStatus((event) =>
            events.push(event),
        );
        const stopTracking = beginInfrastructureRequest();

        // Act
        jest.advanceTimersByTime(INFRASTRUCTURE_PENDING_THRESHOLD_MS);

        // Assert
        expect(events).not.toContainEqual({
            type: 'warning-detected',
            reason: 'request-pending',
        });
        stopTracking();
        unsubscribe();
    });

    it('should emit only one warning for multiple requests in the same incident', () => {
        // Arrange
        const events: unknown[] = [];
        const unsubscribe = subscribeInfrastructureStatus((event) =>
            events.push(event),
        );
        const firstStop = beginInfrastructureRequest();
        const secondStop = beginInfrastructureRequest();

        // Act
        jest.advanceTimersByTime(INFRASTRUCTURE_PENDING_THRESHOLD_MS);

        // Assert
        expect(
            events.filter(
                (event) =>
                    JSON.stringify(event) ===
                    JSON.stringify({
                        type: 'warning-detected',
                        reason: 'request-pending',
                    }),
            ),
        ).toHaveLength(1);

        firstStop();
        secondStop();
        unsubscribe();
    });

    it('should detect infrastructure error and ignore a business error', () => {
        // Arrange
        const events: unknown[] = [];
        const unsubscribe = subscribeInfrastructureStatus((event) =>
            events.push(event),
        );
        const serverStop = beginInfrastructureRequest();
        const businessStop = beginInfrastructureRequest();

        // Act
        serverStop({ response: { status: 503 } });
        businessStop({ response: { status: 400 } });

        // Assert
        expect(events).toContainEqual({
            type: 'warning-detected',
            reason: 'server-unavailable',
        });
        expect(
            events.filter((event) =>
                JSON.stringify(event).includes('warning-detected'),
            ),
        ).toHaveLength(1);
        unsubscribe();
    });
});
