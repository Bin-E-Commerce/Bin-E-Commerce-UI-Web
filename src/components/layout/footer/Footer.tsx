import Image from 'next/image';
import Link from 'next/link';
import { FOOTER_LINKS } from './constants/footer-links.constant';

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
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
