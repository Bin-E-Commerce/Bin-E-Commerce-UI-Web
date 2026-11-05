// Schema kiểm tra thông tin chuyển khoản trước khi gửi; quy tắc được đồng bộ lại ở Auth Service.
import { z } from 'zod';

import { BANK_OPTIONS } from '@/constants/bank-options.constant';

const ACCOUNT_HOLDER_PATTERN = /^\p{L}[\p{L}\p{M}]*(?:[ .'-][\p{L}\p{M}]+)*$/u;

// Giới hạn tên theo bộ ký tự Auth Service chấp nhận; vẫn phải nhập khớp tên ngân hàng hiển thị.
export const refundBankAccountSchema = z.object({
    bankCode: z
        .string()
        .min(1, 'Vui lòng chọn ngân hàng nhận tiền.')
        .refine(
            (value) => BANK_OPTIONS.some((bank) => bank.value === value),
            'Ngân hàng không nằm trong danh sách hỗ trợ.',
        ),
    accountHolder: z
        .string()
        .trim()
        .min(2, 'Tên chủ tài khoản cần có ít nhất 2 ký tự.')
        .max(100, 'Tên chủ tài khoản không được vượt quá 100 ký tự.')
        .refine(
            (value) =>
                ACCOUNT_HOLDER_PATTERN.test(
                    value
                        .normalize('NFC')
                        .replace(/\s+/gu, ' ')
                        .toLocaleUpperCase('vi-VN'),
                ),
            "Tên chỉ gồm chữ cái, khoảng trắng, dấu chấm (.), dấu nháy đơn ('), hoặc dấu gạch nối (-).",
        ),
    accountNumber: z
        .string()
        .trim()
        .regex(/^\d{6,30}$/, 'Số tài khoản phải có từ 6 đến 30 chữ số.'),
});
