// File này là nguồn quy tắc validate phía trình duyệt cho đăng ký và OTP.
// DTO Auth Service áp cùng giới hạn ở biên API; xác nhận mật khẩu chỉ tồn tại ở FE.
import { z } from 'zod';

// Cho phép chữ Unicode (kể cả dấu tiếng Việt), ngăn số/ký tự lạ nhưng chấp nhận tên ghép.
const personNamePattern =
    /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;

export const registerSchema = z
    .object({
        firstName: z
            .string()
            .trim()
            .min(1, 'Họ không được để trống')
            .max(50, 'Họ không được vượt quá 50 ký tự')
            .regex(
                personNamePattern,
                'Họ chỉ gồm chữ cái, khoảng trắng, dấu nháy hoặc gạch nối',
            ),
        lastName: z
            .string()
            .trim()
            .min(1, 'Tên không được để trống')
            .max(50, 'Tên không được vượt quá 50 ký tự')
            .regex(
                personNamePattern,
                'Tên chỉ gồm chữ cái, khoảng trắng, dấu nháy hoặc gạch nối',
            ),
        email: z
            .string()
            .trim()
            .toLowerCase()
            .min(1, 'Email không được để trống')
            .max(254, 'Email không được vượt quá 254 ký tự')
            .email('Email không hợp lệ'),
        password: z
            .string()
            .min(8, 'Mật khẩu ít nhất 8 ký tự')
            .max(100, 'Mật khẩu không được vượt quá 100 ký tự')
            .regex(
                /^(?=.*[A-Z])(?=.*\d).+$/,
                'Mật khẩu cần có ít nhất 1 chữ in hoa và 1 chữ số',
            ),
        confirmPassword: z
            .string()
            .min(1, 'Vui lòng xác nhận mật khẩu')
            .max(100, 'Mật khẩu xác nhận không được vượt quá 100 ký tự'),
    })
    // BE nhận họ tên đã ghép trong một trường, nên FE kiểm tra tổng độ dài trước khi gửi.
    .refine((data) => `${data.firstName} ${data.lastName}`.length <= 100, {
        path: ['lastName'],
        message: 'Họ và tên không được vượt quá 100 ký tự',
    })
    // Mật khẩu xác nhận không được gửi lên backend; FE so sánh trước khi gọi API.
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    });

export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, 'Mã OTP gồm 6 chữ số')
        .regex(/^\d{6}$/, 'Mã OTP chỉ gồm chữ số'),
});
