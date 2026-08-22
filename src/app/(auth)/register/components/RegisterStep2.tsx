'use client';

import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import type { UseFormReturn } from 'react-hook-form';
import type { OtpFormValues } from '../schemas/registerSchema';

interface RegisterStep2Props {
    form: UseFormReturn<OtpFormValues>;
    pendingEmail: string;
    cooldown: number;
    onSubmit: (values: OtpFormValues) => Promise<void>;
    onResend: () => Promise<void>;
    onBack: () => void;
}

export function RegisterStep2({
    form,
    pendingEmail,
    cooldown,
    onSubmit,
    onResend,
    onBack,
}: RegisterStep2Props) {
    return (
        <>
            <div className="space-y-1.5">
                <h1 className="text-[1.75rem] font-bold tracking-tight text-zinc-900">
                    Xác nhận email
                </h1>
                <p className="text-sm text-zinc-500">
                    Nhập mã 6 chữ số đã gửi đến{' '}
                    <span className="font-medium text-zinc-700">
                        {pendingEmail}
                    </span>
                    .
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {form.formState.errors.root && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{form.formState.errors.root.message}</span>
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-zinc-700">
                                    Mã OTP
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            placeholder="123456"
                                            autoComplete="one-time-code"
                                            className="h-11 bg-white pl-10 text-sm tracking-[0.25em]"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="h-11 w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Đang xác thực…
                            </span>
                        ) : (
                            'Xác nhận'
                        )}
                    </Button>
                </form>
            </Form>

            <div className="flex items-center justify-between text-sm">
                <button
                    type="button"
                    onClick={onBack}
                    className="text-zinc-500 transition-colors hover:text-zinc-900"
                >
                    ← Quay lại
                </button>
                <button
                    type="button"
                    onClick={onResend}
                    disabled={cooldown > 0}
                    className="font-medium text-zinc-900 transition-colors hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại OTP'}
                </button>
            </div>
        </>
    );
}
