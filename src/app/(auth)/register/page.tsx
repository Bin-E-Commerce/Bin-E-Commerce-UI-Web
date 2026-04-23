'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
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

const registerSchema = z
    .object({
        firstName: z
            .string()
            .min(1, 'Họ không được để trống')
            .max(50, 'Họ quá dài'),
        lastName: z
            .string()
            .min(1, 'Tên không được để trống')
            .max(50, 'Tên quá dài'),
        email: z
            .string()
            .min(1, 'Email không được để trống')
            .email('Email không hợp lệ'),
        password: z
            .string()
            .min(8, 'Mật khẩu ít nhất 8 ký tự')
            .max(100, 'Mật khẩu quá dài'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    function onSubmit(values: RegisterFormValues) {
        // TODO: call authService.register
        console.log(values);
    }

    return (
        <div className="space-y-7">
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="space-y-1.5">
                <h1 className="text-[1.75rem] font-bold tracking-tight text-zinc-900">
                    Tạo tài khoản
                </h1>
                <p className="text-sm text-zinc-500">
                    Điền thông tin bên dưới để bắt đầu mua sắm.
                </p>
            </div>

            {/* ── Form ────────────────────────────────────────────────── */}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    {/* Họ + Tên */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-zinc-700">
                                        Họ
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <Input
                                                placeholder="Nguyễn"
                                                autoComplete="given-name"
                                                className="h-11 bg-white pl-9 text-sm"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-zinc-700">
                                        Tên
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="An"
                                            autoComplete="family-name"
                                            className="h-11 bg-white text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

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
                                            className="h-11 bg-white pl-10 text-sm"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    {/* Mật khẩu */}
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
                                            placeholder="Ít nhất 8 ký tự"
                                            autoComplete="new-password"
                                            className="h-11 bg-white pl-10 pr-10 text-sm"
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
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    {/* Xác nhận mật khẩu */}
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-zinc-700">
                                    Xác nhận mật khẩu
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        <Input
                                            type={
                                                showConfirm
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="Nhập lại mật khẩu"
                                            autoComplete="new-password"
                                            className="h-11 bg-white pl-10 pr-10 text-sm"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirm((v) => !v)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700"
                                            aria-label={
                                                showConfirm
                                                    ? 'Ẩn mật khẩu'
                                                    : 'Hiện mật khẩu'
                                            }
                                        >
                                            {showConfirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

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
                                Đang tạo tài khoản…
                            </span>
                        ) : (
                            'Tạo tài khoản'
                        )}
                    </Button>
                </form>
            </Form>

            {/* ── Terms ───────────────────────────────────────────────── */}
            <p className="text-center text-xs leading-relaxed text-zinc-400">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <Link
                    href="/terms"
                    className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
                >
                    Điều khoản
                </Link>{' '}
                và{' '}
                <Link
                    href="/privacy"
                    className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
                >
                    Chính sách bảo mật
                </Link>
                .
            </p>

            {/* ── Login Link ──────────────────────────────────────────── */}
            <p className="text-center text-sm text-zinc-500 mt-4">
                Đã có tài khoản?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-zinc-900 underline underline-offset-4 transition-colors hover:text-zinc-600"
                >
                    Đăng nhập
                </Link>
            </p>
        </div>
    );
}
