import Image from 'next/image';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { FOOTER_LINKS } from './constants/footer-links.constant';

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))_18rem]">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Image
                            src="/images/logo/logo_no_background.png"
                            alt="Bin E-Commerce"
                            width={160}
                            height={40}
                            style={{ width: 'auto', height: 'auto' }}
                            className="rounded-md"
                            priority
                        />
                        <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                            Mua sắm thông minh, giá tốt mỗi ngày.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(FOOTER_LINKS).map(([group, items]) => (
                        <div key={group}>
                            <p className="text-sm font-semibold text-zinc-900">
                                {group}
                            </p>
                            <ul className="mt-3 space-y-2">
                                {items.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <aside className="col-span-2 border-t border-zinc-200 pt-6 md:col-span-2 xl:col-span-1 xl:border-t-0 xl:border-l xl:pl-6 xl:pt-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Người thiết kế sản phẩm
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                            <Image
                                src="/images/avatar/avatar.jpg"
                                alt="Ảnh đại diện của Đào Ngọc Anh"
                                width={44}
                                height={44}
                                className="size-11 shrink-0 rounded-xl border border-zinc-200 object-cover"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold tracking-tight text-zinc-950">
                                    Đào Ngọc Anh
                                </p>
                                <p className="mt-0.5 text-xs text-zinc-500">
                                    Software Engineer
                                </p>
                            </div>
                        </div>
                        <a
                            href="https://daongocanh.site/"
                            target="_blank"
                            rel="noreferrer"
                            className="group mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-zinc-950 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
                        >
                            Xem portfolio
                            <span className="flex size-7 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-zinc-100 transition-colors group-hover:bg-white/15">
                                <Globe aria-hidden="true" className="size-3.5" />
                            </span>
                        </a>
                    </aside>
                </div>

                <div className="mt-10 border-t border-zinc-200 pt-6 text-center">
                    <p className="text-xs text-zinc-400">
                        © {new Date().getFullYear()} Bin E-Commerce. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
