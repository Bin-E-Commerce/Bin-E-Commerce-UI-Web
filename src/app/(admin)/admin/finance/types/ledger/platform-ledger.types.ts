// Kiểu props cho bảng sổ tiền và thao tác nhóm/đối soát của admin.
// Component chỉ phát lựa chọn; trang cha sở hữu truy vấn và mutation.
import type { AdminFinanceLedgerEntry } from '@/services/admin/types/finance.types';

// Bảng ledger nhận lựa chọn và callback batch từ trang sở hữu mutation.
export interface PlatformLedgerSectionProps {
    ledger: AdminFinanceLedgerEntry[];
    page: number;
    pageSize: number;
    total: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    onPageChange: (page: number) => void;
    selectedLedgerIds: string[];
    settlementBatchId: string | null;
    isBatchPending: boolean;
    isReconcilePending: boolean;
    onToggleLedgerSelection: (
        entry: AdminFinanceLedgerEntry,
        checked: boolean | 'indeterminate',
    ) => void;
    onCreateBatch: () => void;
    onReconcileBatch: (batchId: string) => void;
}
