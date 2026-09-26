// Avatar dùng chung cho danh sách và hồ sơ user; ảnh lỗi luôn quay về fallback ổn định,
// vì UI quản trị không được vỡ layout chỉ vì asset avatar hết hạn.
import Image from 'next/image';

interface AdminUserAvatarProps {
    name: string;
    avatarUrl?: string | null;
    className?: string;
    fallback?: 'initial' | 'logo';
}

// Render avatar từ URL nếu có; nếu tài khoản chưa có ảnh thì dùng initial hoặc logo theo ngữ cảnh.
// Danh sách mặc định dùng initial để mỗi dòng vẫn nhận diện được user, còn hồ sơ chi tiết
// có thể chọn logo thương hiệu để card không bị trống khi dữ liệu avatar là null.
export function AdminUserAvatar({
    name,
    avatarUrl,
    className = 'size-9',
    fallback = 'initial',
}: AdminUserAvatarProps) {
    return (
        <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 font-semibold text-zinc-600 ${className}`}
        >
            {fallback === 'logo' ? (
                <Image
                    src="/images/logo/logo_icon.png"
                    alt="Bin E-Commerce"
                    fill
                    sizes="56px"
                    className="object-contain p-1.5"
                />
            ) : (
                name.slice(0, 1).toUpperCase()
            )}
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    loading="lazy"
                    onError={(event) => {
                        // Ảnh hỏng hoặc URL hết hạn không được làm mất fallback đã chọn.
                        event.currentTarget.hidden = true;
                    }}
                    className="absolute inset-0 size-full object-cover"
                />
            ) : null}
        </div>
    );
}
