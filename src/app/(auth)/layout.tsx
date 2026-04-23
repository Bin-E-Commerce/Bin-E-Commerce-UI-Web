import Image from 'next/image';
import Link from 'next/link';

const STATS = [
    { value: '10K+', label: 'Sản phẩm' },
    { value: '50K+', label: 'Khách hàng' },
    { value: '99%', label: 'Hài lòng' },
];

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen lg:grid lg:grid-cols-2">
            {/* ── Left — branding panel (desktop only) ─────────────────── */}
            <div className="relative hidden flex-col overflow-hidden bg-zinc-950 lg:flex">
                {/* Subtle radial glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 60% at 50% 110%, oklch(0.35 0 0) 0%, transparent 70%)',
                    }}
                />

                <div className="relative flex h-full flex-col justify-between p-10">
                    {/* Logo */}
                    <Link href="/" className="inline-flex w-fit items-center">
                        <Image
                            src="/images/logo/logo_no_background.png"
                            alt="Bin E-Commerce"
                            width={160}
                            height={48}
                            priority
                            className="invert h-auto w-auto"
                        />
                    </Link>

                    {/* Hero content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                                Nền tảng mua sắm #1 Việt Nam
                            </p>
                            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white">
                                Mua sắm thông minh —{' '}
                                <span className="text-zinc-400">
                                    giá tốt mỗi ngày.
                                </span>
                            </h2>
                            <p className="max-w-sm text-base leading-relaxed text-zinc-400">
                                Hàng nghìn sản phẩm chính hãng, giao hàng nhanh
                                toàn quốc, hoàn tiền dễ dàng trong 30 ngày.
                            </p>
                        </div>

                        {/* Stats row */}
                        <div className="flex gap-8">
                            {STATS.map((s) => (
                                <div key={s.label} className="space-y-0.5">
                                    <p className="text-2xl font-bold text-white">
                                        {s.value}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Testimonial card */}
                        <div className="glass-card max-w-sm rounded-xl p-4">
                            <p className="text-sm italic leading-relaxed text-zinc-300">
                                &ldquo;Mình đã mua hàng ở đây nhiều lần, dịch vụ
                                rất tốt và giao hàng cực nhanh. Rất đáng tin
                                cậy!&rdquo;
                            </p>
                            <p className="mt-3 text-xs font-medium text-zinc-500">
                                — Đào Ngọc Anh, TP Hồ Chí Minh
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-xs text-zinc-600">
                        © {new Date().getFullYear()} Bin E-Commerce. All rights
                        reserved.
                    </p>
                </div>
            </div>

            {/* ── Right — form panel ────────────────────────────────────── */}
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
                {/* Mobile logo (hidden on desktop) */}
                <Link href="/" className="mb-8 inline-flex lg:hidden">
                    <Image
                        src="/images/logo/logo_no_background.png"
                        alt="Bin E-Commerce"
                        width={140}
                        height={42}
                        priority
                        className="h-auto w-auto"
                    />
                </Link>

                <div className="w-full max-w-sm">{children}</div>
            </div>
        </div>
    );
}
