// Schema form nhóm nội dung; giữ riêng validation của domain khỏi biểu mẫu tài liệu.

import { z } from 'zod';

// Mã nhóm có thể được sinh tự động từ tên; admin bắt buộc nhập tên và phạm vi để tránh nhóm mơ hồ.
export const sellerKnowledgeDomainFormSchema = z.object({
    code: z.string(),
    label: z.string().trim().min(1, 'Vui lòng nhập tên nhóm.'),
    description: z.string().trim().min(1, 'Vui lòng mô tả phạm vi nhóm.'),
    examples: z.string(),
});
