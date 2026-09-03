// Trạng thái shop không còn hoạt động được trình bày rõ ràng thay vì trả trang 404 hoặc catalog rỗng khó hiểu.
// Hiển thị lý do shop tạm ngưng hoặc đóng để customer không nhầm với lỗi tải dữ liệu.
export function ShopClosedState({
    status,
}: {
    status: 'suspended' | 'closed';
}) {
    return (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
            <p className="text-lg font-bold text-zinc-950">
                Shop tạm thời không nhận đơn
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                {status === 'suspended'
                    ? 'Shop đang được tạm khóa để kiểm tra. Catalog sẽ hiển thị lại khi shop hoạt động.'
                    : 'Shop đã đóng và hiện không còn sản phẩm để mua.'}
            </p>
        </div>
    );
}
