// File này chuyển lỗi kỹ thuật từ Axios/backend thành thông báo an toàn, dễ hiểu cho UI.
// Không đưa stack trace, API key, prompt hoặc chi tiết provider vào thông báo hiển thị cho người dùng.

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
    'Upstream service unavailable':
        'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
    'OTP not found. Please request a new one.':
        'Mã OTP không tồn tại. Vui lòng yêu cầu mã mới.',
    'The required AI permission is missing.':
        'Tài khoản chưa được cấp quyền sử dụng trợ lý AI.',
    'The AI request contains invalid or unsupported data.':
        'Dữ liệu gửi tới trợ lý AI chưa hợp lệ hoặc chưa được hỗ trợ.',
    'The AI provider is temporarily unavailable.':
        'Dịch vụ AI đang tạm thời không khả dụng. Vui lòng thử lại sau.',
    'The AI provider is not configured.':
        'Dịch vụ AI chưa được cấu hình đầy đủ.',
    'The AI provider returned an unusable response.':
        'AI trả về kết quả không hợp lệ. Vui lòng thử lại.',
    'Too many AI requests. Please try again later.':
        'Bạn đã sử dụng hết lượt AI tạm thời. Vui lòng thử lại sau.',
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
        // Đây là lỗi proxy dùng chung cho nhiều service, không được suy diễn thành lỗi AI.
        if (serverMsg === 'Upstream service unavailable') {
            return err.response?.status
                ? `Dịch vụ tạm thời không khả dụng (${err.response.status}). Vui lòng thử lại sau.`
                : VI_ERROR_MAP[serverMsg];
        }

        // Khi backend không có message nghiệp vụ cụ thể, giữ status để người dùng biết đây là lỗi máy chủ.
        if (err.response?.status && err.response.status >= 500 && !VI_ERROR_MAP[serverMsg]) {
            return `Lỗi máy chủ (${err.response.status}). Vui lòng thử lại sau.`;
        }

        return VI_ERROR_MAP[serverMsg] ?? serverMsg;
    }
    if (err instanceof Error) {
        return err.message;
    }
    return 'Lỗi không xác định';
}
