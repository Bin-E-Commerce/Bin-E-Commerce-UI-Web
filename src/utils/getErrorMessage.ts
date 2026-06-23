import axios from 'axios';

const VI_ERROR_MAP: Record<string, string> = {
    'Email already registered': 'Email đã được đăng ký',
    'Account not found': 'Sai email hoặc mật khẩu',
    'Invalid credentials': 'Sai email hoặc mật khẩu',
    'Current password is incorrect': 'Mật khẩu hiện tại không đúng',
    'New password must be different from current password':
        'Mật khẩu mới phải khác mật khẩu hiện tại',
    'Account is inactive or banned': 'Tài khoản đã bị vô hiệu hóa',
    'OTP is invalid or expired': 'Mã OTP không hợp lệ hoặc đã hết hạn',
    'Invalid or expired OTP': 'Mã OTP không hợp lệ hoặc đã hết hạn',
    'Refresh token is invalid or expired': 'Phiên đăng nhập đã hết hạn',
    'Missing session context': 'Không xác định được phiên đăng nhập hiện tại',
    'Too many requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    'Internal server error': 'Lỗi hệ thống, vui lòng thử lại sau',
    'OTP not found. Please request a new one.':
        'Mã OTP không tồn tại. Vui lòng yêu cầu mã mới.',
};

// Chuẩn hóa lỗi từ Axios hoặc Error thường thành thông báo tiếng Việt dễ hiểu cho giao diện.
export function getErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        // Backend có thể trả message là string, mảng validation hoặc object; toast chỉ nên nhận một câu ngắn.
        const rawMessage = err.response?.data?.message ?? err.message;
        const serverMsg =
            typeof rawMessage === 'string'
                ? rawMessage
                : Array.isArray(rawMessage)
                  ? rawMessage[0]
                  : 'Request failed';
        return VI_ERROR_MAP[serverMsg] ?? serverMsg;
    }
    if (err instanceof Error) {
        return err.message;
    }
    return 'Lỗi không xác định';
}
