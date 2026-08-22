import { z } from 'zod';

export const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, 'Họ không được để trống')
            .max(50, 'Họ quá dài'),
        lastName: z
            .string()
            .min(1, 'Tên không được để trống')
            .max(50, 'Tên quá dài'),
        email: z
            .string()
            .min(1, 'Email không được để trống')
            .email('Email không hợp lệ'),
        password: z
            .string()
            .min(8, 'Mật khẩu ít nhất 8 ký tự')
            .max(100, 'Mật khẩu quá dài'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
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

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
