'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';

import { mediaService, type MediaUploadMimeType } from '@/services/media';
import type { PresignedUploadResponse } from '@/services/media';
import type { SellerVerificationDocumentDto } from '@/services/seller';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface VerificationUploadCardProps {
    id: string;
    title: string;
    description: string;
    value?: SellerVerificationDocumentDto;
    error?: string;
    onChange: (value: SellerVerificationDocumentDto | undefined) => void;
}

const SELLER_DOCUMENT_MIME_TYPES = new Set<MediaUploadMimeType>([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

// Ô upload giấy tờ xác minh: upload ảnh lên media-service và lưu URL processed vào form seller.
export function VerificationUploadCard({
    id,
    title,
    description,
    value,
    error,
    onChange,
}: VerificationUploadCardProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const requestRef = useRef(0);
    const imageUrl = previewUrl ?? value?.url;

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Tạo preview trước để người dùng kiểm tra ảnh, sau đó upload thật và ghi metadata tài liệu vào form.
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!isSupportedSellerDocumentMimeType(file.type)) {
            toast.error('Giấy tờ xác minh chỉ hỗ trợ JPG, PNG hoặc WebP.');
            resetInput();
            return;
        }

        const localPreviewUrl = URL.createObjectURL(file);
        const requestId = requestRef.current + 1;
        requestRef.current = requestId;

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(localPreviewUrl);
        setUploading(true);
        setProgress(0);
        onChange(undefined);

        try {
            const presigned = await mediaService.createPresignedUpload({
                fileName: file.name,
                contentType: file.type as MediaUploadMimeType,
                fileSize: file.size,
                purpose: 'seller_document',
            });

            await mediaService.uploadToPresignedPost(
                presigned.upload,
                file,
                setProgress,
            );

            // Nếu user chọn file khác trong lúc upload, bỏ qua kết quả request cũ để tránh ghi nhầm ảnh.
            if (requestRef.current !== requestId) return;

            onChange({
                assetId: presigned.assetId,
                url: buildProcessedDocumentUrl(presigned),
                fileName: file.name,
                contentType: file.type,
                uploadedAt: new Date().toISOString(),
            });
            toast.success(`Đã tải ${title.toLowerCase()}.`);
        } catch (err) {
            if (requestRef.current === requestId) {
                URL.revokeObjectURL(localPreviewUrl);
                setPreviewUrl(null);
                onChange(undefined);
                toast.error(getErrorMessage(err));
            }
        } finally {
            if (requestRef.current === requestId) {
                setUploading(false);
            }
        }
    };

    // Xóa file khỏi form để user có thể chọn lại đúng mặt giấy tờ nếu upload nhầm.
    const clearDocument = () => {
        requestRef.current += 1;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setUploading(false);
        setProgress(0);
        onChange(undefined);
        resetInput();
    };

    // Reset input file để browser cho phép chọn lại cùng một file sau khi xóa.
    function resetInput() {
        if (inputRef.current) inputRef.current.value = '';
    }

    return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-zinc-400 hover:bg-white">
            <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <UploadCloud className="size-8 text-zinc-400" />
                )}

                {uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 text-xs font-medium text-zinc-700">
                        <Loader2 className="size-5 animate-spin" />
                        {progress}%
                    </div>
                ) : null}

                {imageUrl && !uploading ? (
                    <button
                        type="button"
                        aria-label={`Xóa ${title}`}
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-colors hover:bg-white hover:text-zinc-950"
                        onClick={clearDocument}
                    >
                        <X className="size-4" />
                    </button>
                ) : null}
            </div>

            <p className="mt-3 text-sm font-semibold text-zinc-950">{title}</p>
            <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
            {value?.fileName ? (
                <p className="mt-2 truncate rounded-lg bg-white px-3 py-2 text-xs text-zinc-600 ring-1 ring-zinc-200">
                    {value.fileName}
                </p>
            ) : null}
            {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

            <input
                ref={inputRef}
                id={id}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={handleFileChange}
            />
            <label
                htmlFor={id}
                className={[
                    'mt-3 inline-flex h-9 w-full items-center justify-center rounded-full border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                    uploading
                        ? 'pointer-events-none cursor-not-allowed opacity-60'
                        : 'cursor-pointer',
                ].join(' ')}
            >
                {uploading ? 'Đang tải...' : imageUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
            </label>
        </div>
    );
}

// Kiểm tra MIME type trước khi xin presigned URL để tránh upload tài liệu không phải ảnh.
function isSupportedSellerDocumentMimeType(
    contentType: string,
): contentType is MediaUploadMimeType {
    return SELLER_DOCUMENT_MIME_TYPES.has(contentType as MediaUploadMimeType);
}

// Suy ra URL ảnh medium từ object key gốc vì Lambda xuất ảnh theo purpose/ownerId/assetId cố định.
function buildProcessedDocumentUrl(presigned: PresignedUploadResponse): string {
    if (!presigned.publicBaseUrl) {
        throw new Error('Media CDN chưa được cấu hình.');
    }

    const parts = presigned.objectKey.split('/');
    const [, , purpose, ownerId, assetId] = parts;

    if (!purpose || !ownerId || !assetId) {
        throw new Error('Đường dẫn upload giấy tờ không hợp lệ.');
    }

    return [
        presigned.publicBaseUrl.replace(/\/$/, ''),
        'media',
        'processed',
        purpose,
        ownerId,
        assetId,
        'medium.webp',
    ].join('/');
}
