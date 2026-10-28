// Kiểu props cho các thẻ tổng quan tài chính của admin.
// Dashboard chỉ trình bày snapshot và hồ sơ shop; tải dữ liệu thuộc trang cha.
import type {
    AdminFinanceDeposit,
    AdminFinanceSnapshot,
} from '@/services/admin/types/finance.types';

// Chỉ số dashboard dùng snapshot đã được backend giới hạn quyền truy cập.
export interface FinanceMetricsProps {
    overview: AdminFinanceSnapshot;
}

// Thẻ giao dịch nạp chỉ nhận các khoản đã có trong snapshot finance.
export interface FinanceContextCardsProps {
    deposits: AdminFinanceDeposit[];
}
