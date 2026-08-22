'use client';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useChangePasswordForm } from '../hooks/useChangePasswordForm';
import { PasswordInput } from './PasswordInput';

// Form đổi mật khẩu hiển thị các trường nhập và trạng thái xử lý của request đổi mật khẩu.
export function ChangePasswordForm() {
    const { form, onSubmit } = useChangePasswordForm();

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
            >
                {form.formState.errors.root && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{form.formState.errors.root.message}</span>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-zinc-800">
                                Mật khẩu hiện tại
                            </FormLabel>
                            <FormControl>
                                <PasswordInput
                                    field={field}
                                    placeholder="Nhập mật khẩu hiện tại"
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
                            <FormLabel className="text-sm font-medium text-zinc-800">
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
                            <FormLabel className="text-sm font-medium text-zinc-800">
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

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="h-12 w-full rounded-xl bg-zinc-950 text-base font-semibold text-white shadow-sm hover:bg-zinc-800"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Đang xử lý...
                            </span>
                        ) : (
                            'Đổi mật khẩu'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
