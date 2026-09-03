// Component nÃ y trÃ¬nh bÃ y checkout Phase 1: chá»n Ä‘á»‹a chá»‰, xÃ¡c nháº­n COD vÃ  káº¿t quáº£ táº¡o Ä‘Æ¡n.
// Form khÃ´ng nháº­n item hoáº·c giÃ¡ tá»« ngÆ°á»i dÃ¹ng; Cart/Order Service lÃ  nguá»“n dá»¯ liá»‡u vÃ  phÃ©p tÃ­nh chÃ­nh thá»©c.
// CÃ¡c tráº¡ng thÃ¡i loading, lá»—i, rá»—ng Ä‘á»‹a chá»‰ vÃ  thÃ nh cÃ´ng Ä‘Æ°á»£c hiá»ƒn thá»‹ riÃªng Ä‘á»ƒ ngÆ°á»i dÃ¹ng luÃ´n biáº¿t bÆ°á»›c tiáº¿p theo.

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    Check,
    CheckCircle2,
    CreditCard,
    Loader2,
    MapPin,
    PackageCheck,
    Plus,
    ShieldCheck,
    Trash2,
    Truck,
} from 'lucide-react';
import { toast } from 'sonner';

import { useCart } from '@/app/(public)/cart/hooks/use-cart';
import { useCartAuthRedirect } from '@/app/(public)/cart/hooks/use-cart-auth-redirect';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CreateAddressPayload, UserAddress } from '@/services/auth';
import { useCheckout, useCheckoutQuote } from '../../hooks/use-checkout';
import { AddressForm } from '../address-form/AddressForm';
import { CheckoutShippingQuoteNotice } from './CheckoutShippingQuoteNotice';
import { CheckoutAddressCard } from './CheckoutAddressCard';
import { CheckoutShell, LoadingState } from './CheckoutStateViews';

const EMPTY_ADDRESSES: UserAddress[] = [];

