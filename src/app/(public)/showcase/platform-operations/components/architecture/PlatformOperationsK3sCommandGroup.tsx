// Card lệnh K3s tĩnh cho tài liệu public; chỉ trình bày command, mục đích và kết quả cần đọc, không thực thi runtime.
interface PlatformOperationsK3sCommandGroupProps {
    eyebrow: string;
    title: string;
    purpose: string;
    commands: string;
    result: string;
    warning?: string;
    danger?: boolean;
}

// Giữ mọi command group cùng một nhịp đọc để người xem dễ chuyển từ mục đích sang lệnh và kết quả.
export function PlatformOperationsK3sCommandGroup({
    eyebrow,
    title,
    purpose,
    commands,
    result,
    warning,
    danger = false,
}: PlatformOperationsK3sCommandGroupProps) {
    return (
        <article
            className={`min-w-0 overflow-hidden rounded-2xl border bg-white ${danger ? 'border-red-200' : 'border-zinc-200'}`}
        >
            <header className="border-b border-zinc-200 px-4 py-3 sm:px-5">
                <p
                    className={`font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${danger ? 'text-red-600' : 'text-zinc-500'}`}
                >
                    {eyebrow}
                </p>
                <h4 className="mt-1 text-sm font-semibold tracking-tight text-zinc-950">
                    {title}
                </h4>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {purpose}
                </p>
            </header>

            <pre className="m-3 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100 p-4 text-[11px] leading-5 text-zinc-800 shadow-inner sm:m-4">
                <code>{commands}</code>
            </pre>

            <div className="grid gap-3 border-t border-zinc-100 px-4 py-3 sm:grid-cols-2 sm:px-5">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Kết quả cần đọc
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                        {result}
                    </p>
                </div>
                {warning ? (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600">
                            Cảnh báo
                        </p>
                        <p className="mt-1 text-xs leading-5 text-red-700">
                            {warning}
                        </p>
                    </div>
                ) : null}
            </div>
        </article>
    );
}
