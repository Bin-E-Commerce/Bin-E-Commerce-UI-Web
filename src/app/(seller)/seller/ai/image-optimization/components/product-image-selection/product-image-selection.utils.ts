// Helper thuần cho gallery ảnh nguồn.
// Chỉ nhận diện UUID asset trong URL Product Service, không gọi mạng và không suy diễn quyền sở hữu.

// Trích media asset UUID từ URL đã được Product Service phát hành để API AI chỉ nhận asset ID.
export function getMediaAssetId(imageUrl: string): string | null {
    const parts = imageUrl.split('/').filter(Boolean);
    const candidate = parts.at(-2);
    return candidate && /^[0-9a-f-]{36}$/i.test(candidate) ? candidate : null;
}
