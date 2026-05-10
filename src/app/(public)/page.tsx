'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    ShieldCheck,
    Truck,
    RotateCcw,
    Headphones,
    Heart,
    Star,
    Zap,
    TrendingUp,
    Users,
    Package,
    Award,
    Smartphone,
    Shirt,
    Home,
    Dumbbell,
    Sparkles,
    BookOpen,
    ShoppingBasket,
    Gamepad2,
    Watch,
    BatteryCharging,
    Volume2,
    Camera,
    Wind,
    Backpack,
    Cpu,
    CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Data ───────────────────────────────────────────────────────────────
interface Category {
    href: string;
    label: string;
    icon: LucideIcon;
    count: string;
}

const CATEGORIES: Category[] = [
    {
        href: '/categories/electronics',
        label: 'Dien tu',
        icon: Smartphone,
        count: '2.4k+',
    },
    {
        href: '/categories/fashion',
        label: 'Thoi trang',
        icon: Shirt,
        count: '5.1k+',
    },
    { href: '/categories/home', label: 'Nha cua', icon: Home, count: '1.8k+' },
    {
        href: '/categories/sports',
        label: 'The thao',
        icon: Dumbbell,
        count: '980+',
    },
    {
        href: '/categories/beauty',
        label: 'Lam dep',
        icon: Sparkles,
        count: '3.2k+',
    },
    {
        href: '/categories/books',
        label: 'Sach',
        icon: BookOpen,
        count: '4.7k+',
    },
    {
        href: '/categories/food',
        label: 'Thuc pham',
        icon: ShoppingBasket,
        count: '1.1k+',
    },
    {
        href: '/categories/toys',
        label: 'Do choi',
        icon: Gamepad2,
        count: '760+',
    },
];

interface Product {
    id: number;
    name: string;
    icon: LucideIcon;
    price: number;
    originalPrice?: number;
    rating: number;
    sold?: number;
    reviews?: number;
}

const FLASH_PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'Tai nghe Bluetooth Pro X200',
        icon: Headphones,
        price: 890000,
        originalPrice: 1490000,
        rating: 4.8,
        sold: 1240,
    },
    {
        id: 2,
        name: 'Dong ho thong minh FitBand 5',
        icon: Watch,
        price: 1290000,
        originalPrice: 2190000,
        rating: 4.6,
        sold: 870,
    },
    {
        id: 3,
        name: 'Sac du phong 20000mAh Ultra',
        icon: BatteryCharging,
        price: 390000,
        originalPrice: 690000,
        rating: 4.9,
        sold: 3200,
    },
    {
        id: 4,
        name: 'Loa bluetooth Mini Boom',
        icon: Volume2,
        price: 590000,
        originalPrice: 990000,
        rating: 4.7,
        sold: 560,
    },
];

const NEW_ARRIVALS: Product[] = [
    {
        id: 5,
        name: 'Giam soc khong khi Dyson V3',
        icon: Wind,
        price: 2490000,
        rating: 4.9,
        reviews: 124,
    },
    {
        id: 6,
        name: 'May anh Fujifilm Instax Mini 12',
        icon: Camera,
        price: 1890000,
        rating: 4.8,
        reviews: 89,
    },
    {
        id: 7,
        name: 'Balo laptop Samsonite 15',
        icon: Backpack,
        price: 1290000,
        rating: 4.7,
        reviews: 203,
    },
    {
        id: 8,
        name: 'CPU Intel Core i9 14900K',
        icon: Cpu,
        price: 3490000,
        rating: 5.0,
        reviews: 67,
    },
];

const STATS = [
    { icon: Package, value: '50K+', label: 'San pham' },
    { icon: Users, value: '200K+', label: 'Khach hang' },
    { icon: TrendingUp, value: '98%', label: 'Han long' },
    { icon: Award, value: '4.9', label: 'Danh gia TB' },
];

const FEATURES = [
    {
        icon: Truck,
        title: 'Giao hang nhanh',
        desc: 'Mien phi van chuyen cho don tu 300k. Giao trong 2-4 gio noi thanh.',
    },
    {
        icon: ShieldCheck,
        title: 'Hang chinh hang',
        desc: '100% san pham co nguon goc ro rang, duoc kiem dinh chat luong.',
    },
    {
        icon: RotateCcw,
        title: 'Doi tra de dang',
        desc: 'Hoan tien 100% hoac doi hang trong vong 7 ngay khong can ly do.',
    },
    {
        icon: Headphones,
        title: 'Ho tro 24/7',
        desc: 'Doi ngu tu van luon san sang ho tro ban bat ky luc nao.',
    },
];

const HERO_PRODUCTS = [
    {
        icon: Smartphone,
        label: 'Dien thoai',
        price: '5.990.000d',
        badge: '-30%',
    },
    { icon: Shirt, label: 'Giay sneaker', price: '890.000d', badge: 'Hot' },
    { icon: Wind, label: 'Laptop gaming', price: '18.990.000d', badge: '-20%' },
    {
        icon: Headphones,
        label: 'Tai nghe ANC',
        price: '1.290.000d',
        badge: 'Moi',
    },
];

