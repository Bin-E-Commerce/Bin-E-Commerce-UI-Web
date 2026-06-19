import Image from 'next/image';
import Link from 'next/link';

export function HeaderLogo() {
    return (
        <Link href="/" className="flex items-center shrink-0 cursor-pointer">
            <Image
                src="/images/logo/logo_no_background.png"
                alt="Bin E-Commerce"
                width={120}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
                priority
            />
        </Link>
    );
}
