'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import type { AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function useLoginForm() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    async function onSubmit(values: LoginFormValues): Promise<void> {
        try {
            const res = await authService.login(values);
            dispatch(
                setAuth({
                    accessToken: res.data.accessToken,
                    user: res.data.user,
                }),
            );
            toast.success('Đăng nhập thành công!');
            router.push('/');
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            form.setError('root', { message: msg });
        }
    }

    async function handleGoogleLogin(): Promise<void> {
        setIsGoogleLoading(true);
        try {
            const res = await authService.getSocialAuthUrl('google');
            // Lưu state + provider vào sessionStorage để callback page xác thực chống CSRF
            sessionStorage.setItem(
                'oauth_state',
                JSON.stringify({ state: res.data.state, provider: 'google' }),
            );
            // Redirect toàn trang đến Keycloak Google login
            window.location.href = res.data.authUrl;
        } catch (err: unknown) {
            const msg = getErrorMessage(err);
            form.setError('root', { message: msg });
            setIsGoogleLoading(false);
        }
    }

    return { form, onSubmit, handleGoogleLogin, isGoogleLoading };
}
