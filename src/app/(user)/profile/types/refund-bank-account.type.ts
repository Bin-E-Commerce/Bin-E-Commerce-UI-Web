// Types của form tài khoản nhận hoàn và props các thẻ ngân hàng thuộc hồ sơ Customer.
import type { z } from 'zod';

import type { RefundBankAccountProfile } from '@/services/auth';
import type { refundBankAccountSchema } from '../schemas/refund-bank-account.schema';

export type RefundBankAccountFormValues = z.infer<
    typeof refundBankAccountSchema
>;

export interface RefundBankAccountDialogProps {
    account: RefundBankAccountProfile | null;
    isOpen: boolean;
    isSaving: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (account: RefundBankAccountProfile) => Promise<unknown>;
}

export interface RefundBankAccountCardProps {
    userId: string;
}
