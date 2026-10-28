// Kiểu props cho bảng đối soát COD của trang tài chính admin.
// Bảng nhận dữ liệu và callback từ component sở hữu truy vấn/mutation.
import type { AdminFinanceCodRemittance } from '@/services/admin/types/finance.types';

// Bảng COD giữ input theo orderId và không tự quản lý tải dữ liệu hoặc xác nhận sổ tiền.
export interface CodRemittanceTableProps {
    items: AdminFinanceCodRemittance[];
    references: Record<string, string>;
    pendingOrderId: string | undefined;
    isPending: boolean;
    onReferenceChange: (orderId: string, value: string) => void;
    onConfirm: (orderId: string, reference: string) => void;
}
