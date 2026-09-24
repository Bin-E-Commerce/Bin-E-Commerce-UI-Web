// Thành phần này thống nhất tiêu đề và mô tả trong showcase; không sở hữu bố cục của section cha.
// Mặc định giới hạn dòng để dễ đọc; section có thể chọn width="full" hoặc compact để phù hợp cấp độ nội dung.
interface ShowcaseSectionHeadingProps {
    id?: string;
    eyebrow?: string;
    title: string;
    description: string;
    level?: 2 | 3;
    showAccent?: boolean;
    width?: 'default' | 'full';
    compact?: boolean;
    titleSize?: 'default' | '2xl' | 'subsection';
}

// Tạo heading và mô tả nhất quán; titleSize chỉ hạ cỡ tiêu đề khi section cần giữ cấp chữ 2xl ở mọi breakpoint.
export function ShowcaseSectionHeading({
    id,
    eyebrow,
    title,
    description,
    level = 2,
    showAccent = true,
    width = 'default',
    compact = false,
    titleSize = 'default',
}: ShowcaseSectionHeadingProps) {
    const Heading = level === 3 ? 'h3' : 'h2';

    return (
        <div className={width === 'full' ? 'w-full' : 'max-w-3xl'}>
            {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {eyebrow}
                </p>
            ) : null}
            <Heading
                id={id}
                className={`${eyebrow ? 'mt-3' : showAccent ? 'flex items-start gap-3' : ''} ${titleSize === '2xl' ? 'text-2xl' : titleSize === 'subsection' ? 'text-lg' : compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-semibold tracking-tight text-zinc-950`}
            >
                {!eyebrow && showAccent ? (
                    <span
                        aria-hidden="true"
                        className="mt-2 h-6 w-1 shrink-0 rounded-full bg-zinc-950 sm:mt-2.5 sm:h-7"
                    />
                ) : null}
                <span>{title}</span>
            </Heading>
            <p
                className={`${compact ? 'mt-2 text-sm leading-6' : 'mt-3 text-sm leading-7 sm:text-base'} text-zinc-600`}
            >
                {description}
            </p>
        </div>
    );
}