// ─── Helpers ────────────────────────────────────────────────────────────
// Dùng formatter thuần JS không phụ thuộc locale ICU để tránh hydration mismatch
function fmtNum(n: number): string {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function fmtPrice(n: number) {
    return fmtNum(n) + 'd';
}

function discount(original: number, sale: number) {
    return Math.round((1 - sale / original) * 100);
}

function StarRow({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    className={cn(
                        'h-3 w-3',
                        s <= Math.floor(rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-200',
                    )}
                />
            ))}
            <span className="ml-1 text-xs text-zinc-400">{rating}</span>
        </span>
    );
}

// ─── Flash Sale Timer ────────────────────────────────────────────────────
function FlashSaleTimer() {
    const getRemaining = useCallback(() => {
        const now = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const diff = end.getTime() - now.getTime();
        return {
            h: Math.floor(diff / 3600000),
            m: Math.floor((diff % 3600000) / 60000),
            s: Math.floor((diff % 60000) / 1000),
        };
    }, []);

    const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
    useEffect(() => {
        setTime(getRemaining());
        const id = setInterval(() => setTime(getRemaining()), 1000);
        return () => clearInterval(id);
    }, [getRemaining]);

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <div className="flex items-center gap-1">
            {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
                <span key={i} className="flex items-center gap-1">
                    <span className="inline-flex h-7 w-8 items-center justify-center rounded bg-zinc-900 font-mono text-sm font-bold text-white">
                        {v}
                    </span>
                    {i < 2 && (
                        <span className="text-sm font-bold text-zinc-500">
                            :
                        </span>
                    )}
                </span>
            ))}
        </div>
    );
}

// ─── Product Card ────────────────────────────────────────────────────────
interface ProductCardProps {
    id: number;
    name: string;
    icon: LucideIcon;
    price: number;
    originalPrice?: number;
    rating: number;
    badge?: string;
    extra?: string;
}

function ProductCard({
    id,
    name,
    icon: Icon,
    price,
    originalPrice,
    rating,
    badge,
    extra,
}: ProductCardProps) {
    const [liked, setLiked] = useState(false);
    return (
        <div className="group relative flex flex-col rounded-xl border border-zinc-100 bg-white p-4 transition-all duration-200 hover:border-zinc-300 hover:shadow-md">
            {badge && (
                <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {badge}
                </span>
            )}
            <button
                onClick={() => setLiked((l) => !l)}
                className="absolute right-3 top-3 z-10 cursor-pointer rounded-full bg-white p-1.5 shadow-sm border border-zinc-100 transition-all hover:scale-110"
                aria-label="Yeu thich"
            >
                <Heart
                    className={cn(
                        'h-4 w-4 transition-colors',
                        liked ? 'fill-red-500 text-red-500' : 'text-zinc-300',
                    )}
                />
            </button>

            <Link href={`/products/${id}`} className="cursor-pointer">
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-hover:bg-zinc-100">
                    <Icon
                        className="h-14 w-14 text-zinc-300 group-hover:text-zinc-400 transition-colors"
                        strokeWidth={1.25}
                    />
                </div>
                <p className="line-clamp-2 text-sm font-medium text-zinc-900 leading-snug">
                    {name}
                </p>
                <div className="mt-1.5">
                    <StarRow rating={rating} />
                </div>
                {extra && (
                    <p className="mt-0.5 text-xs text-zinc-400">{extra}</p>
                )}
                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-base font-bold text-zinc-900">
                        {fmtPrice(price)}
                    </span>
                    {originalPrice && (
                        <>
                            <span className="text-xs text-zinc-300 line-through">
                                {fmtPrice(originalPrice)}
                            </span>
                            <span className="ml-auto text-xs font-semibold text-red-500">
                                -{discount(originalPrice, price)}%
                            </span>
                        </>
                    )}
                </div>
            </Link>

            <button className="mt-3 cursor-pointer w-full rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 active:scale-95">
                Them vao gio
            </button>
        </div>
    );
}

