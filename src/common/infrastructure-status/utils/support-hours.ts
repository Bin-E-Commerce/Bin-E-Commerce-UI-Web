// Tiện ích xác định giờ hỗ trợ theo múi giờ Việt Nam.
// File này chỉ xử lý lịch hiển thị cảnh báo, không sở hữu request hoặc state UI.

const SUPPORT_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const SUPPORT_START_MINUTE = 9 * 60;
const WEEKDAY_SUPPORT_END_MINUTE = 18 * 60;
const SATURDAY_SUPPORT_END_MINUTE = 12 * 60;

type VietnamTimeParts = {
    weekday: string;
    hour: number;
    minute: number;
};

const vietnamTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SUPPORT_TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

// Chuyển thời điểm bất kỳ về các thành phần lịch tại Việt Nam để máy người dùng ở timezone khác vẫn áp dụng đúng giờ hỗ trợ.
function getVietnamTimeParts(date: Date): VietnamTimeParts {
    const parts = vietnamTimeFormatter.formatToParts(date);
    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, part.value]),
    );

    return {
        weekday: values.weekday,
        hour: Number(values.hour),
        minute: Number(values.minute),
    };
}

// Kiểm tra khoảng thời gian nửa kín [09:00, giờ kết thúc), tránh hiển thị cảnh báo đúng thời điểm hết giờ.
export function isWithinSupportHours(date: Date = new Date()): boolean {
    const { weekday, hour, minute } = getVietnamTimeParts(date);
    const currentMinute = hour * 60 + minute;

    if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)) {
        return (
            currentMinute >= SUPPORT_START_MINUTE &&
            currentMinute < WEEKDAY_SUPPORT_END_MINUTE
        );
    }

    return (
        weekday === 'Sat' &&
        currentMinute >= SUPPORT_START_MINUTE &&
        currentMinute < SATURDAY_SUPPORT_END_MINUTE
    );
}
