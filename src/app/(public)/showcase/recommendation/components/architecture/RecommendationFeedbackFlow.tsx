// Sơ đồ luồng feedback của Recommendation; tách đường Web và Order trước Kafka rồi mô tả hai projection consumer độc lập.
// Component chỉ giải thích pipeline hiện có, không phát event, đăng ký consumer hay thay đổi trạng thái runtime.
import {
    Activity,
    ArrowDown,
    Database,
    Radio,
    ShieldCheck,
    ShoppingCart,
    UserRound,
} from 'lucide-react';

// Dùng chung màu và cấu trúc header cho hai nguồn event; sau đó lần theo Kafka tới các projection không chặn request Web.
export function RecommendationFeedbackFlow() {
    return (
        <section className="min-w-0">
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <div className="relative -mx-4 -mt-4 mb-4 flex items-start gap-3 bg-white px-4 py-3 after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-zinc-200 after:content-[''] sm:-mx-5 sm:-mt-5 sm:px-5 sm:py-4">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                            <UserRound aria-hidden="true" className="size-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                Nguồn 01 · tín hiệu quan tâm
                            </p>
                            <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                                Tương tác trên Web
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Ghi lại điều người mua quan tâm trước khi phát
                                sinh giao dịch.
                            </p>
                        </div>
                    </div>
                    <ol className="mt-4 grid gap-2 sm:grid-cols-3">
                        <li className="h-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3 xl:min-h-44">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Bước 01
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-950">
                                Web Storefront
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Ghi impression, view, click, tìm kiếm và thêm
                                giỏ.
                            </p>
                        </li>
                        <li className="h-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3 xl:min-h-44">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Bước 02
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-950">
                                API Gateway
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Nhận event đơn/lô và identity user/guest.
                            </p>
                            <code className="mt-2 block break-words rounded-lg bg-zinc-50 px-2 py-1.5 text-[9px] leading-4 text-zinc-500">
                                POST /api/v1/recommendation/events ·
                                /events/batch
                            </code>
                        </li>
                        <li className="h-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3 xl:min-h-44">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Bước 03
                            </p>
                            <p className="mt-1 break-words text-[11px] font-semibold leading-4 text-zinc-950">
                                InteractionIngestionService
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Kiểm tra event, attribution; gắn eventId và giờ
                                server trước khi gửi Kafka.
                            </p>
                        </li>
                    </ol>
                    <dl className="mt-4 grid grow gap-3 border-t border-zinc-200 pt-3 sm:grid-cols-2">
                        <div className="min-w-0">
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Vì sao cần
                            </dt>
                            <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                Impression và click ghi nhận ý định sớm; item
                                token gắn hành vi với đúng sản phẩm, vị trí và
                                lượt gợi ý.
                            </dd>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Đánh đổi
                            </dt>
                            <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                Click không đảm bảo chuyển đổi. Attribution cần
                                token hợp lệ; batch 1–50 event phải hợp lệ toàn
                                bộ mới được gửi.
                            </dd>
                        </div>
                    </dl>
                </article>

                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                    <div className="relative -mx-4 -mt-4 mb-4 flex items-start gap-3 bg-white px-4 py-3 after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-zinc-200 after:content-[''] sm:-mx-5 sm:-mt-5 sm:px-5 sm:py-4">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                            <ShoppingCart
                                aria-hidden="true"
                                className="size-4"
                            />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                Nguồn 02 · giao dịch đã xác nhận
                            </p>
                            <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                                Mua hàng và hoàn hàng
                            </h4>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Chỉ ghi nhận giao dịch do Order Service xác
                                nhận, không suy đoán từ click.
                            </p>
                        </div>
                    </div>
                    <ol className="mt-4 grid gap-2 sm:grid-cols-3">
                        <li className="h-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3 xl:min-h-44">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Bước 01
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-950">
                                Order Service
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Phát event khi đơn hoàn tất hoặc hàng hoàn được
                                xác nhận.
                            </p>
                        </li>
                        <li className="h-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3 xl:min-h-44">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Bước 02
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-950">
                                PostgreSQL Outbox
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Ghi event cùng transaction cập nhật đơn hoặc
                                hoàn hàng.
                            </p>
                        </li>
                        <li className="h-full min-w-0 rounded-xl border border-zinc-200 bg-white p-3 xl:min-h-44">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Bước 03
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-950">
                                Outbox dispatcher
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Gửi event lên Kafka; retry nếu broker chưa xác
                                nhận.
                            </p>
                        </li>
                    </ol>
                    <dl className="mt-4 grid grow gap-3 border-t border-zinc-200 pt-3 sm:grid-cols-2">
                        <div className="min-w-0">
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Vì sao cần
                            </dt>
                            <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                Đơn hoàn tất là tín hiệu mua mạnh; hàng hoàn
                                giúp điều chỉnh lại tín hiệu đó.
                            </dd>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Đánh đổi
                            </dt>
                            <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                Chỉ có dữ liệu sau khi đơn được xác nhận. Outbox
                                tăng độ tin cậy nhưng projection vẫn cập nhật
                                bất đồng bộ.
                            </dd>
                        </div>
                    </dl>
                </article>
            </div>

            <div
                className="flex flex-col items-center py-4 text-zinc-400"
                aria-hidden="true"
            >
                <span className="h-3 w-px bg-zinc-300" />
                <ArrowDown className="size-4" />
            </div>

            <section
                className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                aria-label="Kafka nhận các event"
            >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.9fr)] lg:items-center lg:gap-6">
                    <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700">
                            <Radio aria-hidden="true" className="size-4" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                Event bus · buffer và phân phối
                            </p>
                            <h4 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                                Apache Kafka
                            </h4>
                            <p className="mt-2 text-xs leading-5 text-zinc-600">
                                Web chỉ trả HTTP 202 sau khi broker nhận event,
                                không chờ consumer xử lý xong. Với đơn hàng,
                                Order Service ghi event vào PostgreSQL Outbox
                                trước khi dispatcher gửi lên Kafka.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            Luồng event (Kafka topic)
                        </p>
                        <dl className="mt-1 divide-y divide-zinc-200">
                            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2 first:pt-1 last:pb-1">
                                <dt className="text-[11px] text-zinc-600">
                                    Hành vi Web
                                </dt>
                                <dd className="min-w-0">
                                    <code className="block break-words font-mono text-[10px] leading-4 text-zinc-800">
                                        recommendation.interactions.v1
                                    </code>
                                </dd>
                            </div>
                            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2 last:pb-1">
                                <dt className="text-[11px] text-zinc-600">
                                    Đơn hoàn tất
                                </dt>
                                <dd className="min-w-0">
                                    <code className="block break-words font-mono text-[10px] leading-4 text-zinc-800">
                                        order.purchase.completed
                                    </code>
                                </dd>
                            </div>
                            <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2 py-2 last:pb-1">
                                <dt className="text-[11px] text-zinc-600">
                                    Hàng hoàn
                                </dt>
                                <dd className="min-w-0">
                                    <code className="block break-words font-mono text-[10px] leading-4 text-zinc-800">
                                        order.purchase.returned
                                    </code>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 border-t border-zinc-200 pt-4 sm:grid-cols-2 sm:gap-6">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            Kafka giải quyết gì?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Kafka đệm event rồi phân phối cùng luồng cho hai
                            consumer group: một cập nhật hồ sơ, một dựng quan hệ
                            sản phẩm. Hai nhánh scale và retry độc lập; key
                            user/session giữ thứ tự tương đối của tương tác cùng
                            một người.
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            Đánh đổi &amp; xử lý lỗi
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            HTTP 202 chỉ xác nhận broker đã nhận, không có nghĩa
                            dữ liệu đã cập nhật. Consumer chỉ đánh dấu offset
                            sau xử lý; ledger chống ghi trùng nếu event được gửi
                            lại. Lỗi được retry giới hạn rồi chuyển vào
                            dead-letter queue (DLQ) để xử lý riêng. Nếu publish
                            Web lỗi, API trả 503; event đơn hàng còn trong
                            outbox để dispatcher gửi lại.
                        </p>
                    </div>
                </div>
            </section>

            <div className="mt-5">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                        Hai loại dữ liệu · hai điểm sử dụng
                    </p>
                    <h4 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                        Một nhánh hiểu người mua, một nhánh nối sản phẩm.
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                        Consumer 01 lưu người mua quan tâm gì; Consumer 02 tìm
                        các sản phẩm thường xuất hiện cùng nhau. Luồng đọc lấy
                        hai loại dữ liệu này khi Redis cache miss; cache hit trả
                        kết quả đã lưu.
                    </p>
                </div>
                <div
                    className="mt-3 grid grid-cols-2 gap-4 text-zinc-400"
                    aria-hidden="true"
                >
                    <ArrowDown className="mx-auto size-4" />
                    <ArrowDown className="mx-auto size-4" />
                </div>

                <div className="grid items-stretch gap-4 lg:grid-cols-2">
                    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <div className="relative flex items-start gap-3 pb-3 after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                                <Activity
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                    Consumer group 01 · hồ sơ người mua
                                </p>
                                <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                                    KafkaConsumerService
                                </h4>
                            </div>
                        </div>
                        <dl className="mt-4">
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3 first:border-t-0 first:pt-0">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Dữ liệu tạo ra
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Hồ sơ gắn với user/session: người này quan
                                    tâm sản phẩm, danh mục hay thương hiệu nào.
                                    Đây là tín hiệu riêng theo người mua.
                                </dd>
                            </div>
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Cách xử lý
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Ledger chống trùng; PostgreSQL lưu
                                    projection, Redis cập nhật session khách và
                                    xóa cache liên quan. Mua/hoàn điều chỉnh
                                    preference theo số lượng.
                                </dd>
                            </div>
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Luồng đọc dùng ở đâu?
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Cache miss → “Hồ sơ lâu dài + ý định trong
                                    phiên”. Sở thích giúp tìm ứng viên theo món,
                                    danh mục, thương hiệu và trở thành tín hiệu
                                    chấm điểm; sản phẩm vừa xem làm mốc tìm món
                                    tương tự hoặc thường mua cùng.
                                </dd>
                            </div>
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3 last:pb-0">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Đánh đổi
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Profile đổi sau khi consumer xử lý xong;
                                    request gợi ý không chờ nhánh ghi này.
                                </dd>
                            </div>
                        </dl>
                    </article>

                    <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <div className="relative flex items-start gap-3 pb-3 after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                                <Database
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                    Consumer group 02 · quan hệ sản phẩm
                                </p>
                                <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                                    RelationConsumerService
                                </h4>
                            </div>
                        </div>
                        <dl className="mt-4">
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3 first:border-t-0 first:pt-0">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Dữ liệu tạo ra
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Quan hệ giữa các cặp sản phẩm (A → B), tổng
                                    hợp từ lượt xem, thêm giỏ và đơn mua; không
                                    phải hồ sơ sở thích của một người cụ thể.
                                </dd>
                            </div>
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Cách tạo
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Ghép view/click trong 30 phút, add-to-cart
                                    trong 7 ngày và sản phẩm cùng đơn; hoàn hàng
                                    tạo điều chỉnh âm.
                                </dd>
                            </div>
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Luồng đọc dùng ở đâu?
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Cache miss → “Tạo ứng viên”, nguồn
                                    CO_BEHAVIOR. RelationCandidateService tìm
                                    món thường đi cùng sản phẩm đang xem hoặc
                                    vừa quan tâm; CandidateUnionService nhập
                                    chúng vào pool. Sau đó Standard/AI-Enhanced
                                    mới chấm điểm và quyết định thứ tự.
                                </dd>
                            </div>
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-t border-zinc-200 py-3 last:pb-0">
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                    Đánh đổi
                                </dt>
                                <dd className="text-xs leading-5 text-zinc-600">
                                    Cần đủ event và sản phẩm mốc; hàng mới có
                                    thể chưa có quan hệ. Cửa sổ giới hạn liên hệ
                                    quá xa.
                                </dd>
                            </div>
                        </dl>
                    </article>
                </div>
            </div>

            <div className="mt-4 flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-zinc-700 ring-1 ring-zinc-200">
                    <ShieldCheck aria-hidden="true" className="size-4" />
                </span>
                <div>
                    <p className="text-sm font-semibold text-zinc-950">
                        Nhận event không đồng nghĩa hồ sơ đã cập nhật.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                        HTTP 202 xác nhận event Web đã vào hàng đợi; Order
                        Service dùng outbox để không mất event khi cập nhật đơn.
                        Hai consumer xử lý nền, nên hồ sơ và quan hệ chỉ ảnh
                        hưởng request gợi ý sau khi projection hoàn tất.
                    </p>
                </div>
            </div>
        </section>
    );
}
