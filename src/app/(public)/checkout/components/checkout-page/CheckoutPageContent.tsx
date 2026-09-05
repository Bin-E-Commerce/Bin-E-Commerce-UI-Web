// Component này trình bày checkout Phase 1: chọn địa chỉ, xác nhận COD và kết quả tạo đơn.
// Form không nhận item hoặc giá từ người dùng; Cart/Order Service là nguồn dữ liệu và phép tính chính thức.
// Các trạng thái loading, lỗi, rỗng địa chỉ và thành công được hiển thị riêng để người dùng luôn biết bước tiếp theo.

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

// Định dạng tiền VND tại lớp trình bày, còn subtotal/total authoritative vẫn lấy nguyên từ backend.
function formatPrice(value: string): string {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Trả địa chỉ thành một dòng dễ quét trong card mà không làm mất các thành phần hành chính.
function formatAddress(address: UserAddress): string {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.province}`;
}

// Tạo checkout page hoàn chỉnh từ cart, address query và order mutation đã tách riêng khỏi UI.
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

    // Chỉ chặn guest sau khi initAuth hoàn tất; nếu chạy sớm hơn, refresh checkout sẽ redirect sai trước khi cookie được restore.
    useEffect(() => {
        if (initialized && !isAuthenticated) {
            window.location.replace('/login?redirect=%2Fcheckout');
        }
    }, [initialized, isAuthenticated]);

    // Lưu mới hoặc cập nhật địa chỉ, sau đó chọn địa chỉ vừa được server xác nhận.
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
            // Mutation đã hiển thị lỗi qua onError; handler chỉ ngăn lỗi promise nổi lên thành unhandled rejection.
            return false;
        }
    }

    // Mở lại form với snapshot địa chỉ hiện tại để người dùng sửa mà không phải nhập lại từ đầu.
    function handleEditAddress(address: UserAddress): void {
        setEditingAddress(address);
        setShowAddressForm(true);
    }

    // Đóng form và xóa trạng thái chỉnh sửa để lần thêm tiếp theo luôn bắt đầu từ dữ liệu rỗng.
    function handleCancelAddressForm(): void {
        setShowAddressForm(false);
        setEditingAddress(undefined);
    }

    // Xác nhận xóa ở server rồi bỏ địa chỉ khỏi lựa chọn hiện tại nếu card đó đang được dùng.
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
            // Mutation đã hiển thị lỗi; giữ dialog mở để người dùng biết thao tác chưa hoàn tất.
        }
    }

    // Chỉ gửi đơn sau khi địa chỉ hợp lệ và quote đã thành công; nếu quote lỗi, backend có thể không biết phí cần thu.
    // Chặn ở cả handler lẫn nút để bảo vệ luồng checkout khi trạng thái query thay đổi giữa hai lần render.
    function handleSubmitOrder(): void {
        if (!activeAddressId) {
            toast.error('Vui lòng chọn hoặc thêm địa chỉ giao hàng.');
            return;
        }
        if (quoteQuery.isPending || quoteQuery.isError || !quoteQuery.data) {
            toast.error(
                'Chưa thể tính phí giao hàng. Vui lòng thử lại trước khi đặt hàng.',
            );
            return;
        }
        orderMutation.mutate(
            {
                shippingAddressId: activeAddressId,
                note: note.trim() || undefined,
            },
            {
                // Chuyển thẳng đến detail order vừa tạo để khách hàng thấy ngay mã đơn, trạng thái và snapshot giao hàng.
                onSuccess: (order) =>
                    router.replace(`/profile/orders/${order.id}`),
            },
        );
    }

    if (!initialized || cartQuery.isPending || addressesQuery.isPending) {
        return (
            <CheckoutShell>
                <LoadingState label="Đang chuẩn bị trang thanh toán..." />
            </CheckoutShell>
        );
    }

    if (!isAuthenticated) {
        return (
            <CheckoutShell>
                <LoadingState label="Đang chuyển tới trang đăng nhập..." />
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
                        Không thể tải thông tin thanh toán
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">
                        Vui lòng thử lại hoặc quay về giỏ hàng để kiểm tra sản
                        phẩm.
                    </p>
                    <Link
                        href="/cart"
                        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" /> Quay
                        lại giỏ hàng
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
                            Sẵn sàng mua sắm
                        </p>
                        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                            Giỏ hàng đang trống
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Thêm sản phẩm để bắt đầu thanh toán đơn hàng của
                            bạn.
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-flex h-10 items-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                        >
                            Khám phá sản phẩm
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
                                Quay lại giỏ hàng
                            </Link>
                            <div className="mt-3">
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                    Thanh toán
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm leading-5 text-zinc-500">
                                    Chọn địa chỉ nhận hàng và xác nhận đơn COD.
                                </p>
                            </div>
                        </div>
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-600 shadow-sm">
                            <ShieldCheck
                                className="size-3.5 text-emerald-600"
                                aria-hidden="true"
                            />
                            Thanh toán an toàn
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-5">
                        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                        Bước 01
                                    </p>
                                    <h2 className="mt-2 text-xl font-bold text-zinc-950">
                                        Địa chỉ giao hàng
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Chọn địa chỉ bạn muốn nhận đơn hàng.
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
                                    Bạn chưa có địa chỉ giao hàng. Thêm địa chỉ
                                    mới để tiếp tục.
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
                                    ? 'Đóng form địa chỉ'
                                    : 'Thêm địa chỉ mới'}
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
                                        Xóa địa chỉ giao hàng?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Địa chỉ này sẽ bị xóa khỏi danh sách sử
                                        dụng khi thanh toán. Đơn hàng đã tạo
                                        trước đó vẫn giữ nguyên thông tin.
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
                                        Hủy
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
                                        Xóa địa chỉ
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
                                        Bước 02
                                    </p>
                                    <h2 className="mt-2 text-xl font-bold text-zinc-950">
                                        Phương thức thanh toán
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Phase 1 hỗ trợ thanh toán khi nhận hàng.
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
                                        Thanh toán khi nhận hàng (COD)
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-500">
                                        Thanh toán trực tiếp cho đơn vị giao
                                        hàng.
                                    </p>
                                </div>
                                <CheckCircle2
                                    className="size-5 shrink-0 text-zinc-950"
                                    aria-hidden="true"
                                />
                            </div>
                            <label className="mt-6 block">
                                <span className="text-sm font-semibold text-zinc-800">
                                    Ghi chú cho người bán{' '}
                                    <span className="font-normal text-zinc-400">
                                        (không bắt buộc)
                                    </span>
                                </span>
                                <textarea
                                    value={note}
                                    onChange={(event) =>
                                        setNote(event.target.value)
                                    }
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Ví dụ: Giao giờ hành chính..."
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
                                    Tóm tắt đơn hàng
                                </h2>
                                <p className="text-sm text-zinc-500">
                                    {cart.totalItems} sản phẩm
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
                                            {item.variantName} · SL:{' '}
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
                                    <span>Tạm tính</span>
                                    <span className="font-medium text-zinc-800">
                                        {formatPrice(
                                            quote?.subtotal ?? cart.subtotal,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <span>Phí vận chuyển</span>
                                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 ring-1 ring-zinc-200">
                                            GHN
                                        </span>
                                    </div>
                                    {quoteQuery.isFetching && !quote ? (
                                        <span className="font-medium text-zinc-600">
                                            Đang tính...
                                        </span>
                                    ) : quote ? (
                                        <span className="font-semibold text-zinc-900">
                                            {Number(quote.shippingFee) === 0
                                                ? 'Miễn phí'
                                                : formatPrice(
                                                      quote.shippingFee,
                                                  )}
                                        </span>
                                    ) : quoteQuery.isError ? (
                                        <span className="font-medium text-red-600">
                                            Chưa tính được
                                        </span>
                                    ) : (
                                        <span className="font-medium text-zinc-400">
                                            Chọn địa chỉ
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-950">
                                        Tổng thanh toán
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        Đã bao gồm phí giao hàng
                                    </p>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-zinc-950">
                                    {quote
                                        ? formatPrice(quote.totalAmount)
                                        : '—'}
                                </span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-zinc-400">
                            Giá và tồn kho sẽ được kiểm tra lại ở máy chủ trước
                            khi đơn được xác nhận.
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
                                    Đang xác nhận...
                                </>
                            ) : (
                                <>
                                    Đặt hàng COD{' '}
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

// Bọc checkout bằng nền trung tính; trạng thái rỗng dùng khung ngắn hơn để không tạo cảm giác trang bị kéo dài vô ích.
