import type { MediaUploadMimeType } from '@/services/media.service';

export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const AVATAR_ALLOWED_MIME_TYPES: MediaUploadMimeType[] = [
    'image/jpeg',
    'image/png',
    'image/webp',
];
