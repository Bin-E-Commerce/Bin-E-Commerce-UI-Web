// Test các biên thời gian của cooldown resend; không cần mount React hay gọi API thật.
import {
    getRemainingResetPasswordCooldown,
    RESET_PASSWORD_RESEND_COOLDOWN_SECONDS,
} from './reset-password-cooldown';

describe('getRemainingResetPasswordCooldown', () => {
    it('should return the full cooldown immediately after the OTP request', () => {
        // Arrange
        const sentAt = 1_000_000;

        // Act
        const result = getRemainingResetPasswordCooldown(
            String(sentAt),
            sentAt,
        );

        // Assert
        expect(result).toBe(RESET_PASSWORD_RESEND_COOLDOWN_SECONDS);
    });

    it('should return the remaining seconds after time has elapsed', () => {
        // Arrange
        const sentAt = 1_000_000;

        // Act
        const result = getRemainingResetPasswordCooldown(
            String(sentAt),
            sentAt + 12_500,
        );

        // Assert
        expect(result).toBe(48);
    });

    it('should return zero for an invalid or expired timestamp', () => {
        // Arrange
        const sentAt = 1_000_000;

        // Act
        const invalidResult = getRemainingResetPasswordCooldown('invalid');
        const expiredResult = getRemainingResetPasswordCooldown(
            String(sentAt),
            sentAt + 60_000,
        );

        // Assert
        expect(invalidResult).toBe(0);
        expect(expiredResult).toBe(0);
    });
});
