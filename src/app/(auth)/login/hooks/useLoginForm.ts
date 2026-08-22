'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { authService } from '@/services/auth';
import type { AuthUser } from '@/services/auth';
import type { AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { canAccessAdmin, getDefaultAdminPath } from '@/services/auth/access';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';

// Điều phối form đăng nhập, bao gồm validate, gọi API và redirect theo quyền sau khi xác thực thành công.
export function useLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    // Ưu tiên redirect hợp lệ trên URL; nếu không có thì đưa admin/support tới trang đầu tiên họ được phép.
    function resolveLoginRedirect(user?: AuthUser): string {
        const redirect = searchParams.get('redirect');
        if (redirect?.startsWith('/')) return redirect;
        return canAccessAdmin(user) ? getDefaultAdminPath(user) : '/';
    }

    // Gửi thông tin đăng nhập, lưu token vào Redux và chuyển trang theo quyền tài khoản.
    async function onSubmit(values: LoginFormValues): Promise<void> {
        try {
            const res = await authService.login(values);
            dispatch(
                setAuth({
                    accessToken: res.data.accessToken,
                    sessionId: res.data.sessionId,
                    user: res.data.user,
                }),
            );
            toast.success('Đăng nhập thành công!');
            router.push(resolveLoginRedirect(res.data.user));
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            form.setError('root', { message: msg });
        }
    }

    // Chuyển sang Keycloak Google login và lưu state để callback kiểm tra chống CSRF.
    async function handleGoogleLogin(): Promise<void> {
        setIsGoogleLoading(true);
        try {
            const res = await authService.getSocialAuthUrl('google');
            sessionStorage.setItem(
                'oauth_state',
                JSON.stringify({ state: res.data.state, provider: 'google' }),
            );
            window.location.href = res.data.authUrl;
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            form.setError('root', { message: msg });
            setIsGoogleLoading(false);
        }
    }

    return { form, onSubmit, handleGoogleLogin, isGoogleLoading };
}
