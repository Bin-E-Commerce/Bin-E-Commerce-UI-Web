'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
    registerSchema,
    otpSchema,
    type RegisterFormValues,
    type OtpFormValues,
} from '../schemas/registerSchema';
import type { AppDispatch } from '@/store';
import { setAuth } from '@/store/slices/authSlice';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useConfetti } from '@/hooks/useConfetti';

const RESEND_COOLDOWN = 60;

export function useRegisterForm() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { fire: fireConfetti } = useConfetti();

    const [step, setStep] = useState<1 | 2>(1);
    const [pendingEmail, setPendingEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const otpForm = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    function startCooldown() {
        setCooldown(RESEND_COOLDOWN);
        timerRef.current = setInterval(() => {
            setCooldown((s) => {
                if (s <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
    }

    useEffect(
        () => () => {
            if (timerRef.current) clearInterval(timerRef.current);
        },
        [],
    );

    async function onSubmitRegister(values: RegisterFormValues): Promise<void> {
        try {
            const name = `${values.firstName} ${values.lastName}`.trim();
            await authService.registerInitiate({
                email: values.email,
                name,
                password: values.password,
            });
            setPendingEmail(values.email);
            toast.success(`Mã OTP đã gửi đến ${values.email}`);
            setStep(2);
            startCooldown();
        } catch (err: unknown) {
            registerForm.setError('root', { message: getErrorMessage(err) });
        }
    }

    async function onSubmitOtp(values: OtpFormValues): Promise<void> {
        try {
            const res = await authService.registerVerify({
                identifier: pendingEmail,
                otp: values.otp,
            });
            dispatch(
                setAuth({
                    accessToken: res.data.accessToken,
                    user: res.data.user,
                }),
            );
            fireConfetti();
            toast.success('Đăng ký thành công! Chào mừng bạn!');
            router.push('/');
        } catch (err: unknown) {
            otpForm.setError('root', { message: getErrorMessage(err) });
        }
    }

    async function onResend(): Promise<void> {
        if (cooldown > 0) return;
        try {
            const values = registerForm.getValues();
            const name = `${values.firstName} ${values.lastName}`.trim();
            await authService.registerInitiate({
                email: pendingEmail,
                name,
                password: values.password,
            });
            toast.success('Mã OTP mới đã được gửi đến email của bạn.');
            startCooldown();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err));
        }
    }

    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
            toast.error(getErrorMessage(err));
            setIsGoogleLoading(false);
        }
    }

    return {
        step,
        setStep,
        pendingEmail,
        cooldown,
        registerForm,
        otpForm,
        onSubmitRegister,
        onSubmitOtp,
        onResend,
        handleGoogleLogin,
        isGoogleLoading,
    };
}
