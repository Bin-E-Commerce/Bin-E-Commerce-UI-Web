// Kiểm tra popup giới thiệu không cạnh tranh với cảnh báo hạ tầng hoặc request đang treo.

import { canShowFeaturePopup } from '../popup-priority';

describe('canShowFeaturePopup', () => {
    it.each([
        [false, false, true],
        [true, false, false],
        [false, true, false],
        [true, true, false],
    ])(
        'should return %s when pending=%s and infrastructureOpen=%s',
        (hasPendingRequests, isInfrastructureAlertOpen, expected) => {
            // Arrange
            const input = {
                hasPendingRequests,
                isInfrastructureAlertOpen,
            };

            // Act
            const result = canShowFeaturePopup(input);

            // Assert
            expect(result).toBe(expected);
        },
    );
});
