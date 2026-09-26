// Kiểm tra bộ phân loại chỉ nhận lỗi hạ tầng, không nuốt lỗi nghiệp vụ của feature.

import { isInfrastructureError } from '../infrastructure-error';

describe('isInfrastructureError', () => {
    it.each([502, 503, 504])(
        'should classify gateway status %s as infrastructure failure',
        (status) => {
            // Arrange
            const error = { response: { status } };

            // Act
            const result = isInfrastructureError(error);

            // Assert
            expect(result).toBe(true);
        },
    );

    it.each(['ECONNABORTED', 'ETIMEDOUT', 'ERR_NETWORK'])(
        'should classify Axios code %s as infrastructure failure',
        (code) => {
            // Arrange
            const error = { code };

            // Act
            const result = isInfrastructureError(error);

            // Assert
            expect(result).toBe(true);
        },
    );

    it('should ignore business and authorization errors', () => {
        // Arrange
        const errors = [
            { response: { status: 400 } },
            { response: { status: 401 } },
            { response: { status: 403 } },
            { response: { status: 404 } },
            { code: 'ERR_CANCELED' },
        ];

        // Act
        const results = errors.map((error) => isInfrastructureError(error));

        // Assert
        expect(results).toEqual([false, false, false, false, false]);
    });
});