// ─── Newsletter ──────────────────────────────────────────────────────────
function Newsletter() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (email.trim()) setSent(true);
    }

    return (
        <section className="border-t border-zinc-100 bg-zinc-950 py-16">
            <div className="mx-auto max-w-xl px-4 text-center">
                {sent ? (
                    <div className="space-y-3">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
                        <h3 className="text-xl font-bold text-white">
                            Cam on ban!
                        </h3>
                        <p className="text-sm text-zinc-400">
                            Voucher 50k da duoc gui vao email cua ban.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                            Newsletter
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                            Nhan voucher 50k ngay
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Dang ky de nhan uu dai doc quyen va thong tin san
                            pham moi nhat.
                        </p>
                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 flex gap-2"
                        >
                            <input
                                type="email"
                                required
                                placeholder="Email cua ban"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-zinc-600 transition"
                            />
                            <button
                                type="submit"
                                className="cursor-pointer shrink-0 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 active:scale-95"
                            >
                                Dang ky
                            </button>
                        </form>
                    </>
                )}
            </div>
        </section>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
    return (
        <div>
            {/* ── 1. Hero ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white">
                {/* Subtle dot-grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, #000 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Left */}
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-700">
                                <Zap className="h-3.5 w-3.5 text-zinc-500" />
                                Flash Sale — Giam den 50%
                            </span>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl leading-tight">
                                Mua sam thong minh,
                                <br />
                                <span className="text-zinc-400">
                                    gia tot moi ngay
                                </span>
                            </h1>
                            <p className="max-w-md text-base text-zinc-500 leading-relaxed">
                                Hang ngan san pham chinh hang voi gia uu dai.
                                Giao hang nhanh, doi tra de dang, ho tro 24/7.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/products"
                                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 active:scale-95"
                                >
                                    Kham pha ngay{' '}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/flash-sale"
                                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
                                >
                                    Xem Flash Sale
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-8 pt-2">
                                {[
                                    ['50K+', 'San pham'],
                                    ['200K+', 'Khach hang'],
                                    ['4.9', 'Danh gia TB'],
                                ].map(([v, l]) => (
                                    <div key={l}>
                                        <p className="text-2xl font-black text-zinc-900">
                                            {v}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {l}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — product grid showcase */}
                        <div className="grid grid-cols-2 gap-3">
                            {HERO_PRODUCTS.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={i}
                                        href="/products"
                                        className="cursor-pointer group relative flex flex-col items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center transition-all hover:border-zinc-200 hover:bg-white hover:shadow-md"
                                    >
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm border border-zinc-100 group-hover:border-zinc-200 transition-all">
                                            <Icon
                                                className="h-7 w-7 text-zinc-500"
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                        <p className="mt-3 text-xs font-medium text-zinc-600">
                                            {item.label}
                                        </p>
                                        <p className="text-sm font-bold text-zinc-900">
                                            {item.price}
                                        </p>
                                        <span className="absolute right-2 top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                            {item.badge}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. Stats Strip ──────────────────────────────────── */}
            <section className="border-y border-zinc-100 bg-zinc-50 py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {STATS.map(({ icon: Icon, value, label }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center gap-1.5 text-center"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900">
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-2xl font-black text-zinc-900">
                                    {value}
                                </p>
                                <p className="text-xs text-zinc-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 3. Flash Sale ───────────────────────────────────── */}
            <section className="py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-red-500" />
                            <h2 className="text-xl font-black text-zinc-900">
                                Flash Sale
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <span>Ket thuc trong</span>
                            <FlashSaleTimer />
                        </div>
                        <Link
                            href="/flash-sale"
                            className="cursor-pointer ml-auto flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            Xem tat ca <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {FLASH_PRODUCTS.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                name={p.name}
                                icon={p.icon}
                                price={p.price}
                                originalPrice={p.originalPrice}
                                rating={p.rating}
                                badge={`-${discount(p.originalPrice!, p.price)}%`}
                                extra={`Da ban: ${fmtNum(p.sold!)}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. Categories ───────────────────────────────────── */}
            <section className="bg-zinc-50 py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-black text-zinc-900">
                            Danh muc noi bat
                        </h2>
                        <Link
                            href="/categories"
                            className="cursor-pointer flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            Tat ca <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                        {CATEGORIES.map(
                            ({ href, label, icon: Icon, count }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="cursor-pointer group flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-white p-3 text-center transition-all hover:border-zinc-200 hover:shadow-sm"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                                        <Icon
                                            className="h-5 w-5 text-zinc-500"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-zinc-700">
                                        {label}
                                    </span>
                                    <span className="text-[10px] text-zinc-400">
                                        {count}
                                    </span>
                                </Link>
                            ),
                        )}
                    </div>
                </div>
            </section>

            {/* ── 5. New Arrivals ─────────────────────────────────── */}
            <section className="py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-black text-zinc-900">
                            San pham moi nhat
                        </h2>
                        <Link
                            href="/products?sort=newest"
                            className="cursor-pointer flex items-center gap-1 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                            Xem them <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {NEW_ARRIVALS.map((p) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                name={p.name}
                                icon={p.icon}
                                price={p.price}
                                rating={p.rating}
                                badge="NEW"
                                extra={`${p.reviews} danh gia`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 6. Features ─────────────────────────────────────── */}
            <section className="border-t border-zinc-100 bg-zinc-50 py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="flex gap-4 rounded-xl border border-zinc-100 bg-white p-5"
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-zinc-900">
                                        {title}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 7. Newsletter ───────────────────────────────────── */}
            <Newsletter />
        </div>
    );
}
