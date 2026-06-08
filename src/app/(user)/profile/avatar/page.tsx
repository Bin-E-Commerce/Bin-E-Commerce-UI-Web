'use client';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { toast } from 'sonner';
import { Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileSidebar } from '@/components/layout/profile-sidebar';

export default function AvatarPage() {
    const { user } = useSelector((state: RootState) => state.auth);
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const initials = user
        ? user.name
              .split(' ')
              .map((w) => w[0])
              .slice(-2)
              .join('')
              .toUpperCase()
        : '';

    function handleFile(file: File) {
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh (JPG, PNG, WEBP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File ảnh không được vượt quá 5MB.');
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    function handleSave() {
        // Mock — no backend endpoint yet
        toast.info('Tính năng cập nhật ảnh đại diện sẽ sớm được ra mắt.');
        setPreview(null);
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 md:flex-row">
                <ProfileSidebar />

                <div className="flex-1">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-6 font-semibold text-zinc-900">
                            Ảnh đại diện
                        </h2>

                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                            {/* Current / preview avatar */}
                            <div className="shrink-0">
                                {(preview ?? user?.avatarUrl) ? (
                                    <img
                                        src={preview ?? user?.avatarUrl ?? ''}
                                        alt="Avatar"
                                        className="h-24 w-24 rounded-full object-cover ring-4 ring-zinc-100"
                                    />
                                ) : (
                                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-2xl font-bold text-white ring-4 ring-zinc-100">
                                        {initials}
                                    </span>
                                )}
                            </div>

                            {/* Upload area */}
                            <div className="flex-1 w-full space-y-4">
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileRef.current?.click()}
                                    className={[
                                        'flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                                        dragOver
                                            ? 'border-zinc-900 bg-zinc-50'
                                            : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
                                    ].join(' ')}
                                >
                                    <Camera className="h-8 w-8 text-zinc-400" />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-700">
                                            Kéo thả hoặc click để chọn ảnh
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            PNG, JPG, WEBP — tối đa 5MB
                                        </p>
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {preview && (
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleSave}
                                            className="flex-1 h-10"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Lưu ảnh đại diện
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-10"
                                            onClick={() => {
                                                setPreview(null);
                                                if (fileRef.current)
                                                    fileRef.current.value = '';
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
