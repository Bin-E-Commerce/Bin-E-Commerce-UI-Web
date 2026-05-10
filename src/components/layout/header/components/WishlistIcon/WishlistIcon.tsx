import Link from 'next/link';
import { Heart } from 'lucide-react';

export function WishlistIcon() {
    return (
        <Link
            href="/wishlist"
            className="relative cursor-pointer rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Danh sách yêu thích"
        >
            <Heart className="h-5 w-5" />
        </Link>
    );
}
