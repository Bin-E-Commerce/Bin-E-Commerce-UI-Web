'use client';

import { useState, type ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';

interface VerificationUploadCardProps {
    id: string;
    title: string;
    description: string;
}

// Ô upload giấy tờ xác minh giữ file ở client trong bản UI, submit thật sẽ gửi asset vào hồ sơ seller.
export function VerificationUploadCard({
    id,
    title,
    description,
}: VerificationUploadCardProps) {
    const [fileName, setFileName] = useState('');

    // Lưu tên file đã chọn để người dùng kiểm tra nhanh từng loại giấy tờ trong hồ sơ.
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFileName(event.target.files?.[0]?.name ?? '');
    };

    return (
        <label
            htmlFor={id}
            className="group cursor-pointer rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-zinc-400 hover:bg-white"
        >
            <input
                id={id}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="sr-only"
                onChange={handleFileChange}
            />
            <span className="flex size-10 items-center justify-center rounded-lg bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200 transition-colors group-hover:text-zinc-950">
                <UploadCloud className="size-5" />
            </span>
            <span className="mt-3 block text-sm font-semibold text-zinc-950">
                {title}
            </span>
            <span className="mt-1 block text-sm leading-6 text-zinc-500">
                {description}
            </span>
            <span className="mt-3 block truncate rounded-lg bg-white px-3 py-2 text-xs text-zinc-600 ring-1 ring-zinc-200">
                {fileName || 'Chưa chọn tệp'}
            </span>
        </label>
    );
}

