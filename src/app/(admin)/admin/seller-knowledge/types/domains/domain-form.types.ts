// Kiểu form nhóm nội dung được suy ra từ schema để đồng bộ dữ liệu và validation.

import type { z } from 'zod';
import { sellerKnowledgeDomainFormSchema } from '../../schemas/seller-knowledge-domain.schema';

export type SellerKnowledgeDomainForm = z.infer<
    typeof sellerKnowledgeDomainFormSchema
>;
