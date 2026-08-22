'use client';

import { useState } from 'react';
import { type ControllerRenderProps, type FieldPath } from 'react-hook-form';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { type SecurityFormValues } from '../constants/security-schema.constant';

// Ô nhập mật khẩu dùng chung cho các trường, có nút bật/tắt hiển thị nhưng vẫn giữ layout ổn định.
export function PasswordInput({
    field,
    placeholder,
}: {
    field: ControllerRenderProps<
        SecurityFormValues,
        FieldPath<SecurityFormValues>
    >;
    placeholder: string;
}) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
                {...field}
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                className="h-12 rounded-xl pl-11 pr-11 text-sm shadow-none"
            />
            <button
                type="button"
                onClick={() => setShow((value) => !value)}
                className="absolute right-3.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900"
                aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
