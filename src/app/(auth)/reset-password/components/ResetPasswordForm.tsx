// Form nhập OTP và mật khẩu mới; component không tự gọi API mà nhận toàn bộ hành vi từ hook feature.
'use client';

import { AlertCircle, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';

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
import { useResetPasswordForm } from '../hooks/useResetPasswordForm';

// Render các trường reset, giữ password/OTP trong react-hook-form và dùng Button shadcn cho mọi thao tác.
export function ResetPasswordForm() {
    const {
        form,
        cooldown,
        isResending,
        showPassword,
        setShowPassword,
        onSubmit,
        onResend,
    } = useResetPasswordForm();
    const rootErrorMessage = form.formState.errors.root?.message;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
            >
                {rootErrorMessage ? (
                    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{rootErrorMessage}</span>
                    </div>
                ) : null}

                <FormField
                    control={form.control}
                    name="identifier"
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

                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between gap-3">
                                <FormLabel className="text-sm font-medium text-zinc-700">
                                    Mã OTP
                                </FormLabel>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto px-0 text-xs text-zinc-600"
                                    disabled={
                                        cooldown > 0 ||
                                        isResending ||
                                        form.formState.isSubmitting
                                    }
                                    onClick={onResend}
                                >
                                    {isResending
                                        ? 'Đang gửi mã...'
                                        : cooldown > 0
                                        ? `Gửi lại sau ${cooldown}s`
                                        : 'Gửi lại mã'}
                                </Button>
                            </div>
                            <FormControl>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="Nhập 6 chữ số"
                                        autoComplete="one-time-code"
                                        className="h-11 bg-white pl-10 text-sm tracking-[0.3em] focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                                        onChange={(event) =>
                                            field.onChange(
                                                event.target.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 6),
                                            )
                                        }
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-zinc-700">
                                Mật khẩu mới
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Tối thiểu 8 ký tự"
                                        autoComplete="new-password"
                                        className="h-11 bg-white pr-10 text-sm focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={
                                            showPassword
                                                ? 'Ẩn mật khẩu mới'
                                                : 'Hiện mật khẩu mới'
                                        }
                                        className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                                        onClick={() =>
                                            setShowPassword((current) => !current)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-zinc-700">
                                Xác nhận mật khẩu mới
                            </FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Nhập lại mật khẩu mới"
                                    autoComplete="new-password"
                                    className="h-11 bg-white text-sm focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                                />
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
                            Đang cập nhật...
                        </span>
                    ) : (
                        'Đặt lại mật khẩu'
                    )}
                </Button>
            </form>
        </Form>
    );
}
