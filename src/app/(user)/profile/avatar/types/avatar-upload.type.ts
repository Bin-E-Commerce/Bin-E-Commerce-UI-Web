export type AvatarUploadPhase =
    | 'idle'
    | 'presigning'
    | 'uploading'
    | 'processing'
    | 'saving'
    | 'cleaning';

export interface AvatarVariantUrls {
    thumb: string;
    medium: string;
    large: string;
}
