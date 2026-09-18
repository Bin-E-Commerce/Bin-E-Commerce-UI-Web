// Kiểm tra mapping trạng thái job thành stepper UI, không gọi API hoặc phụ thuộc React.

import { getOptimizationFlowState } from './optimization-flow.utils';

describe('getOptimizationFlowState', () => {
    const target = getOptimizationFlowState;

    it('should mark the preview generation step active while AI is generating', () => {
        // Arrange
        const input = {
            mode: 'PREVIEW' as const,
            status: 'PROCESSING' as const,
            processingStage: 'GENERATING' as const,
        };

        // Act
        const result = target(input);

        // Assert
        expect(result).toEqual({
            mode: 'PREVIEW',
            activeStepId: 'GENERATE_PREVIEW',
            isComplete: false,
            isError: false,
            steps: [
                { id: 'SOURCE', state: 'COMPLETED' },
                { id: 'PREPARE_PREVIEW', state: 'COMPLETED' },
                { id: 'GENERATE_PREVIEW', state: 'ACTIVE' },
                { id: 'SAVE_PREVIEW', state: 'PENDING' },
                { id: 'PREVIEW_READY', state: 'PENDING' },
            ],
        });
    });

    it('should complete the preview flow when the job requires review', () => {
        // Arrange
        const input = {
            mode: 'PREVIEW' as const,
            status: 'REVIEW_REQUIRED' as const,
            processingStage: 'READY' as const,
        };

        // Act
        const result = target(input);

        // Assert
        expect(result.isComplete).toBe(true);
        expect(result.isError).toBe(false);
        expect(result.activeStepId).toBe('PREVIEW_READY');
        expect(result.steps.every((step) => step.state === 'COMPLETED')).toBe(
            true,
        );
    });

    it('should mark preview generation as failed when the provider rejects the request', () => {
        // Arrange
        const input = {
            mode: 'PREVIEW' as const,
            status: 'FAILED' as const,
            processingStage: 'FAILED' as const,
        };

        // Act
        const result = target(input);

        // Assert
        expect(result.activeStepId).toBe('GENERATE_PREVIEW');
        expect(result.isError).toBe(true);
        expect(result.steps[2].state).toBe('ERROR');
    });

    it('should show high-quality generation while finalization is running', () => {
        // Arrange
        const input = {
            mode: 'FINAL' as const,
            status: 'FINALIZING' as const,
            generationProfile: 'FINAL' as const,
            processingStage: 'GENERATING' as const,
        };

        // Act
        const result = target(input);

        // Assert
        expect(result.activeStepId).toBe('GENERATE_FINAL');
        expect(result.steps).toEqual([
            { id: 'PREVIEW_CONFIRMED', state: 'COMPLETED' },
            { id: 'GENERATE_FINAL', state: 'ACTIVE' },
            { id: 'UPDATE_PRODUCT', state: 'PENDING' },
            { id: 'APPLIED', state: 'PENDING' },
        ]);
    });

    it('should move to product update after the final image is ready', () => {
        // Arrange
        const input = {
            mode: 'FINAL' as const,
            status: 'REVIEW_REQUIRED' as const,
            generationProfile: 'FINAL' as const,
            processingStage: 'READY' as const,
        };

        // Act
        const result = target(input);

        // Assert
        expect(result.activeStepId).toBe('UPDATE_PRODUCT');
        expect(result.steps[1].state).toBe('COMPLETED');
        expect(result.steps[2].state).toBe('ACTIVE');
    });

    it('should mark the failed final generation step as an error', () => {
        // Arrange
        const input = {
            mode: 'FINAL' as const,
            status: 'FAILED' as const,
            generationProfile: 'FINAL' as const,
            processingStage: 'GENERATING' as const,
        };

        // Act
        const result = target(input);

        // Assert
        expect(result.isComplete).toBe(false);
        expect(result.isError).toBe(true);
        expect(result.activeStepId).toBe('GENERATE_FINAL');
        expect(result.steps[1].state).toBe('ERROR');
    });

    it('should complete every final step after the product is applied', () => {
        // Arrange
        const input = {
            mode: 'FINAL' as const,
            status: 'APPLIED' as const,
            generationProfile: 'FINAL' as const,
            processingStage: 'READY' as const,
        };

        // Act
        const result = target(input);

        // Assert
        expect(result).toEqual({
            mode: 'FINAL',
            activeStepId: 'APPLIED',
            isComplete: true,
            isError: false,
            steps: [
                { id: 'PREVIEW_CONFIRMED', state: 'COMPLETED' },
                { id: 'GENERATE_FINAL', state: 'COMPLETED' },
                { id: 'UPDATE_PRODUCT', state: 'COMPLETED' },
                { id: 'APPLIED', state: 'COMPLETED' },
            ],
        });
    });
});
