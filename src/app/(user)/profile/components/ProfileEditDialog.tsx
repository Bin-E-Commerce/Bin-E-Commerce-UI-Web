// Dialog chỉnh sửa tên và điện thoại; email đăng nhập và ngày tạo vẫn thuộc thông tin chỉ xem.
'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Mail, PencilLine, Phone, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileEditSchema } from '../schemas/profile-edit.schema';
import type {
    ProfileEditDialogProps,
    ProfileEditFormValues,
} from '../types/profile-edit.type';
import { useUpdateProfile } from '../hooks/useUpdateProfile';

// Dialog xác thực dữ liệu nhập trước khi gọi Auth Service và giữ nguyên nội dung nếu lưu thất bại.
export function ProfileEditDialog({ user }: ProfileEditDialogProps) {
    const [open, setOpen] = useState(false);
    const { isPending, updateProfile } = useUpdateProfile();
    const form = useForm<ProfileEditFormValues>({
        resolver: zodResolver(profileEditSchema),
        defaultValues: {
            name: user.name,
            phone: user.phone ?? '',
        },
    });

    // Mỗi lần mở form, bỏ bản nháp cũ và lấy dữ liệu mới nhất từ Auth state.
    useEffect(() => {
        if (open) {
            form.reset({
                name: user.name,
                phone: user.phone ?? '',
            });
        }
    }, [form, open, user.name, user.phone]);

    // Gửi số điện thoại trống thành null để backend xóa giá trị; nếu request lỗi thì giữ dialog mở cho lần thử lại.
    async function handleSubmit(values: ProfileEditFormValues): Promise<void> {
        try {
            await updateProfile({
                name: values.name,
                phone: values.phone || null,
            });
            setOpen(false);
        } catch {
            // Hook đã hiển thị lỗi; giữ lại bản nháp để người dùng có thể sửa hoặc gửi lại.
        }
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl border-zinc-200 px-3.5"
                onClick={() => setOpen(true)}
            >
                <PencilLine className="size-4" />
                Chỉnh sửa
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                    <DialogHeader className="border-b border-zinc-100 px-6 py-5 pr-14">
                        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                            <UserRound className="size-5" />
                        </div>
                        <DialogTitle className="text-lg font-semibold text-zinc-950">
                            Chỉnh sửa thông tin cá nhân
                        </DialogTitle>
                        <DialogDescription>
                            Cập nhật tên hiển thị và số điện thoại liên hệ.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="space-y-5 px-6 py-5"
                        onSubmit={form.handleSubmit(handleSubmit)}
                    >
                        <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3.5">
                            <Mail className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-zinc-500">
                                    Email đăng nhập
                                </p>
                                <p className="mt-1 break-all text-sm font-medium text-zinc-800">
                                    {user.email}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Email không thể thay đổi tại đây.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-name">Họ và tên</Label>
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    id="profile-name"
                                    autoComplete="name"
                                    maxLength={100}
                                    className="h-11 rounded-xl pl-10"
                                    aria-invalid={Boolean(
                                        form.formState.errors.name,
                                    )}
                                    aria-describedby={
                                        form.formState.errors.name
                                            ? 'profile-name-error'
                                            : undefined
                                    }
                                    placeholder="Nhập họ và tên"
                                    {...form.register('name')}
                                />
                            </div>
                            {form.formState.errors.name?.message ? (
                                <p
                                    id="profile-name-error"
                                    className="text-xs text-destructive"
                                >
                                    {form.formState.errors.name.message}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-phone">
                                Số điện thoại{' '}
                                <span className="font-normal text-zinc-400">
                                    (không bắt buộc)
                                </span>
                            </Label>
                            <div className="relative">
                                <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                                <Input
                                    id="profile-phone"
                                    type="tel"
                                    autoComplete="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    className="h-11 rounded-xl pl-10"
                                    aria-invalid={Boolean(
                                        form.formState.errors.phone,
                                    )}
                                    aria-describedby={
                                        form.formState.errors.phone
                                            ? 'profile-phone-error'
                                            : 'profile-phone-help'
                                    }
                                    placeholder="Ví dụ: 0912345678"
                                    {...form.register('phone')}
                                />
                            </div>
                            {form.formState.errors.phone?.message ? (
                                <p
                                    id="profile-phone-error"
                                    className="text-xs text-destructive"
                                >
                                    {form.formState.errors.phone.message}
                                </p>
                            ) : (
                                <p
                                    id="profile-phone-help"
                                    className="text-xs leading-5 text-zinc-500"
                                >
                                    Nhập số di động Việt Nam gồm 10 chữ số; để
                                    trống nếu muốn xóa số đã lưu.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-xl px-4"
                                disabled={isPending}
                                onClick={() => setOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="h-10 rounded-xl px-4"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : null}
                                {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
