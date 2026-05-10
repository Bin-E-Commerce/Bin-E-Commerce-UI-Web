'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
import { ProfileSidebar } from '@/components/layout/profile-sidebar';

const securitySchema = z
    .object({
        currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
        newPassword: z
            .string()
            .min(8, 'Mật khẩu mới ít nhất 8 ký tự')
            .max(100, 'Mật khẩu quá dài'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Mật khẩu xác nhận không khớp',
    });

type SecurityFormValues = z.infer<typeof securitySchema>;

function PasswordInput({
    field,
    placeholder,
}: {
    field: object;
    placeholder: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                className="h-11 bg-white pl-10 pr-10 text-sm"
                {...field}
            />
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}

export default function SecurityPage() {
    const form = useForm<SecurityFormValues>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(_values: SecurityFormValues): Promise<void> {
        // TODO: call authService.changePassword when endpoint is available
        toast.info('Tính năng đổi mật khẩu sẽ sớm được cập nhật.');
        form.reset();
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-2xl font-bold text-zinc-900">
                Tài khoản của tôi
            </h1>
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <div className="flex-1">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 font-semibold text-zinc-900">
                            Đổi mật khẩu
                        </h2>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="max-w-md space-y-4"
                            >
                                {form.formState.errors.root && (
                                    <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>
                                            {form.formState.errors.root.message}
                                        </span>
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-zinc-700">
                                                Mật khẩu hiện tại
                                            </FormLabel>
                                            <FormControl>
                                                <PasswordInput
                                                    field={field}
                                                    placeholder="••••••••"
                                                />
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
                                                <PasswordInput
                                                    field={field}
                                                    placeholder="Ít nhất 8 ký tự"
                                                />
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
                                                <PasswordInput
                                                    field={field}
                                                    placeholder="Nhập lại mật khẩu mới"
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
                                            Đang xử lý…
                                        </span>
                                    ) : (
                                        'Đổi mật khẩu'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
