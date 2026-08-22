'use client';

import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { authService } from '@/services/auth';
import { type AppDispatch, type RootState } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
    securitySchema,
    type SecurityFormValues,
} from '../constants/security-schema.constant';

// Quản lý form đổi mật khẩu và gọi API, tách khỏi UI để component chỉ tập trung render.
export function useChangePasswordForm() {
    const dispatch = useDispatch<AppDispatch>();
    const sessionId = useSelector((state: RootState) => state.auth.sessionId);
    const form = useForm<SecurityFormValues>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    // Gọi API đổi mật khẩu, truyền sessionId để backend cấp phiên mới và thu hồi các phiên cũ.
    async function onSubmit(values: SecurityFormValues): Promise<void> {
        try {
            const res = await authService.changePassword(
                {
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                },
                sessionId,
            );

            // Keycloak có thể vô hiệu refresh token cũ sau khi đổi mật khẩu, nên phải lưu token/session mới ngay.
            dispatch(
                setAuth({
                    accessToken: res.data.accessToken,
                    sessionId: res.data.sessionId,
                    user: res.data.user,
                }),
            );

            toast.success(
                'Đổi mật khẩu thành công. Các thiết bị khác đã được đăng xuất.',
            );
            form.reset();
        } catch (error) {
            form.setError('root', { message: getErrorMessage(error) });
        }
    }

    return {
        form,
        onSubmit,
    };
}
