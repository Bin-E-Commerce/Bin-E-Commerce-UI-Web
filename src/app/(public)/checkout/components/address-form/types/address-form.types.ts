// Khai báo các kiểu dùng chung cho form địa chỉ checkout và combobox GHN.

import type { Control, FieldPath } from 'react-hook-form';
import type { CreateAddressPayload, UserAddress } from '@/services/auth';
import type {
    GhnDistrictOption,
    GhnProvinceOption,
    GhnWardOption,
} from '@/services/shipping/shipping-location.service';
import type { CheckoutAddressFormState } from '@/app/(public)/checkout/schemas/checkout-address.schema';

export type GhnLocationOption =
    | GhnProvinceOption
    | GhnDistrictOption
    | GhnWardOption;

export interface AddressFormProps {
    pending: boolean;
    onSubmit: (payload: CreateAddressPayload) => Promise<boolean>;
    initialAddress?: UserAddress;
    onCancel?: () => void;
}

export interface AddressFieldProps {
    control: Control<CheckoutAddressFormState>;
    name: FieldPath<CheckoutAddressFormState>;
    label: string;
    wide?: boolean;
    select?: boolean;
}

export interface GhnFieldProps<T extends GhnLocationOption> {
    control: Control<CheckoutAddressFormState>;
    name: FieldPath<CheckoutAddressFormState>;
    label: string;
    options: T[];
    disabled?: boolean;
    loading?: boolean;
    error?: string | null;
    onChange: (value: string, change: (value: string) => void) => void;
}

export interface GhnSelectProps<T extends GhnLocationOption> {
    value: string;
    options: T[];
    placeholder: string;
    disabled?: boolean;
    loading?: boolean;
    onChange: (value: string) => void;
}
