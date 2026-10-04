// Kiểu dữ liệu form tài liệu được suy ra từ schema để validation và UI không lệch contract.

import type { z } from 'zod';
import { sellerKnowledgeDocumentFormSchema } from '../../schemas/seller-knowledge-document.schema';

export type SellerKnowledgeDocumentForm = z.infer<
    typeof sellerKnowledgeDocumentFormSchema
>;
