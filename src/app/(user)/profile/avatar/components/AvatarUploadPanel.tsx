'use client';

import type { ChangeEvent, DragEvent } from 'react';
import { useRef } from 'react';
import { Camera, ImageUp, Loader2, RotateCcw, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { AvatarUploadStatus } from './AvatarUploadStatus';
import { useAvatarUpload } from '../hooks/useAvatarUpload';

// Hiển thị giao diện đổi avatar và nối các thao tác kéo thả/chọn file với hook upload.
export function AvatarUploadPanel() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        file,
        initials,
        dragOver,
        phase,
        avatarVariants,
        uploadProgress,
        isUploading,
        setDragOver,
        selectFile,
        resetSelection,
        saveAvatar,
    } = useAvatarUpload();

    // Đọc file đầu tiên từ input để người dùng không cần xử lý nhiều ảnh trong nghiệp vụ avatar.
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) selectFile(selectedFile);
    };

    // Cho phép kéo thả ảnh vào vùng upload nhưng vẫn giữ kiểm soát validate ở selectFile.
    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragOver(false);

        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) selectFile(droppedFile);
    };

    return (
        <Card className="mx-auto w-full max-w-3xl rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="px-6 pt-6">
                <CardTitle className="text-xl font-semibold text-zinc-950">
                    Ảnh đại diện
                </CardTitle>
                <CardDescription>
                    Cập nhật ảnh hiển thị trên tài khoản của bạn.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="relative mx-auto shrink-0 sm:mx-0">
                        {avatarVariants ? (
                            <img
                                src={avatarVariants.medium}
                                srcSet={`${avatarVariants.thumb} 128w, ${avatarVariants.medium} 512w, ${avatarVariants.large} 1080w`}
                                sizes="112px"
                                alt="Ảnh đại diện"
                                className="h-28 w-28 rounded-full border border-zinc-200 object-cover shadow-sm"
                            />
                        ) : (
                            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-zinc-950 text-3xl font-semibold text-white shadow-sm">
                                {initials || 'U'}
                            </span>
                        )}
                        <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-white bg-zinc-950 text-white shadow-sm">
                            <Camera className="h-4 w-4" />
                        </span>
                    </div>

                    <Label
                        htmlFor="avatar-upload"
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={cn(
                            'flex min-h-44 flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-6 text-center transition-colors',
                            dragOver
                                ? 'border-zinc-950 bg-zinc-50'
                                : 'border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 hover:bg-zinc-50',
                            isUploading && 'pointer-events-none opacity-70',
                        )}
                    >
                        <ImageUp className="mb-3 h-8 w-8 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-900">
                            Kéo thả ảnh vào đây hoặc chọn từ máy
                        </span>
                        <span className="mt-1 text-xs text-zinc-500">
                            JPG, PNG, WEBP · tối đa 5MB
                        </span>
                        <Input
                            id="avatar-upload"
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={isUploading}
                            onChange={handleInputChange}
                        />
                    </Label>
                </div>

                {file ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-zinc-900">
                                    {file.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                            ) : null}
                        </div>

                        {isUploading ? (
                            <AvatarUploadStatus
                                phase={phase}
                                uploadProgress={uploadProgress}
                            />
                        ) : null}
                    </div>
                ) : null}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-zinc-200 bg-zinc-50/70 px-6 py-4 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isUploading || !file}
                    onClick={() => {
                        resetSelection();
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                >
                    <RotateCcw className="h-4 w-4" />
                    Hủy ảnh đã chọn
                </Button>
                <Button
                    type="button"
                    className="w-full bg-zinc-950 text-white hover:bg-zinc-800 sm:w-auto"
                    disabled={isUploading || !file}
                    onClick={saveAvatar}
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                    {isUploading
                        ? 'Đang cập nhật...'
                        : 'Lưu ảnh đại diện'}
                </Button>
            </CardFooter>
        </Card>
    );
}
