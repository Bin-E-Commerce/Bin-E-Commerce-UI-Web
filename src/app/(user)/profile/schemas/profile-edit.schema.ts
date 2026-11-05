// Schema kiểm tra dữ liệu hồ sơ theo giới hạn của Auth Service trước khi gửi API.
import { z } from 'zod';

// Tên được chuẩn hóa khoảng trắng ở hai đầu và tuân theo giới hạn lưu trong users.name.
export const profileEditSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Họ và tên cần có ít nhất 2 ký tự.')
        .max(100, 'Họ và tên không được vượt quá 100 ký tự.'),
    // Cho phép chuỗi rỗng để xóa số đã lưu; các giá trị còn lại phải đúng định dạng di động Việt Nam.
    phone: z
        .string()
        .trim()
        .regex(
            /^(?:|0[3-9][0-9]{8})$/,
            'Số điện thoại cần có 10 chữ số và bắt đầu bằng đầu số hợp lệ.',
        ),
});
