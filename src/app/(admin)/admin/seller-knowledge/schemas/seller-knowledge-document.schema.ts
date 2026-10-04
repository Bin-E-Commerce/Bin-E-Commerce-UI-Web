// Schema form tài liệu; kiểm tra metadata và Markdown trước khi gửi API.

import { z } from 'zod';

// Các metadata bắt buộc và nội dung Markdown được kiểm tra tại submit; ngày hiệu lực chỉ kiểm tra thứ tự khi cả hai được nhập.
export const sellerKnowledgeDocumentFormSchema = z
    .object({
        title: z.string().trim().min(1, 'Vui lòng nhập tên tài liệu.'),
        slug: z.string().trim().min(1, 'Mã tài liệu chưa được tạo.'),
        domainCode: z.string().trim().min(1, 'Vui lòng chọn nhóm nội dung.'),
        language: z.enum(['vi', 'en']),
        effectiveFrom: z.string(),
        effectiveTo: z.string(),
        markdown: z
            .string()
            .trim()
            .min(1, 'Vui lòng nhập nội dung tài liệu.')
            .max(64 * 1024, 'Nội dung không được vượt quá 64 KB.')
            .refine(
                (markdown) =>
                    new TextEncoder().encode(markdown).byteLength <= 64 * 1024,
                'Nội dung không được vượt quá 64 KB.',
            ),
    })
    .refine(
        ({ effectiveFrom, effectiveTo }) =>
            !effectiveFrom || !effectiveTo || effectiveFrom <= effectiveTo,
        {
            path: ['effectiveTo'],
            message: 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.',
        },
    );
