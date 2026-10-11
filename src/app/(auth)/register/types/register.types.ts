// File này giữ các kiểu form riêng của luồng đăng ký, tách khỏi component và schema.
import type { UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';
import type { otpSchema, registerSchema } from '../schemas/registerSchema';

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;

export interface RegisterStep1Props {
    form: UseFormReturn<RegisterFormValues>;
    onSubmit: (values: RegisterFormValues) => Promise<void>;
    handleGoogleLogin: () => Promise<void>;
    isGoogleLoading: boolean;
}

export interface RegisterStep2Props {
    form: UseFormReturn<OtpFormValues>;
    pendingEmail: string;
    cooldown: number;
    onSubmit: (values: OtpFormValues) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
}
