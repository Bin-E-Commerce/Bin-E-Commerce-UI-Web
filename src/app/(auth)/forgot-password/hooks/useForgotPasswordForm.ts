// Hook điều phối form quên mật khẩu, quản lý validation, gọi API public và trạng thái xác nhận trước bước OTP.
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    forgotPasswordSchema,
    type ForgotPasswordFormValues,
} from '../schemas/forgotPasswordSchema';

// Gửi email đã chuẩn hóa rồi chuyển sang trang nhập OTP; phản hồi backend luôn được xử lý theo thông báo chung để chống dò tài khoản.
export function useForgotPasswordForm() {
    const router = useRouter();
    const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
    const [requestedAt, setRequestedAt] = useState<number | null>(null);
    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    // Gửi email đã chuẩn hóa và giữ trạng thái xác nhận chung vì backend không tiết lộ email có tồn tại để chống dò tài khoản.
    async function onSubmit(values: ForgotPasswordFormValues): Promise<void> {
        const email = values.email.trim().toLowerCase();

        try {
            await authService.forgotPassword({ email });
            setRequestedEmail(email);
            setRequestedAt(Date.now());
            form.clearErrors('root');
        } catch (error: unknown) {
            form.setError('root', { message: getErrorMessage(error) });
        }
    }

    // Chỉ chuyển sang màn hình OTP sau thao tác rõ ràng của người dùng.
    // sentAt là metadata UI để giữ cooldown resend, không phải token xác thực.
    function continueToReset(): void {
        if (!requestedEmail || !requestedAt) return;

        router.push(
            `/reset-password?email=${encodeURIComponent(requestedEmail)}&sentAt=${requestedAt}`,
        );
    }

    // Cho phép người dùng sửa email mà không giữ lại trạng thái xác nhận cũ.
    function requestAnotherEmail(): void {
        setRequestedEmail(null);
        setRequestedAt(null);
        form.reset({ email: '' });
    }

    return {
        form,
        onSubmit,
        requestedEmail,
        continueToReset,
        requestAnotherEmail,
    };
}
