import { z } from 'zod';

// U+FFFD xuất hiện khi một chuỗi đã bị giải mã sai; chặn ký tự này để dữ liệu lỗi không được ghi ngược về hồ sơ shop.
function hasValidUnicodeText(value: string): boolean {
    return !value.includes('\uFFFD');
}

export const shopProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, 'Tên shop phải có ít nhất 3 ký tự.')
        .max(120, 'Tên shop không được vượt quá 120 ký tự.'),
    description: z
        .string()
        .trim()
        .max(1000, 'Mô tả shop không được vượt quá 1000 ký tự.')
        .refine(
            hasValidUnicodeText,
            'Mô tả shop chứa ký tự lỗi. Vui lòng nhập lại nội dung.',
        ),
    logoUrl: z.string().url('Logo shop chưa được tải lên hợp lệ.'),
    contactEmail: z
        .string()
        .trim()
        .email('Email liên hệ không hợp lệ.')
        .max(255, 'Email liên hệ quá dài.'),
    contactPhone: z
        .string()
        .trim()
        .regex(
            /^0\d{9}$/,
            'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.',
        ),
});

export type ShopProfileFormValues = z.infer<typeof shopProfileSchema>;
