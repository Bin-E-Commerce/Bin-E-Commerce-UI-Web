// Component này giải thích nguồn dữ liệu và phép tính của từng tiêu chí Standard Ranking.
// Nó chỉ trình bày logic backend hiện có, không tính lại điểm hay thay đổi policy.
// Mọi công thức hiển thị phải tiếp tục khớp với RankingFeatureService và RecommendationRankingService.

import type { ReactNode } from 'react';

export type RankingWeightKey =
    | 'profileAffinity'
    | 'sessionContext'
    | 'semanticSimilarity'
    | 'coBehavior'
    | 'popularity'
    | 'freshness'
    | 'quality'
    | 'exploration';

interface RankingWeightDetailsProps {
    id: string;
    signal: RankingWeightKey;
    weightPercent: number;
}

interface DetailSectionProps {
    title: string;
    children: ReactNode;
}

interface DetailTermProps {
    term: string;
    children: ReactNode;
}

interface DetailFormulaProps {
    children: ReactNode;
}

// Gom từng ý thành khối ngắn để người vận hành quét nhanh mà không làm rối công thức.
function DetailSection({ title, children }: DetailSectionProps) {
    return (
        <section>
            <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
            <div className="mt-1 text-sm leading-6 text-zinc-600">
                {children}
            </div>
        </section>
    );
}

// Đặt tên biến cạnh lời giải thích tiếng Việt để người đọc không cần tự đoán ký hiệu trong công thức.
function DetailTerm({ term, children }: DetailTermProps) {
    return (
        <li className="leading-6">
            <code className="rounded bg-white px-1 text-zinc-900">{term}</code>
            <span className="text-zinc-600"> — {children}</span>
        </li>
    );
}

// Tách công thức khỏi phần diễn giải để người đọc nhìn thấy biểu thức trước, rồi mới đọc ý nghĩa từng biến.
function DetailFormula({ children }: DetailFormulaProps) {
    return (
        <section className="rounded-md border border-zinc-200 bg-white p-3">
            <h4 className="text-sm font-semibold text-zinc-900">
                Công thức đầy đủ
            </h4>
            <div className="mt-2 space-y-1 break-words font-mono text-[13px] leading-6 text-zinc-900">
                {children}
            </div>
        </section>
    );
}

