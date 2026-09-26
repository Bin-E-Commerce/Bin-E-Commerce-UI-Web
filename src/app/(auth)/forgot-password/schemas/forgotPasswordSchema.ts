// Schema kiểm tra email trước khi gửi yêu cầu OTP; file không chứa nội dung UI hay gọi API.
import { z } from 'zod';

// Giữ validation ở client đồng nhất với DTO backend và tránh tạo request không cần thiết.
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email không được để trống')
        .email('Email không hợp lệ')
        .max(255, 'Email không được dài quá 255 ký tự'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
