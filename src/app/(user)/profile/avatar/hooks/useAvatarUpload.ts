'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

import { mediaService } from '@/services/media';
import type { MediaUploadMimeType } from '@/services/media';
import type { AppDispatch, RootState } from '@/store';
import { updateAuthUser } from '@/store/slices/authSlice';

import type { AvatarUploadPhase } from '../types/avatar-upload.type';
import {
    buildProcessedAvatarUrls,
    getAvatarVariantUrls,
    validateAvatarFile,
    waitForImageReady,
} from '../utils/avatar-image';

// Điều phối toàn bộ nghiệp vụ đổi avatar: chọn file, upload S3, đợi resize và lưu URL mới vào hồ sơ.
export function useAvatarUpload() {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const objectUrlRef = useRef<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [phase, setPhase] = useState<AvatarUploadPhase>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);

    const isUploading = phase !== 'idle';
    const avatarUrl = previewUrl ?? user?.avatarUrl ?? null;
    const avatarVariants = useMemo(
        () => getAvatarVariantUrls(avatarUrl),
        [avatarUrl],
    );

    const initials = useMemo(() => {
        if (!user?.name) return '';

        return user.name
            .split(' ')
            .map((word) => word[0])
            .slice(-2)
            .join('')
        .toUpperCase();
    }, [user?.name]);

    // Thu hồi object URL tạm để trình duyệt không giữ bộ nhớ của ảnh preview sau khi đổi hoặc rời trang.
    const clearObjectUrl = useCallback(() => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    }, []);

    // Xóa file đang chọn và đưa giao diện upload về trạng thái ban đầu.
    const resetSelection = useCallback(() => {
        clearObjectUrl();
        setFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
    }, [clearObjectUrl]);

    // Validate file rồi tạo preview cục bộ để người dùng xem ảnh trước khi upload.
    const selectFile = useCallback(
        (nextFile: File) => {
            const errorMessage = validateAvatarFile(nextFile);
            if (errorMessage) {
                toast.error(errorMessage);
                return;
            }

            clearObjectUrl();
            const nextPreviewUrl = URL.createObjectURL(nextFile);
            objectUrlRef.current = nextPreviewUrl;
            setFile(nextFile);
            setPreviewUrl(nextPreviewUrl);
            setUploadProgress(0);
        },
        [clearObjectUrl],
    );

    // Thực hiện luồng presign, upload S3, chờ Lambda resize và xác nhận avatar bằng một API backend.
    const saveAvatar = useCallback(async () => {
        if (!file) {
            toast.error('Vui lòng chọn ảnh đại diện trước khi lưu.');
            return;
        }

        try {
            setPhase('presigning');
            const presigned = await mediaService.createPresignedUpload({
                fileName: file.name,
                contentType: file.type as MediaUploadMimeType,
                fileSize: file.size,
                purpose: 'avatar',
            });

            setPhase('uploading');
            await mediaService.uploadToPresignedPost(
                presigned.upload,
                file,
                setUploadProgress,
            );

            setPhase('processing');
            const avatarUrls = buildProcessedAvatarUrls(
                presigned.publicBaseUrl,
                presigned.objectKey,
            );
            const resizedImageReady = await waitForImageReady(
                avatarUrls.medium,
            );

            if (!resizedImageReady) {
                throw new Error('AVATAR_PROCESSING_TIMEOUT');
            }

            setPhase('saving');
            const confirmed = await mediaService.confirmAvatar(
                presigned.assetId,
            );

            dispatch(updateAuthUser(confirmed.user));
            resetSelection();

            if (confirmed.cleanup.status === 'deferred') {
                toast.warning(
                    'Ảnh đại diện đã được cập nhật. Ảnh cũ sẽ được hệ thống dọn lại sau.',
                );
                return;
            }

            toast.success('Đã cập nhật ảnh đại diện.');
        } catch (error) {
            console.error('Update avatar failed:', error);

            if (
                error instanceof Error &&
                error.message === 'AVATAR_PROCESSING_TIMEOUT'
            ) {
                toast.error(
                    'Ảnh đang được xử lý lâu hơn dự kiến. Vui lòng thử lại sau ít phút.',
                );
                return;
            }

            toast.error('Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
        } finally {
            setPhase('idle');
        }
    }, [dispatch, file, resetSelection]);

    useEffect(() => clearObjectUrl, [clearObjectUrl]);

    return {
        user,
        file,
        initials,
        dragOver,
        phase,
        previewUrl,
        avatarVariants,
        uploadProgress,
        isUploading,
        setDragOver,
        selectFile,
        resetSelection,
        saveAvatar,
    };
}
