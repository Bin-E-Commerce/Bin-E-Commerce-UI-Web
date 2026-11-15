// Hook điều phối bước nhập OTP, gửi lại mã và đổi mật khẩu; không lưu OTP hay mật khẩu vào URL hoặc storage.
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { authService } from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    resetPasswordSchema,
    type ResetPasswordFormValues,
} from '../schemas/resetPasswordSchema';
import {
    getRemainingResetPasswordCooldown,
    RESET_PASSWORD_RESEND_COOLDOWN_SECONDS,
} from '../utils/reset-password-cooldown';

// Điều phối OTP, đồng bộ cooldown từ sentAt, thu hồi timer khi rời trang và giữ hiện/ẩn riêng cho từng ô mật khẩu.
export function useResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sentAtParam = searchParams.get('sentAt');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const initialEmail = searchParams.get('email')?.trim().toLowerCase() ?? '';
    const [cooldown, setCooldown] = useState(() =>
        getRemainingResetPasswordCooldown(sentAtParam),
    );
    const [isResending, setIsResending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            identifier: initialEmail,
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Dùng chung timer cho sentAt trên URL và lần gửi lại mới; server vẫn là nơi quyết định cooldown cuối cùng.
    const startCooldown = useCallback(
        (duration = RESET_PASSWORD_RESEND_COOLDOWN_SECONDS): void => {
            if (timerRef.current) clearInterval(timerRef.current);
            setCooldown(duration);
            timerRef.current = setInterval(() => {
                setCooldown((current) => {
                    // Chốt ở 0 và dừng interval tại giây cuối để nút gửi lại không bị khóa hoặc chạy số âm.
                    if (current <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        timerRef.current = null;
                        return 0;
                    }
                    return current - 1;
                });
            }, 1000);
        },
        [],
    );

    useEffect(() => {
        // Bắt đầu đếm ngay từ sentAt khi vào trang, rồi dọn interval nếu query đổi hoặc component rời màn hình.
        const initialCooldown = getRemainingResetPasswordCooldown(sentAtParam);
        if (initialCooldown > 0) startCooldown(initialCooldown);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [sentAtParam, startCooldown]);

    // Gửi OTP và đổi mật khẩu; chỉ điều hướng sau khi backend xác nhận thành công để tránh mất lỗi nghiệp vụ.
    async function onSubmit(values: ResetPasswordFormValues): Promise<void> {
        try {
            await authService.resetPassword({
                identifier: values.identifier.trim().toLowerCase(),
                otp: values.otp,
                newPassword: values.newPassword,
            });
            toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
            router.replace('/login');
        } catch (error: unknown) {
            form.setError('root', { message: getErrorMessage(error) });
        }
    }

    // Gọi lại endpoint forgot-password để tạo OTP mới, nhưng giữ thông báo chung nhằm chống dò email.
    async function onResend(): Promise<void> {
        if (cooldown > 0 || isResending) return;

        const validEmail = await form.trigger('identifier');
        if (!validEmail) return;

        setIsResending(true);
        try {
            await authService.forgotPassword({
                email: form.getValues('identifier').trim().toLowerCase(),
            });
            form.clearErrors('root');
            startCooldown();
            toast.success('Nếu email tồn tại, mã OTP mới đã được gửi.');
        } catch (error: unknown) {
            form.setError('root', { message: getErrorMessage(error) });
        } finally {
            setIsResending(false);
        }
    }

    return {
        form,
        cooldown,
        isResending,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        onSubmit,
        onResend,
    };
}
