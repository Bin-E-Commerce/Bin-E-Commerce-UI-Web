// Kiểm tra lịch hiển thị cảnh báo hạ tầng theo timezone Việt Nam và các mốc biên.

import { isWithinSupportHours } from '../support-hours';

describe('isWithinSupportHours', () => {
    it('should allow weekday support hours at 09:00 Vietnam time', () => {
        // Arrange
        const mondayAtNineInVietnam = new Date('2026-09-28T02:00:00.000Z');

        // Act
        const result = isWithinSupportHours(mondayAtNineInVietnam);

        // Assert
        expect(result).toBe(true);
    });

    it('should reject weekday support hours at 18:00 Vietnam time', () => {
        // Arrange
        const mondayAtSixInVietnam = new Date('2026-09-28T11:00:00.000Z');

        // Act
        const result = isWithinSupportHours(mondayAtSixInVietnam);

        // Assert
        expect(result).toBe(false);
    });

    it('should allow Saturday morning before 12:00 Vietnam time', () => {
        // Arrange
        const saturdayAtElevenInVietnam = new Date('2026-10-03T04:00:00.000Z');

        // Act
        const result = isWithinSupportHours(saturdayAtElevenInVietnam);

        // Assert
        expect(result).toBe(true);
    });

    it('should reject Saturday at 12:00 and all Sunday times', () => {
        // Arrange
        const saturdayAtNoonInVietnam = new Date('2026-10-03T05:00:00.000Z');
        const sundayAtTenInVietnam = new Date('2026-10-04T03:00:00.000Z');

        // Act
        const saturdayResult = isWithinSupportHours(saturdayAtNoonInVietnam);
        const sundayResult = isWithinSupportHours(sundayAtTenInVietnam);

        // Assert
        expect(saturdayResult).toBe(false);
        expect(sundayResult).toBe(false);
    });
});
