export type ProductCreateStepId =
    | 'basic'
    | 'details'
    | 'sales'
    | 'shipping'
    | 'other';

export interface ProductCreateStepDefinition {
    id: ProductCreateStepId;
    label: string;
    description: string;
}

export interface ProductCreateStepValidation {
    valid: boolean;
    errors: string[];
}

export type ProductCreateStepValidations = Record<
    ProductCreateStepId,
    ProductCreateStepValidation
>;
