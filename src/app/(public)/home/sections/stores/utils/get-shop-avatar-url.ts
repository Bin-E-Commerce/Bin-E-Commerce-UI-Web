// Chuẩn hóa logo seller vì một số response Tiki chỉ trả path tương đối thay vì URL đầy đủ.
export function getShopAvatarUrl(
    avatarUrl?: string | null,
): string | null {
    if (!avatarUrl) return null;
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;

    return `https://vcdn.tikicdn.com/ts/seller/${avatarUrl.replace(/^\/+/, '')}`;
}
