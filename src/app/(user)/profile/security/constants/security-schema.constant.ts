import { z } from 'zod';

// Schema kiểm tra mật khẩu ngay trên client để người dùng nhận lỗi trước khi gọi API.
export const securitySchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, 'Vui lòng nhập mật khẩu hiện tại'),
        newPassword: z
            .string()
            .min(8, 'Mật khẩu mới cần ít nhất 8 ký tự')
            .max(100, 'Mật khẩu quá dài'),
        confirmPassword: z
            .string()
            .min(1, 'Vui lòng xác nhận mật khẩu mới'),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    })
    .refine((value) => value.currentPassword !== value.newPassword, {
        path: ['newPassword'],
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    });

export type SecurityFormValues = z.infer<typeof securitySchema>;
