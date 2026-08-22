interface ShortcutItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
}

// Tạo vùng điều hướng đủ lớn cho chuột, bàn phím và màn hình cảm ứng trong khu vực lối tắt.
export function ShortcutItem({ icon, label, href }: ShortcutItemProps) {
    return (
        <a
            href={href}
            className="group flex min-h-24 flex-col items-center justify-center gap-2 border-r border-zinc-100 px-2 py-4 text-center transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none"
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors group-hover:border-zinc-950 group-hover:bg-zinc-950 group-hover:text-white [&>svg]:h-5 [&>svg]:w-5">
                {icon}
            </span>
            <span className="text-xs font-medium text-zinc-700 sm:text-sm">
                {label}
            </span>
        </a>
    );
}
