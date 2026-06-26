import { z } from 'zod';

export const PHONE_PATTERN = /^(0|\+84)\d{9,10}$/;
export const SHOP_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Tạo schema chuỗi đã trim để các form dùng chung cùng một cách kiểm tra min/max.
export function trimmedStringSchema(options: {
    min: number;
    max: number;
    minMessage: string;
    maxMessage: string;
}) {
    return z
        .string()
        .trim()
        .min(options.min, options.minMessage)
        .max(options.max, options.maxMessage);
}

// Dùng chung cho số điện thoại Việt Nam theo rule đang được backend chấp nhận.
export function vietnamPhoneSchema(message: string) {
    return z.string().trim().regex(PHONE_PATTERN, message);
}

// Dùng chung cho các combobox lưu id UUID lấy từ database.
export function uuidSelectionSchema(message: string) {
    return z.string().trim().regex(UUID_PATTERN, message);
}

// Cho phép bỏ trống URL tùy chọn, nhưng nếu đã nhập thì phải là URL tuyệt đối có protocol.
export function optionalAbsoluteUrlSchema(message: string) {
    return z.string().trim().refine((value) => !value || isAbsoluteUrl(value), {
        message,
    });
}

// Dùng cho các field bắt buộc lưu URL tài nguyên đã upload, ví dụ logo shop sau khi lên media-service.
export function requiredAbsoluteUrlSchema(
    requiredMessage: string,
    urlMessage: string,
) {
    return z
        .string()
        .trim()
        .min(1, requiredMessage)
        .refine(isAbsoluteUrl, { message: urlMessage });
}

// Kiểm tra URL tuyệt đối để khớp với @IsUrl({ require_protocol: true }) ở backend.
function isAbsoluteUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return Boolean(url.protocol && url.host);
    } catch {
        return false;
    }
}
