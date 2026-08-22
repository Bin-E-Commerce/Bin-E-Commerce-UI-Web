import type { z } from 'zod';

import type {
    SellerRegisterFieldErrors,
    sellerRegisterSchema,
} from '../schemas/seller-register.schema';

export type SellerRegisterFormValues = z.input<typeof sellerRegisterSchema>;
export type SellerRegisterObjectSection = Exclude<
    keyof SellerRegisterFormValues,
    'acceptedTerms'
>;
export type { SellerRegisterFieldErrors };