// Chọn giải thích theo tiêu chí; mọi công thức ở đây bám theo điểm backend trước khi nhân tỷ trọng.
// Tín hiệu thiếu dữ liệu phải được diễn đạt là 0 hoặc fallback đúng như code, không giả định hệ thống tự học.
// weightPercent chỉ phản ánh cấu hình đang nhập; backend chuẩn hóa tổng weight khi chấm điểm.
export function RankingWeightDetails({
    id,
    signal,
    weightPercent,
}: RankingWeightDetailsProps) {
    return (
        <div id={id} className="mt-3 space-y-3 border-t border-zinc-200 pt-3">
            <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-600">
                <p>
                    <span className="font-semibold text-zinc-900">
                        Tỷ trọng {weightPercent}%
                    </span>{' '}
                    là mức quan trọng bạn dành cho tiêu chí này, không phải điểm
                    sản phẩm đạt được. Điểm riêng của tiêu chí nằm trong khoảng
                    0–1: 0 là không có dấu hiệu phù hợp, 1 là mức tối đa công
                    thức cho phép. Ví dụ 0.8 tương đương 80/100 điểm riêng; nó
                    không có nghĩa người dùng có 80% khả năng mua.
                </p>
                <p className="mt-1">
                    Khi chấm điểm, hệ thống cộng tất cả tỷ trọng rồi chia tỷ
                    trọng của tiêu chí này cho tổng đó. Ví dụ 25% trên tổng 100%
                    trở thành 0.25; điểm riêng 0.8 × 0.25 = 0.20, tức đóng góp
                    20/100 điểm tổng. Nếu tổng các ô là 80%, một ô 20% được quy
                    đổi thành 20 ÷ 80 = 25% trước khi tính. Nếu tất cả tỷ trọng
                    đều bằng 0, hệ thống quay về bộ mặc định thay vì chia cho 0.
                </p>
                <p className="mt-2 border-t border-zinc-200 pt-2">
                    <strong className="text-zinc-900">
                        Lưu ý về các con số:
                    </strong>{' '}
                    tỷ trọng trong các ô là thứ bạn đang chỉnh. Còn các số nằm
                    bên trong công thức như 0.6, 7 ngày hay 12 là quy tắc mặc
                    định do dự án đặt để bắt đầu — không phải kết quả hệ thống
                    đã học từ khách hàng thật. Một số có thể đổi trong cấu hình
                    dịch vụ; những số khác hiện cố định trong code. Đây là
                    Standard Ranking, không phải mô hình AI-Enhanced Ranking.
                </p>
            </div>
            <div className="space-y-4 rounded-md bg-zinc-50 p-4">
                {signal === 'profileAffinity' ? (
                    <>
                        <DetailFormula>
                            <p>
                                Điểm từng sở thích = giới hạn 0–1 [max(0, điểm
                                tích lũy × 0.5^(số ngày ÷ số ngày giảm một nửa))
                                ÷ 8]
                            </p>
                            <p>
                                Độ phù hợp hồ sơ = giới hạn 0–1 [điểm sản phẩm +
                                0.6 × điểm danh mục + 0.4 × điểm thương hiệu]
                            </p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Hệ thống nhìn vào lịch sử để xem người dùng từng
                            quan tâm đến chính sản phẩm này, nhóm hàng của nó,
                            hay thương hiệu của nó chưa. Khớp đúng sản phẩm được
                            tính mạnh nhất; khớp nhóm hàng hoặc thương hiệu vẫn
                            có ích nhưng được cộng ít hơn.
                        </DetailSection>
                        <DetailSection title="Hệ thống lấy dữ liệu nào?">
                            <p>
                                Mỗi hành động sẽ cộng hoặc trừ điểm vào lịch sử
                                sở thích của người dùng. Mặc định các điểm là:
                            </p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                <li>
                                    Thấy sản phẩm được hiển thị: +0.05 điểm.
                                </li>
                                <li>Xem sản phẩm: +1 điểm.</li>
                                <li>Bấm vào sản phẩm: +2 điểm.</li>
                                <li>Thêm vào giỏ: +4 điểm.</li>
                                <li>Bỏ khỏi giỏ: −2 điểm.</li>
                                <li>Tìm kiếm: +1.5 điểm.</li>
                                <li>Mua hàng: +8 điểm cho mỗi sản phẩm.</li>
                                <li>Hoàn trả: −8 điểm cho mỗi sản phẩm.</li>
                            </ul>
                            <p className="mt-1">
                                Ví dụ mua 2 sản phẩm sẽ cộng 16 điểm cho sản
                                phẩm đó. Điểm tìm kiếm chỉ cộng vào sản phẩm,
                                danh mục hoặc thương hiệu nếu hành động tìm kiếm
                                có thông tin tương ứng; riêng nội dung từ khóa
                                được lưu nhưng không được dùng trong phép tính
                                này. Các điểm mặc định có thể thay đổi bằng cấu
                                hình. Danh mục và thương hiệu lấy từ thông tin
                                sản phẩm trong hệ thống.
                            </p>
                        </DetailSection>
                        <DetailSection title="Mỗi phần trong công thức nghĩa là gì?">
                            <ul className="space-y-1.5">
                                <DetailTerm term="điểm_lưu">
                                    Tổng điểm đã tích lũy cho một sản phẩm, một
                                    danh mục hoặc một thương hiệu. Ví dụ hai lần
                                    xem và một lần bấm có điểm mặc định là 1 + 1
                                    + 2 = 4.
                                </DetailTerm>
                                <DetailTerm term="số_ngày">
                                    Số ngày từ lần tương tác gần nhất với đúng
                                    mục đó đến hiện tại. Mục mới tương tác thì
                                    số này gần 0.
                                </DetailTerm>
                                <DetailTerm term="halfLifeDays">
                                    Số ngày để điểm sở thích giảm còn một nửa.
                                    Mặc định là 7 ngày; có thể đổi bằng cấu
                                    hình.
                                </DetailTerm>
                                <DetailTerm term="0.5^(số_ngày / halfLifeDays)">
                                    Hệ số làm điểm cũ yếu dần. Ví dụ một sở
                                    thích có 8 điểm: ngay sau tương tác vẫn là
                                    8; sau 7 ngày còn 8 × 0.5 = 4; sau 14 ngày
                                    còn 8 × 0.25 = 2. Như vậy hệ thống ưu tiên
                                    điều người dùng quan tâm gần đây hơn.
                                </DetailTerm>
                                <DetailTerm term="chia cho 8">
                                    Đổi điểm hành vi sang thang 0–1. Điểm 8 trở
                                    lên được xem là mức tối đa 1; 4 điểm thành
                                    0.5; 0 điểm thành 0.
                                </DetailTerm>
                                <DetailTerm term="max(0, điểm đã giảm)">
                                    Chỉ lấy sở thích dương cho phần phù hợp. Nếu
                                    điểm đang âm, phần phù hợp này nhận 0. Nói
                                    cách khác, không thích không thể biến thành
                                    “thích”; nó chỉ làm giảm tổng điểm ở khoản
                                    trừ riêng.
                                </DetailTerm>
                                <DetailTerm term="0.6 × điểm danh mục; 0.4 × điểm thương hiệu">
                                    Điểm khớp danh mục được nhân 0.6; điểm khớp
                                    thương hiệu được nhân 0.4. Ví dụ danh mục
                                    đạt 0.5 thì đóng góp 0.5 × 0.6 = 0.3; thương
                                    hiệu đạt 0.5 thì đóng góp 0.5 × 0.4 = 0.2.
                                    Khớp đúng sản phẩm không bị nhân giảm.
                                </DetailTerm>
                                <DetailTerm term="giới hạn trong 0–1">
                                    Tổng cao hơn 1 vẫn chỉ nhận 1, để một tiêu
                                    chí không vượt thang điểm chung.
                                </DetailTerm>
                            </ul>
                            <p className="mt-2">
                                Nói gọn: điểm sở thích sau khi giảm theo thời
                                gian → đổi về 0–1 → cộng điểm sản phẩm, danh mục
                                và thương hiệu.
                            </p>
                        </DetailSection>
                        <DetailSection title="Ví dụ tính từng bước">
                            <p>
                                Giả sử sau khi tính độ cũ/mới, hồ sơ đang có:
                                sản phẩm này 4 điểm, danh mục 4 điểm và thương
                                hiệu 2 điểm.
                            </p>
                            <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                                <li>Sản phẩm: 4 ÷ 8 = 0.5 điểm phù hợp.</li>
                                <li>Danh mục: 4 ÷ 8 = 0.5; nhân 0.6 = 0.3.</li>
                                <li>
                                    Thương hiệu: 2 ÷ 8 = 0.25; nhân 0.4 = 0.1.
                                </li>
                            </ol>
                            <p className="mt-1">
                                Cộng lại: 0.5 + 0.3 + 0.1 ={' '}
                                <strong className="text-zinc-900">0.9</strong>.
                                Nghĩa là sản phẩm khớp khá mạnh với hồ sơ ở tiêu
                                chí này; không có nghĩa người dùng có 90% khả
                                năng mua.
                            </p>
                        </DetailSection>
                        <DetailSection title="Lưu ý về thời gian và điểm âm">
                            Hệ thống giảm tổng điểm đang lưu cho từng sản phẩm,
                            danh mục hoặc thương hiệu dựa theo lần tương tác gần
                            nhất với mục đó; không tính tuổi riêng cho từng lượt
                            xem hay lượt mua cũ. Điểm âm như bỏ giỏ hoặc hoàn
                            trả không làm tăng độ phù hợp, mà có thể làm giảm
                            điểm cuối qua khoản trừ riêng. Nếu chưa có lịch sử
                            thì tiêu chí này bằng 0, các tiêu chí khác vẫn có
                            thể xếp hạng sản phẩm.
                        </DetailSection>
                        <DetailSection title="Khoản trừ vì người dùng không thích được tính ra sao?">
                            <ul className="space-y-1.5">
                                <DetailTerm term="điểm âm">
                                    Điểm âm trong hồ sơ của đúng sản phẩm, danh
                                    mục hoặc thương hiệu đang được chấm, thường
                                    đến từ hành động như bỏ giỏ hoặc hoàn trả.
                                </DetailTerm>
                                <DetailTerm term="chia độ lớn điểm âm cho 8">
                                    Đổi mức không thích sang thang chung. Ví dụ
                                    −4 điểm thành 4 ÷ 8 = 0.5; dấu trừ chỉ dùng
                                    để nhận ra đây là sở thích âm.
                                </DetailTerm>
                                <DetailTerm term="cộng các điểm âm rồi nhân 0.15">
                                    Nhiều dấu hiệu không thích có thể cộng lại.
                                    Kết quả bị giới hạn tối đa 0.15, tức tối đa
                                    15 điểm trên thang 100.
                                </DetailTerm>
                            </ul>
                            <p className="mt-1">
                                Ví dụ một sở thích âm −4 điểm, chưa tính giảm
                                theo thời gian, tạo khoản trừ (4 ÷ 8) × 0.15 ={' '}
                                <strong className="text-zinc-900">0.075</strong>
                                , tương đương 7.5 điểm trên thang 100. Nếu tổng
                                khoản trừ lớn hơn 0.15 thì chỉ trừ 0.15.
                            </p>
                        </DetailSection>
                    </>
                ) : null}

                {signal === 'sessionContext' ? (
                    <>
                        <DetailFormula>
                            <p>
                                Điểm ngữ cảnh = giới hạn 0–1 [(khớp danh mục ?
                                0.60 : 0) + (khớp thương hiệu ? 0.25 : 0) +
                                (được gợi ý từ sản phẩm hiện tại ? 0.15 : 0)]
                            </p>
                            <p>
                                Mỗi điều kiện trong ngoặc nhận 1 nếu đúng, 0 nếu
                                sai.
                            </p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Đây là phần ghi nhận điều người dùng đang quan tâm
                            trong lần ghé thăm hiện tại. Khác với hồ sơ dài hạn,
                            nó giúp gợi ý thay đổi nhanh khi người dùng vừa xem
                            một nhóm hàng hoặc thương hiệu nào đó.
                        </DetailSection>
                        <DetailSection title="Hệ thống nhớ những gì trong lần ghé thăm?">
                            Trong lúc người dùng ghé website, hệ thống nhớ tạm
                            các danh mục/thương hiệu người dùng vừa tương tác và
                            sản phẩm gần nhất họ thật sự xem hoặc bấm. Dữ liệu
                            này chỉ được nhớ tạm trong lần ghé thăm, không phải
                            toàn bộ lịch sử dài hạn. Chỉ nhìn thấy sản phẩm trên
                            màn hình mà chưa xem/bấm thì không đổi sản phẩm hiện
                            tại.
                        </DetailSection>
                        <DetailSection title="Các con số trong cách tính">
                            <ul className="space-y-1.5">
                                <DetailTerm term="0.60 điểm">
                                    Cộng khi sản phẩm đang chấm thuộc danh mục
                                    người dùng vừa xem/tương tác. Nếu không
                                    trùng, phần này cộng 0.
                                </DetailTerm>
                                <DetailTerm term="0.25 điểm">
                                    Cộng khi thương hiệu của sản phẩm nằm trong
                                    các thương hiệu vừa tương tác; không trùng
                                    thì cộng 0.
                                </DetailTerm>
                                <DetailTerm term="0.15 điểm">
                                    Cộng khi sản phẩm đang chấm được tìm thấy
                                    nhờ sản phẩm người dùng đang xem/bấm. Nếu
                                    không có mốc này thì cộng 0.
                                </DetailTerm>
                                <DetailTerm term="tổng điểm">
                                    Cộng các phần khớp lại. Ba phần cộng tối đa
                                    0.60 + 0.25 + 0.15 = 1.00. Các số này là
                                    điểm của tiêu chí, không phải xác suất mua.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Ví dụ">
                            Người dùng vừa xem một chiếc nồi. Một sản phẩm khác
                            cùng danh mục nhận 0.60; nếu cùng thương hiệu thì
                            cộng thêm 0.25; nếu còn được gợi ý từ chính chiếc
                            nồi đang xem thì cộng thêm 0.15. Khớp cả ba được
                            0.60 + 0.25 + 0.15 = 1.00; chỉ cùng danh mục thì
                            được 0.60.
                        </DetailSection>
                        <DetailSection title="Khi nào điểm bằng 0?">
                            Không có dữ liệu phiên, sản phẩm không trùng danh
                            mục/thương hiệu gần đây và cũng không được tìm từ
                            sản phẩm hiện tại. Khi đó tiêu chí này không cộng
                            điểm; các tiêu chí còn lại vẫn hoạt động.
                        </DetailSection>
                    </>
                ) : null}

                {signal === 'semanticSimilarity' ? (
                    <>
                        <DetailFormula>
                            <p>
                                Dãy số nội dung chung = tổng(dãy số của từng mốc
                                × trọng số mốc) ÷ tổng trọng số mốc
                            </p>
                            <p>
                                Điểm tương đồng = giới hạn 0–1 (điểm bộ tìm kiếm
                                trả về khi so sản phẩm với dãy số chung)
                            </p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Hệ thống mã hóa nội dung sản phẩm thành một dãy số
                            ngắn, có thể hình dung như “dấu vân tay nội dung”.
                            Sản phẩm có tên/mô tả/đặc điểm gần nhau thường có
                            dấu vân tay gần nhau, dù khác danh mục hoặc chưa
                            từng được mua cùng. Điểm này đo độ giống nội dung,
                            không đo khả năng người dùng sẽ mua.
                        </DetailSection>
                        <DetailSection title="Sản phẩm nào được dùng làm mốc?">
                            <ul className="space-y-1.5">
                                <DetailTerm term="Sản phẩm hiện tại — trọng số 1">
                                    Sản phẩm người dùng đang xem hoặc sản phẩm
                                    được truyền vào làm điểm bắt đầu.
                                </DetailTerm>
                                <DetailTerm term="Tối đa 5 sản phẩm vừa tương tác">
                                    Mỗi sản phẩm được đặt trọng số theo hành
                                    động gần nhất: mặc định xem = 1, bấm = 2,
                                    thêm giỏ = 4. Nếu không có trọng số thì dùng
                                    1. Hành động có điểm 0 hoặc âm, như bỏ giỏ,
                                    không được dùng làm mốc nội dung.
                                </DetailTerm>
                                <DetailTerm term="Tối đa 5 sản phẩm hồ sơ — trọng số 0.5">
                                    Chỉ lấy sản phẩm người dùng đã thể hiện sở
                                    thích dương; mỗi sản phẩm này có ảnh hưởng
                                    bằng một nửa mốc trọng số 1.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Từng phần trong cách tính">
                            <ul className="space-y-1.5">
                                <DetailTerm term="dấu vân tay × trọng số">
                                    Lấy dãy số của từng sản phẩm mốc nhân với
                                    trọng số tương ứng. Mốc có trọng số lớn sẽ
                                    ảnh hưởng nhiều hơn đến “dấu vân tay chung”
                                    mà hệ thống dùng để tìm sản phẩm.
                                </DetailTerm>
                                <DetailTerm term="chia cho tổng trọng số">
                                    Cộng trọng số của các mốc rồi chia để lấy
                                    mức trung bình có cân nhắc độ quan trọng.
                                    Nhờ vậy, thêm nhiều sản phẩm mốc không tự
                                    làm điểm cao hơn.
                                </DetailTerm>
                                <DetailTerm term="điểm giống nhau từ 0 đến 1">
                                    Bộ tìm kiếm so sánh dấu vân tay chung với
                                    từng sản phẩm. 0 nghĩa là rất ít giống; 1 là
                                    mức giống cao nhất. Ví dụ 0.82 nghĩa là bộ
                                    tìm kiếm cho điểm tương đồng 0.82 trên thang
                                    0–1. Đây không phải phép đếm 82% từ ngữ
                                    trùng nhau hay xác suất mua 82%.
                                </DetailTerm>
                            </ul>
                            <p className="mt-2">
                                Dãy số được tạo trước bằng mô hình mã hóa nội
                                dung — mô hình biến tên, thương hiệu, danh mục,
                                mô tả và thuộc tính sản phẩm thành số — rồi lưu
                                lại. Khi có yêu cầu, hệ thống dùng các số này để
                                tìm sản phẩm gần giống; đây không phải
                                AI-Enhanced Ranking và cũng không phải AI trò
                                chuyện viết câu trả lời mới cho từng lượt.
                            </p>
                        </DetailSection>
                        <DetailSection title="Ví dụ dễ hình dung">
                            Giả sử hai sản phẩm mốc là sản phẩm đang xem (trọng
                            số 1) và sản phẩm vừa bấm (trọng số 2). Tổng trọng
                            số là 1 + 2 = 3: sản phẩm đang xem ảnh hưởng 1/3,
                            sản phẩm vừa bấm ảnh hưởng 2/3 đến dấu vân tay
                            chung. Nếu sản phẩm được tìm thấy có điểm giống 0.82
                            thì điểm tiêu chí là 0.82.
                        </DetailSection>
                        <DetailSection title="Khi nào không có điểm?">
                            Mốc nào chưa có dãy số nội dung thì được bỏ qua. Nếu
                            không còn mốc nào dùng được, nội dung đã đổi nhưng
                            chưa cập nhật, hoặc bộ tìm kiếm không trả sản phẩm
                            phù hợp, tiêu chí này không đóng góp; các cách gợi ý
                            khác vẫn tiếp tục chạy.
                        </DetailSection>
                    </>
                ) : null}

                {signal === 'coBehavior' ? (
                    <>
                        <DetailFormula>
                            <p>
                                Điểm quan hệ sau giảm = điểm quan hệ ban đầu ×
                                0.5^(số ngày ÷ số ngày giảm một nửa)
                            </p>
                            <p>
                                Điểm một mối liên hệ = max(0, điểm sau giảm) ÷
                                [max(0, điểm sau giảm) + mốc so sánh]
                            </p>
                            <p>
                                Điểm Hành vi liên quan = điểm cao nhất trong các
                                mối liên hệ tìm được
                            </p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Nếu nhiều phiên mua sắm cho thấy hai sản phẩm hay
                            xuất hiện cùng nhau, hệ thống ghi nhận chúng có liên
                            quan. Khi người dùng quan tâm sản phẩm A, sản phẩm B
                            có thể được gợi ý theo mối liên hệ đó. Đây là “người
                            mua/xem cùng nhau”, không phải “nội dung giống
                            nhau”.
                        </DetailSection>
                        <DetailSection title="Hệ thống ghi nhận hai sản phẩm liên quan khi nào?">
                            <ul className="space-y-1.5">
                                <DetailTerm term="Cùng được xem">
                                    Trong cùng phiên ghé website, nếu hai sản
                                    phẩm được xem, bấm hoặc hiển thị trong
                                    khoảng 30 phút thì ghi nhận một mối liên hệ.
                                </DetailTerm>
                                <DetailTerm term="Cùng được thêm giỏ">
                                    Nếu cùng người dùng hoặc cùng phiên thêm hai
                                    sản phẩm vào giỏ trong vòng 7 ngày, hệ thống
                                    ghi nhận chúng liên quan.
                                </DetailTerm>
                                <DetailTerm term="Cùng đơn hàng">
                                    Các sản phẩm trong một đơn mua hoàn tất được
                                    nối với nhau. Nếu đơn hàng bị hoàn trả, điểm
                                    của mối liên hệ mua sẽ bị trừ.
                                </DetailTerm>
                            </ul>
                            <p className="mt-1">
                                Mỗi hành động đóng góp một số điểm mặc định: xem
                                = 1, bấm = 2, chỉ được hiển thị = 0.05, thêm vào
                                giỏ = 3, mua chung = 6 và hoàn trả = −6. Đây là
                                điểm quy ước để so sánh, không phải số người.
                                Nhiều lần liên quan sẽ cộng dồn; điểm cũ giảm
                                còn một nửa sau mỗi 30 ngày. Các mức này có thể
                                được đổi bằng cấu hình.
                            </p>
                        </DetailSection>
                        <DetailSection title="Từng con số trong công thức">
                            <ul className="space-y-1.5">
                                <DetailTerm term="điểm quan hệ">
                                    Điểm tích lũy giữa hai sản phẩm sau khi đã
                                    tính các lần cùng xem/thêm giỏ/mua và làm
                                    giảm ảnh hưởng của điểm cũ. Điểm càng cao
                                    nghĩa là mối liên hệ càng mạnh.
                                </DetailTerm>
                                <DetailTerm term="0 nếu điểm quan hệ âm">
                                    Một lần hoàn trả có thể kéo điểm quan hệ mua
                                    xuống. Điểm âm không tạo gợi ý liên quan
                                    dương.
                                </DetailTerm>
                                <DetailTerm term="mốc so sánh (scale)">
                                    Đây là số dùng để đổi điểm quan hệ sang
                                    thang 0–1: mặc định 1 cho cùng xem, 3 cho
                                    cùng thêm giỏ và 6 cho cùng mua. Chọn mốc
                                    lớn hơn khiến cùng một điểm tích lũy được
                                    đổi thành điểm thấp hơn. Có thể thay các mốc
                                    này bằng cấu hình.
                                </DetailTerm>
                                <DetailTerm term="điểm quan hệ ÷ (điểm quan hệ + mốc so sánh)">
                                    Đổi điểm tích lũy sang thang 0–1. Khi điểm
                                    quan hệ bằng mốc so sánh thì kết quả là 0.5.
                                    Điểm càng tăng thì kết quả tiến gần 1, nhưng
                                    không vượt 1.
                                </DetailTerm>
                                <DetailTerm term="lấy điểm mạnh nhất">
                                    Nếu một sản phẩm liên quan qua nhiều sản
                                    phẩm mốc hoặc nhiều loại hành vi, hệ thống
                                    dùng mối liên hệ có điểm cao nhất, không
                                    cộng tất cả lại.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Ví dụ tính điểm">
                            Giả sử mối liên hệ “cùng thêm giỏ” có 3 điểm sau khi
                            đã tính thời gian. Loại quan hệ này có mốc so sánh
                            3, nên kết quả là{' '}
                            <code className="rounded bg-white px-1 text-zinc-900">
                                3 ÷ (3 + 3) = 0.5
                            </code>
                            . 0.5 ở đây là điểm liên quan đã quy đổi, không có
                            nghĩa 50% người dùng chắc chắn mua sản phẩm.
                        </DetailSection>
                        <DetailSection title="Khi nào tiêu chí này bằng 0?">
                            Chưa có đủ tương tác để nối sản phẩm với sản phẩm
                            mốc, hoặc điểm quan hệ bị các lần hoàn trả kéo về 0.
                            Khi đó các nguồn và tiêu chí gợi ý khác vẫn tiếp tục
                            hoạt động.
                        </DetailSection>
                    </>
                ) : null}

                {signal === 'popularity' ? (
                    <>
                        <DetailFormula>
                            <p>
                                Điểm thứ hạng = giới hạn 0–1 [1 − (hạng − 1) ÷
                                max(số sản phẩm trong danh sách − 1, 1)]
                            </p>
                            <p>
                                Điểm phổ biến = giới hạn 0–1 [max(ln(1 + max(số
                                đã bán, 0)) ÷ 12, điểm thứ hạng cao nhất từ danh
                                sách thịnh hành/bán chạy)]
                            </p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Tiêu chí này giúp sản phẩm bán được nhiều hoặc đang
                            đứng cao trong danh sách thịnh hành có cơ hội được
                            gợi ý. Nó đặc biệt hữu ích khi người dùng chưa có
                            nhiều lịch sử riêng.
                        </DetailSection>
                        <DetailSection title="Hai nguồn điểm">
                            <ul className="space-y-1.5">
                                <DetailTerm term="Số lượng đã bán">
                                    Tổng số lượng đã bán được đồng bộ trong
                                    thông tin sản phẩm. Bán nhiều giúp tăng
                                    điểm, nhưng mức tăng chậm dần để một sản
                                    phẩm bán cực nhiều không lấn át tất cả sản
                                    phẩm khác.
                                </DetailTerm>
                                <DetailTerm term="Thứ hạng trong danh sách">
                                    Vị trí sản phẩm trong danh sách thịnh hành
                                    hoặc bán chạy: hạng 1 là đầu danh sách. Danh
                                    sách bán chạy được dùng khi hệ thống đang
                                    gợi ý cho người chưa có hồ sơ sở thích.
                                </DetailTerm>
                                <DetailTerm term="lấy điểm cao hơn">
                                    So sánh điểm từ số bán với điểm từ thứ hạng
                                    rồi chọn điểm lớn hơn. Cuối cùng giới hạn
                                    kết quả tối đa là 1.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Các biến trong công thức thứ hạng">
                            <ul className="space-y-1.5">
                                <DetailTerm term="rank">
                                    Vị trí của sản phẩm trong một danh sách:
                                    hạng 1 là đầu danh sách, hạng 10 là vị trí
                                    thứ 10.
                                </DetailTerm>
                                <DetailTerm term="size">
                                    Tổng số sản phẩm trong chính danh sách đó.
                                    Nếu danh sách có 10 sản phẩm thì
                                    <code>size = 10</code>.
                                </DetailTerm>
                                <DetailTerm term="1 − (rank − 1) ÷ (size − 1)">
                                    Công thức đổi vị trí thành điểm. Ví dụ danh
                                    sách có 10 sản phẩm: hạng 1 được 1; hạng 4
                                    được 1 − (4−1) ÷ (10−1) = 0.67; hạng 10 được
                                    0. Danh sách chỉ có một sản phẩm thì sản
                                    phẩm đó được 1.
                                </DetailTerm>
                                <DetailTerm term="ln(1 + totalSold) ÷ 12">
                                    <code>totalSold</code> là tổng số lượng đã
                                    bán; <code>ln</code> là phép đổi khiến số
                                    bán tăng điểm chậm dần; số 1 giúp trường hợp
                                    chưa bán món nào cho kết quả 0. Số 12 là mức
                                    điều chỉnh độ lớn, không đảm bảo riêng phép
                                    tính này luôn nằm dưới 1: nếu vượt 1, bước
                                    cuối sẽ chặn điểm ở 1. Ví dụ bán 100 món:
                                    ln(101) ÷ 12 ≈ 0.38.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Ví dụ tính đầy đủ">
                            Giả sử sản phẩm đã bán 100 món và đứng hạng 4 trong
                            danh sách có 10 món. Điểm từ số bán xấp xỉ 0.38.
                            Điểm từ thứ hạng là{' '}
                            <code className="rounded bg-white px-1 text-zinc-900">
                                1 − (4 − 1) ÷ (10 − 1) = 0.67
                            </code>
                            . Hệ thống chọn điểm cao hơn, nên Độ phổ biến của
                            sản phẩm là khoảng 0.67.
                        </DetailSection>
                        <DetailSection title="Lưu ý">
                            Số bán và danh sách thịnh hành/bán chạy lấy từ dữ
                            liệu sản phẩm đã đồng bộ; tiêu chí này không đếm
                            lượt bấm mới theo thời gian thực. 0.67 là điểm để
                            xếp thứ tự, không có nghĩa sản phẩm có 67% cơ hội
                            được mua.
                        </DetailSection>
                    </>
                ) : null}

                {signal === 'freshness' ? (
                    <>
                        <DetailFormula>
                            <p>Điểm độ mới theo số ngày từ lúc tạo sản phẩm:</p>
                            <p>1.00 nếu không quá 1 ngày</p>
                            <p>0.80 nếu trên 1 ngày và không quá 7 ngày</p>
                            <p>0.55 nếu trên 7 ngày và không quá 30 ngày</p>
                            <p>0.30 nếu trên 30 ngày và không quá 90 ngày</p>
                            <p>0.10 nếu trên 90 ngày</p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Sản phẩm mới được cộng điểm “còn mới” cao hơn. Càng
                            lâu không còn là sản phẩm mới thì điểm này càng
                            thấp, nhưng sản phẩm cũ vẫn còn 0.10 điểm chứ không
                            bị về 0 hoàn toàn.
                        </DetailSection>
                        <DetailSection title="Các giá trị nghĩa là gì?">
                            <ul className="space-y-1.5">
                                <DetailTerm term="ngày tuổi sản phẩm">
                                    Số ngày từ ngày sản phẩm được tạo đến lúc
                                    chấm điểm. Nếu ngày tạo bị ghi trong tương
                                    lai do lệch đồng hồ, hệ thống tính tuổi là 0
                                    ngày.
                                </DetailTerm>
                                <DetailTerm term="1.00">
                                    Sản phẩm được tạo trong vòng 1 ngày; đây là
                                    điểm mới cao nhất.
                                </DetailTerm>
                                <DetailTerm term="0.80">
                                    Sản phẩm đã hơn 1 ngày nhưng chưa quá 7
                                    ngày.
                                </DetailTerm>
                                <DetailTerm term="0.55">
                                    Sản phẩm đã hơn 7 ngày nhưng chưa quá 30
                                    ngày.
                                </DetailTerm>
                                <DetailTerm term="0.30">
                                    Sản phẩm đã hơn 30 ngày nhưng chưa quá 90
                                    ngày.
                                </DetailTerm>
                                <DetailTerm term="0.10">
                                    Sản phẩm đã hơn 90 ngày.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Ví dụ">
                            Sản phẩm được tạo 5 ngày trước nhận 0.80 điểm mới.
                            Sản phẩm được tạo 20 ngày trước nhận 0.55. Khi bước
                            qua mốc 30 ngày, điểm chuyển xuống 0.30; điểm không
                            giảm từng chút mỗi ngày mà đổi theo các mốc cố định
                            này.
                        </DetailSection>
                        <DetailSection title="Vì sao không dùng tuổi chính xác từng giờ?">
                            Chia thành các mốc giúp điểm ổn định và dễ dự đoán;
                            sản phẩm mới có lợi thế vừa phải thay vì mỗi phút
                            đều làm thứ hạng thay đổi. Tỷ trọng của tiêu chí này
                            hiện là 8%, nên độ mới không tự quyết định toàn bộ
                            thứ hạng.
                        </DetailSection>
                    </>
                ) : null}

                {signal === 'quality' ? (
                    <>
                        <DetailFormula>
                            <p>
                                Điểm Chất lượng = giới hạn 0–1 [(giới hạn
                                ratingAvg ÷ 5 trong 0–1 × 0.55) + (giới hạn ln(1
                                + max(reviewCount, 0)) ÷ ln(101) trong 0–1 ×
                                0.25) + (còn hàng ? 0.20 : 0)]
                            </p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Điểm này gộp ba điều dễ hiểu: khách chấm sản phẩm
                            bao nhiêu sao, có bao nhiêu lượt đánh giá và sản
                            phẩm còn hàng hay không. Mục đích là tránh để số bán
                            hoặc độ mới quyết định hết thứ hạng.
                        </DetailSection>
                        <DetailSection title="Từng giá trị và tỷ lệ đóng góp">
                            <ul className="space-y-1.5">
                                <DetailTerm term="ratingAvg ÷ 5 × 0.55">
                                    <code>ratingAvg</code> là điểm sao trung
                                    bình, từ 0 đến 5. Chia 5 để đổi thành thang
                                    0–1; nhân 0.55 nghĩa là số sao có thể đóng
                                    góp tối đa 55% điểm Chất lượng. Ví dụ 4.5
                                    sao: 4.5 ÷ 5 × 0.55 = 0.495.
                                </DetailTerm>
                                <DetailTerm term="ln(1 + reviewCount) ÷ ln(101) × 0.25">
                                    <code>reviewCount</code> là số lượt đánh
                                    giá. Phép <code>ln</code> làm số lượt tăng
                                    điểm chậm dần. Số 101 là 100 lượt đánh giá
                                    cộng 1; vì vậy chia cho <code>ln(101)</code>
                                    để 100 lượt tương ứng mức 1. Nhân 0.25 nên
                                    phần đánh giá đóng góp tối đa 25%. Không có
                                    lượt đánh giá thì phần này bằng 0; trên 100
                                    lượt cũng không vượt mức 25%.
                                </DetailTerm>
                                <DetailTerm term="còn hàng × 0.20">
                                    Trạng thái còn hàng chỉ có hai trường hợp:
                                    còn hàng thì cộng 0.20, hết hàng thì cộng 0.
                                    Phần này đóng góp tối đa 20% điểm Chất
                                    lượng.
                                </DetailTerm>
                                <DetailTerm term="0.55 + 0.25 + 0.20">
                                    Ba phần trên chia toàn bộ điểm Chất lượng:
                                    sao chiếm 55%, số lượt đánh giá 25%, tình
                                    trạng còn hàng 20%. Tổng cuối được giới hạn
                                    trong khoảng 0–1.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Ví dụ tính điểm">
                            Giả sử sản phẩm có 4.5 sao, 25 lượt đánh giá và còn
                            hàng. Phần sao là 0.495; 25 lượt đánh giá được đổi
                            thành khoảng 0.71 rồi nhân 0.25, được khoảng 0.177;
                            còn hàng cộng 0.20. Tổng là khoảng{' '}
                            <strong className="text-zinc-900">0.87/1</strong>.
                            Nếu không có sao hoặc đánh giá, phần tương ứng bằng
                            0; nếu hết hàng thì không được cộng 0.20.
                        </DetailSection>
                        <DetailSection title="Dữ liệu này đến từ đâu?">
                            Số sao trung bình, số lượt đánh giá và tình trạng
                            còn hàng được đọc từ thông tin sản phẩm đã đồng bộ.
                            Đây là công thức quy tắc cố định, không phải AI đọc
                            nội dung từng bài đánh giá. Bộ lọc sản phẩm không
                            hợp lệ vẫn chạy riêng trước bước chấm điểm.
                        </DetailSection>
                    </>
                ) : null}

                {signal === 'exploration' ? (
                    <>
                        <DetailFormula>
                            <p>
                                Điểm khám phá = 1 nếu độ phù hợp hồ sơ ≤ 0.4 VÀ
                                nguồn sản phẩm là NEWEST hoặc EXPLORE
                            </p>
                            <p>Trong mọi trường hợp khác, điểm khám phá = 0.</p>
                        </DetailFormula>
                        <DetailSection title="Nói đơn giản">
                            Khi hệ thống chưa hiểu rõ sở thích người dùng, tiêu
                            chí này cho sản phẩm mới hoặc sản phẩm được chọn để
                            khám phá thêm cơ hội xuất hiện. Khi hồ sơ đã đủ rõ,
                            hệ thống ưu tiên những tiêu chí phù hợp trực tiếp
                            hơn.
                        </DetailSection>
                        <DetailSection title="Từng phần trong điều kiện">
                            <ul className="space-y-1.5">
                                <DetailTerm term="Độ phù hợp hồ sơ ≤ 0.4">
                                    Dùng kết quả của tiêu chí Độ phù hợp hồ sơ
                                    đã giải thích ở trên. 0.4 tương đương
                                    40/100; nghĩa là hệ thống chưa có bằng chứng
                                    sở thích mạnh. Mốc này là điều kiện bật khám
                                    phá, không phải tỷ trọng.
                                </DetailTerm>
                                <DetailTerm term="NEWEST">
                                    Sản phẩm được lấy từ danh sách sản phẩm mới
                                    trong dữ liệu sản phẩm.
                                </DetailTerm>
                                <DetailTerm term="EXPLORE">
                                    Sản phẩm được lấy từ danh sách sản phẩm dành
                                    cho khám phá.
                                </DetailTerm>
                                <DetailTerm term="điểm 1 hoặc 0">
                                    Nếu đồng thời hồ sơ không quá 0.4 và sản
                                    phẩm đến từ NEWEST hoặc EXPLORE, tiêu chí
                                    này cho 1 điểm. Thiếu một trong hai điều
                                    kiện thì cho 0 điểm.
                                </DetailTerm>
                            </ul>
                        </DetailSection>
                        <DetailSection title="Ví dụ">
                            Hồ sơ đạt 0.35/1 và sản phẩm thuộc danh sách mới: cả
                            hai điều kiện đúng, nên điểm khám phá = 1. Nếu đặt
                            tỷ trọng 4%, phần đóng góp sẽ là 1 × 0.04 = 0.04
                            điểm. Nếu hồ sơ đạt 0.41/1 thì điểm khám phá bằng 0,
                            kể cả sản phẩm mới.
                        </DetailSection>
                        <DetailSection title="Khi nào không được cộng điểm?">
                            Khi hồ sơ đã trên 0.4, hoặc sản phẩm không có nguồn
                            từ danh sách mới/khám phá. Hai tên này chỉ cho biết
                            sản phẩm được đưa vào danh sách gợi ý từ đâu; chúng
                            không phải điểm hay dữ liệu sở thích.
                        </DetailSection>
                    </>
                ) : null}
            </div>
        </div>
    );
}
