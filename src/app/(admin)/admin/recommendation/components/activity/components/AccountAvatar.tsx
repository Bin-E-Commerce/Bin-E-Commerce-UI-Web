// Avatar dùng chung cho danh sách account và phần tóm tắt account đang được chọn.

import Image from 'next/image';

interface Props {
    name: string;
    avatarUrl: string | null;
    size?: string;
}

// Hiển thị ảnh đại diện nếu có; initials là fallback ổn định khi account chưa đồng bộ avatar.
export function AccountAvatar({ name, avatarUrl, size = 'size-10' }: Props) {
    return (
        <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ${size}`}
        >
            {avatarUrl ? (
                <Image
                    src={avatarUrl}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                />
            ) : (
                <span className="text-xs font-semibold text-zinc-500">{getInitials(name)}</span>
            )}
        </div>
    );
}

// Lấy tối đa hai chữ cái cuối tên để giữ initials gọn trong avatar tròn.
function getInitials(name: string): string {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(-2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || 'U'
    );
}
