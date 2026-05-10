'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import type { AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/getErrorMessage';

export function useLoginForm() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

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

    return { form, onSubmit };
}
