// Nhãn lý do hoàn hàng dùng chung giữa form tạo mới và hộp thoại chỉnh sửa.

import type { ReturnReasonOption } from '../types/returns/order-return-edit-dialog.types';

export const RETURN_REASONS: ReturnReasonOption[] = [
    { value: 'DAMAGED', label: 'Sản phẩm bị hư hỏng' },
    { value: 'WRONG_ITEM', label: 'Giao sai sản phẩm' },
    { value: 'MISSING_ITEM', label: 'Thiếu sản phẩm' },
    { value: 'NOT_AS_DESCRIBED', label: 'Không đúng mô tả' },
    { value: 'CHANGE_OF_MIND', label: 'Không còn nhu cầu' },
];
