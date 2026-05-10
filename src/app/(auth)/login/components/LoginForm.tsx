'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
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
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { form, onSubmit } = useLoginForm();

    return (
        <div className="space-y-7">
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="space-y-1.5">
                <h1 className="text-[1.75rem] font-bold tracking-tight text-zinc-900">
                    Chào mừng trở lại
                </h1>
                <p className="text-sm text-zinc-500">
                    Vui lòng nhập thông tin đăng nhập của bạn.
                </p>
            </div>

            {/* ── Form ────────────────────────────────────────────────── */}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* Server error */}
                    {form.formState.errors.root && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{form.formState.errors.root.message}</span>
                        </div>
                    )}

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-zinc-700">
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            type="email"
                                            placeholder="ban@example.com"
                                            autoComplete="email"
                                            className="h-11 bg-white pl-10 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-zinc-700">
                                    Mật khẩu
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className="h-11 bg-white pl-10 pr-10 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700"
                                            aria-label={
                                                showPassword
                                                    ? 'Ẩn mật khẩu'
                                                    : 'Hiện mật khẩu'
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 cursor-pointer" />
                                            ) : (
                                                <Eye className="h-4 w-4 cursor-pointer" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <Link
                        href="/forgot-password"
                        className="flex justify-end text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                        <span>Quên mật khẩu?</span>
                    </Link>

                    {/* Submit */}
                    <Button
                        type="submit"
                        variant="default"
                        className="h-11 w-full"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Đang đăng nhập…
                            </span>
                        ) : (
                            'Đăng nhập'
                        )}
                    </Button>
                </form>
            </Form>

            {/* ── Divider ─────────────────────────────────────────────── */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-zinc-50 px-3 text-xs text-zinc-400">
                        Hoặc tiếp tục với
                    </span>
                </div>
            </div>

            {/* ── Social placeholder ───────────────────────────────────── */}
            <Button
                variant="outline"
                type="button"
                className="h-11 w-full border-zinc-200 bg-white text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                disabled
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Google{' '}
                <span className="ml-1 text-xs text-zinc-400">(sắp có)</span>
            </Button>

            <p className="text-center text-sm text-zinc-500">
                Chưa có tài khoản?{' '}
                <Link
                    href="/register"
                    className="font-semibold text-zinc-900 underline underline-offset-4 transition-colors hover:text-zinc-600"
                >
                    Đăng ký miễn phí
                </Link>
            </p>
        </div>
    );
}
