// Schema kiểm tra toàn bộ dữ liệu reset trước khi gửi OTP và mật khẩu mới tới Auth Service.
import { z } from 'zod';

// Các rule mật khẩu bám đúng ResetPasswordDto để lỗi được phát hiện ngay trên giao diện.
export const resetPasswordSchema = z
    .object({
        identifier: z
            .string()
            .trim()
            .min(1, 'Email không được để trống')
            .email('Email không hợp lệ')
            .max(255, 'Email không được dài quá 255 ký tự'),
        otp: z
            .string()
            .length(6, 'Mã OTP gồm 6 chữ số')
            .regex(/^\d{6}$/, 'Mã OTP chỉ gồm chữ số'),
        newPassword: z
            .string()
            .min(8, 'Mật khẩu mới có ít nhất 8 ký tự')
            .max(128, 'Mật khẩu mới không được dài quá 128 ký tự')
            .regex(/(?=.*[A-Z])/, 'Mật khẩu phải có ít nhất một chữ hoa')
            .regex(/(?=.*\d)/, 'Mật khẩu phải có ít nhất một chữ số'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
