'use client';

import Link from 'next/link';
import { RegisterStep1 } from './components/RegisterStep1';
import { RegisterStep2 } from './components/RegisterStep2';
import { useRegisterForm } from './hooks/useRegisterForm';

export default function RegisterPage() {
    const {
        step,
        setStep,
        pendingEmail,
        cooldown,
        registerForm,
        otpForm,
        onSubmitRegister,
        onSubmitOtp,
        onResend,
    } = useRegisterForm();

    return (
        <div className="space-y-7">
            {step === 1 ? (
                <RegisterStep1
                    form={registerForm}
                    onSubmit={onSubmitRegister}
                />
            ) : (
                <RegisterStep2
                    form={otpForm}
                    pendingEmail={pendingEmail}
                    cooldown={cooldown}
                    onSubmit={onSubmitOtp}
                    onResend={onResend}
                    onBack={() => setStep(1)}
                />
            )}

            {step === 1 && (
                <p className="text-center text-sm text-zinc-500">
                    Đã có tài khoản?{' '}
                    <Link
                        href="/login"
                        className="font-semibold text-zinc-900 underline underline-offset-4 transition-colors hover:text-zinc-600"
                    >
                        Đăng nhập
                    </Link>
                </p>
            )}
        </div>
    );
}
