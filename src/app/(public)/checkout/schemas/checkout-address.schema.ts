// Schema này định nghĩa các quy tắc validate địa chỉ mới trên frontend checkout.
// Schema chỉ kiểm tra dữ liệu người dùng nhập và lựa chọn; Location Service vẫn là nguồn xác thực tên địa danh.

import { z } from 'zod';

const ADDRESS_LABELS = [
    'Nhà riêng',
    'Cơ quan',
    'Nhà bố mẹ',
    'Nhà trọ',
    'Khác',
] as const;

// Kiểm tra số điện thoại Việt Nam theo cùng định dạng mà Auth Service đang chấp nhận.
const vietnamPhoneSchema = z
    .string()
    .trim()
    .regex(/^0[3-9][0-9]{8}$/, 'Số điện thoại không hợp lệ.');

// Kiểm tra form địa chỉ trước khi tạo bản ghi, giúp lỗi hiển thị ngay tại đúng trường trên UI.
export const checkoutAddressSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, 'Vui lòng nhập tên người nhận.')
        .max(100, 'Tên người nhận tối đa 100 ký tự.'),
    phone: vietnamPhoneSchema,
    provinceId: z
        .string()
        .uuid('Vui lòng chọn tỉnh/thành phố từ danh sách.'),
    wardId: z
        .string()
        .uuid('Vui lòng chọn phường/xã từ danh sách.'),
    label: z.enum(ADDRESS_LABELS, {
        error: 'Vui lòng chọn nhãn địa chỉ.',
    }),
    street: z
        .string()
        .trim()
        .min(1, 'Vui lòng nhập địa chỉ chi tiết.')
        .max(500, 'Địa chỉ chi tiết tối đa 500 ký tự.'),
});

export type CheckoutAddressFormState = z.infer<typeof checkoutAddressSchema>;