// Äá»‹nh dáº¡ng tiá»n VND táº¡i lá»›p trÃ¬nh bÃ y, cÃ²n subtotal/total authoritative váº«n láº¥y nguyÃªn tá»« backend.
function formatPrice(value: string): string {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '0 â‚«';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Tráº£ Ä‘á»‹a chá»‰ thÃ nh má»™t dÃ²ng dá»… quÃ©t trong card mÃ  khÃ´ng lÃ m máº¥t cÃ¡c thÃ nh pháº§n hÃ nh chÃ­nh.
function formatAddress(address: UserAddress): string {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.province}`;
}

// Táº¡o checkout page hoÃ n chá»‰nh tá»« cart, address query vÃ  order mutation Ä‘Ã£ tÃ¡ch riÃªng khá»i UI.
export function CheckoutPageContent() {
    const { initialized, isAuthenticated } = useCartAuthRedirect();
    const cartQuery = useCart();
    const {
        addressesQuery,
        createAddressMutation,
        updateAddressMutation,
        deleteAddressMutation,
        orderMutation,
    } = useCheckout();
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress>();
    const [deletingAddress, setDeletingAddress] = useState<UserAddress | null>(
        null,
    );
    const [note, setNote] = useState('');
    const router = useRouter();

    const addresses = addressesQuery.data ?? EMPTY_ADDRESSES;
    const fallbackAddressId = useMemo(
        () =>
            addresses.find((address) => address.isDefault)?.id ??
            addresses[0]?.id ??
            '',
        [addresses],
    );
    const activeAddressId = selectedAddressId || fallbackAddressId;
    const quoteQuery = useCheckoutQuote(activeAddressId);

    // Chá»‰ cháº·n guest sau khi initAuth hoÃ n táº¥t; náº¿u cháº¡y sá»›m hÆ¡n, refresh checkout sáº½ redirect sai trÆ°á»›c khi cookie Ä‘Æ°á»£c restore.
    useEffect(() => {
        if (initialized && !isAuthenticated) {
            window.location.replace('/login?redirect=%2Fcheckout');
        }
    }, [initialized, isAuthenticated]);

    // LÆ°u má»›i hoáº·c cáº­p nháº­t Ä‘á»‹a chá»‰, sau Ä‘Ã³ chá»n Ä‘á»‹a chá»‰ vá»«a Ä‘Æ°á»£c server xÃ¡c nháº­n.
    async function handleSaveAddress(
        payload: CreateAddressPayload,
    ): Promise<boolean> {
        try {
            const address = editingAddress
                ? await updateAddressMutation.mutateAsync({
                      id: editingAddress.id,
                      payload,
                  })
                : await createAddressMutation.mutateAsync(payload);
            setSelectedAddressId(address.id);
            setShowAddressForm(false);
            setEditingAddress(undefined);
            return true;
        } catch {
            // Mutation Ä‘Ã£ hiá»ƒn thá»‹ lá»—i qua onError; handler chá»‰ ngÄƒn lá»—i promise ná»•i lÃªn thÃ nh unhandled rejection.
            return false;
        }
    }

    // Má»Ÿ láº¡i form vá»›i snapshot Ä‘á»‹a chá»‰ hiá»‡n táº¡i Ä‘á»ƒ ngÆ°á»i dÃ¹ng sá»­a mÃ  khÃ´ng pháº£i nháº­p láº¡i tá»« Ä‘áº§u.
    function handleEditAddress(address: UserAddress): void {
        setEditingAddress(address);
        setShowAddressForm(true);
    }

    // ÄÃ³ng form vÃ  xÃ³a tráº¡ng thÃ¡i chá»‰nh sá»­a Ä‘á»ƒ láº§n thÃªm tiáº¿p theo luÃ´n báº¯t Ä‘áº§u tá»« dá»¯ liá»‡u rá»—ng.
    function handleCancelAddressForm(): void {
        setShowAddressForm(false);
        setEditingAddress(undefined);
    }

    // XÃ¡c nháº­n xÃ³a á»Ÿ server rá»“i bá» Ä‘á»‹a chá»‰ khá»i lá»±a chá»n hiá»‡n táº¡i náº¿u card Ä‘Ã³ Ä‘ang Ä‘Æ°á»£c dÃ¹ng.
    async function handleDeleteAddress(): Promise<void> {
        if (!deletingAddress) return;

        try {
            await deleteAddressMutation.mutateAsync(deletingAddress.id);
            if (activeAddressId === deletingAddress.id) {
                setSelectedAddressId('');
            }
            if (editingAddress?.id === deletingAddress.id) {
                handleCancelAddressForm();
            }
            setDeletingAddress(null);
        } catch {
            // Mutation Ä‘Ã£ hiá»ƒn thá»‹ lá»—i; giá»¯ dialog má»Ÿ Ä‘á»ƒ ngÆ°á»i dÃ¹ng biáº¿t thao tÃ¡c chÆ°a hoÃ n táº¥t.
        }
    }

    // Chá»‰ gá»­i Ä‘Æ¡n sau khi Ä‘á»‹a chá»‰ há»£p lá»‡ vÃ  quote Ä‘Ã£ thÃ nh cÃ´ng; náº¿u quote lá»—i, backend cÃ³ thá»ƒ khÃ´ng biáº¿t phÃ­ cáº§n thu.
    // Cháº·n á»Ÿ cáº£ handler láº«n nÃºt Ä‘á»ƒ báº£o vá»‡ luá»“ng checkout khi tráº¡ng thÃ¡i query thay Ä‘á»•i giá»¯a hai láº§n render.
    function handleSubmitOrder(): void {
        if (!activeAddressId) {
            toast.error('Vui lÃ²ng chá»n hoáº·c thÃªm Ä‘á»‹a chá»‰ giao hÃ ng.');
            return;
        }
        if (quoteQuery.isPending || quoteQuery.isError || !quoteQuery.data) {
            toast.error(
                'ChÆ°a thá»ƒ tÃ­nh phÃ­ giao hÃ ng. Vui lÃ²ng thá»­ láº¡i trÆ°á»›c khi Ä‘áº·t hÃ ng.',
            );
            return;
        }
        orderMutation.mutate(
            {
                shippingAddressId: activeAddressId,
                note: note.trim() || undefined,
            },
            {
                // Chuyá»ƒn tháº³ng Ä‘áº¿n detail order vá»«a táº¡o Ä‘á»ƒ khÃ¡ch hÃ ng tháº¥y ngay mÃ£ Ä‘Æ¡n, tráº¡ng thÃ¡i vÃ  snapshot giao hÃ ng.
                onSuccess: (order) =>
                    router.replace(`/profile/orders/${order.id}`),
            },
        );
    }

    if (!initialized || cartQuery.isPending || addressesQuery.isPending) {
        return (
            <CheckoutShell>
                <LoadingState label="Äang chuáº©n bá»‹ trang thanh toÃ¡n..." />
            </CheckoutShell>
        );
    }

    if (!isAuthenticated) {
        return (
            <CheckoutShell>
                <LoadingState label="Äang chuyá»ƒn tá»›i trang Ä‘Äƒng nháº­p..." />
            </CheckoutShell>
        );
    }

    if (cartQuery.isError || addressesQuery.isError || !cartQuery.data) {
        return (
            <CheckoutShell>
                <section className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                        <PackageCheck className="size-7" aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-zinc-950">
                        KhÃ´ng thá»ƒ táº£i thÃ´ng tin thanh toÃ¡n
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                        Vui lÃ²ng thá»­ láº¡i hoáº·c quay vá» giá» hÃ ng Ä‘á»ƒ kiá»ƒm tra sáº£n
                        pháº©m.
                    </p>
                    <Link
                        href="/cart"
                        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" /> Quay
                        láº¡i giá» hÃ ng
                    </Link>
                </section>
            </CheckoutShell>
        );
    }

    const cart = cartQuery.data;
    const quote = quoteQuery.data;
    if (cart.items.length === 0) {
        return (
            <CheckoutShell compact>
                <section className="relative mx-auto flex min-h-[320px] max-w-2xl items-center justify-center overflow-hidden rounded-[2rem] border border-zinc-200 bg-white px-6 py-10 text-center shadow-[0_20px_60px_-36px_rgba(24,24,27,0.45)] sm:min-h-[360px] sm:px-12">
                    <div className="relative flex max-w-md flex-col items-center">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl shadow-zinc-950/15">
                            <PackageCheck
                                className="size-7"
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </div>
                        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                            Sáºµn sÃ ng mua sáº¯m
                        </p>
                        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                            Giá» hÃ ng Ä‘ang trá»‘ng
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            ThÃªm sáº£n pháº©m Ä‘á»ƒ báº¯t Ä‘áº§u thanh toÃ¡n Ä‘Æ¡n hÃ ng cá»§a
                            báº¡n.
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-flex h-10 items-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                        >
                            KhÃ¡m phÃ¡ sáº£n pháº©m
                        </Link>
                    </div>
                </section>
            </CheckoutShell>
        );
    }

    return (
        <CheckoutShell>
            <div className="mx-auto w-full max-w-7xl">
                <div className="mb-5 border-b border-zinc-200 pb-5 sm:mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <Link
                                href="/cart"
                                className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
                            >
                                <span className="flex size-7 items-center justify-center rounded-full border border-zinc-200 bg-white transition group-hover:border-zinc-950">
                                    <ArrowLeft
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                </span>
                                Quay láº¡i giá» hÃ ng
                            </Link>
                            <div className="mt-3">
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                    Thanh toÃ¡n
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm leading-5 text-zinc-500">
                                    Chá»n Ä‘á»‹a chá»‰ nháº­n hÃ ng vÃ  xÃ¡c nháº­n Ä‘Æ¡n COD.
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-600 shadow-sm">
                            <ShieldCheck
                                className="size-3.5 text-emerald-600"
                                aria-hidden="true"
                            />
                            Thanh toÃ¡n an toÃ n
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-5">
                        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                        BÆ°á»›c 01
                                    </p>
                                    <h2 className="mt-2 text-xl font-bold text-zinc-950">
                                        Äá»‹a chá»‰ giao hÃ ng
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Chá»n Ä‘á»‹a chá»‰ báº¡n muá»‘n nháº­n Ä‘Æ¡n hÃ ng.
                                    </p>
                                </div>
                                <MapPin
                                    className="size-5 text-zinc-400"
                                    aria-hidden="true"
                                />
                            </div>

                            {addresses.length > 0 ? (
                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    {addresses.map((address) => (
                                        <CheckoutAddressCard
                                            key={address.id}
                                            address={address}
                                            selected={
                                                address.id === activeAddressId
                                            }
                                            onSelect={() =>
                                                setSelectedAddressId(address.id)
                                            }
                                            onEdit={() =>
                                                handleEditAddress(address)
                                            }
                                            onDelete={() =>
                                                setDeletingAddress(address)
                                            }
                                            deleting={
                                                deleteAddressMutation.isPending &&
                                                deleteAddressMutation.variables ===
                                                    address.id
                                            }
                                            formatAddress={formatAddress}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm leading-6 text-zinc-600">
                                    Báº¡n chÆ°a cÃ³ Ä‘á»‹a chá»‰ giao hÃ ng. ThÃªm Ä‘á»‹a chá»‰
                                    má»›i Ä‘á»ƒ tiáº¿p tá»¥c.
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    if (showAddressForm) {
                                        handleCancelAddressForm();
                                    } else {
                                        setEditingAddress(undefined);
                                        setShowAddressForm(true);
                                    }
                                }}
                                className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-zinc-950 transition hover:text-zinc-500"
                            >
                                <span className="flex size-7 items-center justify-center rounded-lg border border-zinc-200">
                                    <Plus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </span>
                                {showAddressForm
                                    ? 'ÄÃ³ng form Ä‘á»‹a chá»‰'
                                    : 'ThÃªm Ä‘á»‹a chá»‰ má»›i'}
                            </button>

                            {showAddressForm ? (
                                <AddressForm
                                    key={editingAddress?.id ?? 'new'}
                                    pending={
                                        createAddressMutation.isPending ||
                                        updateAddressMutation.isPending
                                    }
                                    initialAddress={editingAddress}
                                    onSubmit={handleSaveAddress}
                                    onCancel={handleCancelAddressForm}
                                />
                            ) : null}
                        </section>

                        <AlertDialog
                            open={Boolean(deletingAddress)}
                            onOpenChange={(open) => {
                                if (!deleteAddressMutation.isPending && !open) {
                                    setDeletingAddress(null);
                                }
                            }}
                        >
                            <AlertDialogContent className="max-w-md">
                                <AlertDialogHeader>
                                    <div className="mb-1 flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                        <AlertTriangle
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <AlertDialogTitle>
                                        XÃ³a Ä‘á»‹a chá»‰ giao hÃ ng?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Äá»‹a chá»‰ nÃ y sáº½ bá»‹ xÃ³a khá»i danh sÃ¡ch sá»­
                                        dá»¥ng khi thanh toÃ¡n. ÄÆ¡n hÃ ng Ä‘Ã£ táº¡o
                                        trÆ°á»›c Ä‘Ã³ váº«n giá»¯ nguyÃªn thÃ´ng tin.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                {deletingAddress ? (
                                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                                        <p className="font-semibold text-zinc-950">
                                            {deletingAddress.fullName}
                                        </p>
                                        <p className="mt-1 text-zinc-500">
                                            {deletingAddress.phone}
                                        </p>
                                        <p className="mt-2 leading-5 text-zinc-600">
                                            {formatAddress(deletingAddress)}
                                        </p>
                                    </div>
                                ) : null}

                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                        disabled={
                                            deleteAddressMutation.isPending
                                        }
                                    >
                                        Há»§y
                                    </AlertDialogCancel>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={
                                            deleteAddressMutation.isPending
                                        }
                                        onClick={handleDeleteAddress}
                                    >
                                        {deleteAddressMutation.isPending ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                        XÃ³a Ä‘á»‹a chá»‰
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start gap-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                                    <CreditCard
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                        BÆ°á»›c 02
                                    </p>
                                    <h2 className="mt-2 text-xl font-bold text-zinc-950">
                                        PhÆ°Æ¡ng thá»©c thanh toÃ¡n
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Phase 1 há»— trá»£ thanh toÃ¡n khi nháº­n hÃ ng.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-zinc-950 bg-zinc-50 p-4">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                    <Truck
                                        className="size-5"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-zinc-950">
                                        Thanh toÃ¡n khi nháº­n hÃ ng (COD)
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Thanh toÃ¡n trá»±c tiáº¿p cho Ä‘Æ¡n vá»‹ giao
                                        hÃ ng.
                                    </p>
                                </div>
                                <CheckCircle2
                                    className="size-5 shrink-0 text-zinc-950"
                                    aria-hidden="true"
                                />
                            </div>
                            <label className="mt-6 block">
                                <span className="text-sm font-semibold text-zinc-800">
                                    Ghi chÃº cho ngÆ°á»i bÃ¡n{' '}
                                    <span className="font-normal text-zinc-400">
                                        (khÃ´ng báº¯t buá»™c)
                                    </span>
                                </span>
                                <textarea
                                    value={note}
                                    onChange={(event) =>
                                        setNote(event.target.value)
                                    }
                                    maxLength={500}
                                    rows={3}
                                    placeholder="VÃ­ dá»¥: Giao giá» hÃ nh chÃ­nh..."
                                    className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5"
                                />
                            </label>
                        </section>
                    </div>

                    <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-24">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                <PackageCheck
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold text-zinc-950">
                                    TÃ³m táº¯t Ä‘Æ¡n hÃ ng
                                </h2>
                                <p className="text-sm text-zinc-500">
                                    {cart.totalItems} sáº£n pháº©m
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4 border-t border-zinc-100 pt-5">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <PackageCheck
                                                className="m-4 size-6 text-zinc-300"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm font-semibold text-zinc-800">
                                            {item.productName}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {item.variantName} Â· SL:{' '}
                                            {item.quantity}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-zinc-950">
                                        {formatPrice(item.lineTotal)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 border-t border-zinc-100 pt-5">
                            <div className="space-y-3 rounded-2xl bg-zinc-50/80 p-4 text-sm">
                                <div className="flex items-center justify-between gap-4 text-zinc-500">
                                    <span>Táº¡m tÃ­nh</span>
                                    <span className="font-medium text-zinc-800">
                                        {formatPrice(
                                            quote?.subtotal ?? cart.subtotal,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <span>PhÃ­ váº­n chuyá»ƒn</span>
                                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-zinc-200">
                                            GHN
                                        </span>
                                    </div>
                                    {quoteQuery.isFetching && !quote ? (
                                        <span className="font-medium text-zinc-600">
                                            Äang tÃ­nh...
                                        </span>
                                    ) : quote ? (
                                        <span className="font-semibold text-zinc-900">
                                            {Number(quote.shippingFee) === 0
                                                ? 'Miá»…n phÃ­'
                                                : formatPrice(
                                                      quote.shippingFee,
                                                  )}
                                        </span>
                                    ) : quoteQuery.isError ? (
                                        <span className="font-medium text-red-600">
                                            ChÆ°a tÃ­nh Ä‘Æ°á»£c
                                        </span>
                                    ) : (
                                        <span className="font-medium text-zinc-400">
                                            Chá»n Ä‘á»‹a chá»‰
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Tá»•ng thanh toÃ¡n
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        ÄÃ£ bao gá»“m phÃ­ giao hÃ ng
                                    </p>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-zinc-950">
                                    {quote
                                        ? formatPrice(quote.totalAmount)
                                        : 'â€”'}
                                </span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-zinc-400">
                            GiÃ¡ vÃ  tá»“n kho sáº½ Ä‘Æ°á»£c kiá»ƒm tra láº¡i á»Ÿ mÃ¡y chá»§ trÆ°á»›c
                            khi Ä‘Æ¡n Ä‘Æ°á»£c xÃ¡c nháº­n.
                        </p>
                        <CheckoutShippingQuoteNotice
                            isPending={quoteQuery.isFetching}
                            isError={quoteQuery.isError}
                            isAddressResolving={false}
                            mappingRequired={false}
                            shippingFee={
                                quote
                                    ? formatPrice(quote.shippingFee)
                                    : undefined
                            }
                            shippingFeeBreakdown={quote?.shippingFeeBreakdown}
                            onRetry={() => {
                                void quoteQuery.refetch();
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleSubmitOrder}
                            disabled={
                                orderMutation.isPending ||
                                !activeAddressId ||
                                quoteQuery.isPending ||
                                quoteQuery.isError ||
                                !quoteQuery.data
                            }
                            className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {orderMutation.isPending ? (
                                <>
                                    <Loader2
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />{' '}
                                    Äang xÃ¡c nháº­n...
                                </>
                            ) : (
                                <>
                                    Äáº·t hÃ ng COD{' '}
                                    <Check
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </>
                            )}
                        </button>
                    </aside>
                </div>
            </div>
        </CheckoutShell>
    );
}

// Bá»c checkout báº±ng ná»n trung tÃ­nh; tráº¡ng thÃ¡i rá»—ng dÃ¹ng khung ngáº¯n hÆ¡n Ä‘á»ƒ khÃ´ng táº¡o cáº£m giÃ¡c trang bá»‹ kÃ©o dÃ i vÃ´ Ã­ch.

