// Form nhập email để yêu cầu OTP; component chỉ render UI và giao submit cho hook của feature.
'use client';

import { AlertCircle, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';

// Render form public với thông báo bảo mật chung và trạng thái submitting rõ ràng cho người dùng.
export function ForgotPasswordForm() {
    const {
        form,
        onSubmit,
        requestedEmail,
        continueToReset,
        requestAnotherEmail,
    } = useForgotPasswordForm();
    const rootErrorMessage = form.formState.errors.root?.message;

    if (requestedEmail) {
        return (
            <div
                role="status"
                className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5"
            >
                <div className="space-y-2 text-sm leading-6 text-zinc-600">
                    <p className="font-semibold text-zinc-900">
                        Yêu cầu đã được tiếp nhận
                    </p>
                    <p>
                        Nếu email{' '}
                        <strong className="font-semibold text-zinc-900">
                            {requestedEmail}
                        </strong>{' '}
                        tồn tại, mã OTP đã được gửi. Hãy kiểm tra hộp thư và thư
                        rác trước khi nhập mã.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        className="h-11 flex-1"
                        onClick={continueToReset}
                    >
                        Nhập mã OTP
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-1"
                        onClick={requestAnotherEmail}
                    >
                        Nhập email khác
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {rootErrorMessage ? (
                    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{rootErrorMessage}</span>
                    </div>
                ) : null}

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-zinc-700">
                                Email tài khoản
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="h-11 bg-white pl-10 text-sm focus-visible:ring-2 focus-visible:ring-zinc-900/20"
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
                            Đang gửi mã...
                        </span>
                    ) : (
                        'Gửi mã xác thực'
                    )}
                </Button>
            </form>
        </Form>
    );
}
