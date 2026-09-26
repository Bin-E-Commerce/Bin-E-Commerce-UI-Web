// Giải thích chi tiết tín hiệu profileAffinity; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import {
    DetailFormula,
    DetailSection,
    DetailTerm,
} from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu profileAffinity mà không chứa state hay side effect runtime.
export function RankingWeightProfileAffinityDetails() {
    return (
        <>
            <DetailFormula>
                <p>
                    Điểm từng sở thích = giới hạn 0–1 [max(0, điểm tích lũy ×
                    0.5^(số ngày ÷ số ngày giảm một nửa)) ÷ 8]
                </p>
                <p>
                    Độ phù hợp hồ sơ = giới hạn 0–1 [điểm sản phẩm + 0.6 × điểm
                    danh mục + 0.4 × điểm thương hiệu]
                </p>
            </DetailFormula>
            <DetailSection title="Nói đơn giản">
                Hệ thống nhìn vào lịch sử để xem người dùng từng quan tâm đến
                chính sản phẩm này, nhóm hàng của nó, hay thương hiệu của nó
                chưa. Khớp đúng sản phẩm được tính mạnh nhất; khớp nhóm hàng
                hoặc thương hiệu vẫn có ích nhưng được cộng ít hơn.
            </DetailSection>
            <DetailSection title="Hệ thống lấy dữ liệu nào?">
                <p>
                    Mỗi hành động sẽ cộng hoặc trừ điểm vào lịch sử sở thích của
                    người dùng. Mặc định các điểm là:
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    <li>Thấy sản phẩm được hiển thị: +0.05 điểm.</li>
                    <li>Xem sản phẩm: +1 điểm.</li>
                    <li>Bấm vào sản phẩm: +2 điểm.</li>
                    <li>Thêm vào giỏ: +4 điểm.</li>
                    <li>Bỏ khỏi giỏ: −2 điểm.</li>
                    <li>Tìm kiếm: +1.5 điểm.</li>
                    <li>Mua hàng: +8 điểm cho mỗi sản phẩm.</li>
                    <li>Hoàn trả: −8 điểm cho mỗi sản phẩm.</li>
                </ul>
                <p className="mt-1">
                    Ví dụ mua 2 sản phẩm sẽ cộng 16 điểm cho sản phẩm đó. Điểm
                    tìm kiếm chỉ cộng vào sản phẩm, danh mục hoặc thương hiệu
                    nếu hành động tìm kiếm có thông tin tương ứng; riêng nội
                    dung từ khóa được lưu nhưng không được dùng trong phép tính
                    này. Các điểm mặc định có thể thay đổi bằng cấu hình. Danh
                    mục và thương hiệu lấy từ thông tin sản phẩm trong hệ thống.
                </p>
            </DetailSection>
            <DetailSection title="Mỗi phần trong công thức nghĩa là gì?">
                <ul className="space-y-1.5">
                    <DetailTerm term="điểm_lưu">
                        Tổng điểm đã tích lũy cho một sản phẩm, một danh mục
                        hoặc một thương hiệu. Ví dụ hai lần xem và một lần bấm
                        có điểm mặc định là 1 + 1 + 2 = 4.
                    </DetailTerm>
                    <DetailTerm term="số_ngày">
                        Số ngày từ lần tương tác gần nhất với đúng mục đó đến
                        hiện tại. Mục mới tương tác thì số này gần 0.
                    </DetailTerm>
                    <DetailTerm term="halfLifeDays">
                        Số ngày để điểm sở thích giảm còn một nửa. Mặc định là 7
                        ngày; có thể đổi bằng cấu hình.
                    </DetailTerm>
                    <DetailTerm term="0.5^(số_ngày / halfLifeDays)">
                        Hệ số làm điểm cũ yếu dần. Ví dụ một sở thích có 8 điểm:
                        ngay sau tương tác vẫn là 8; sau 7 ngày còn 8 × 0.5 = 4;
                        sau 14 ngày còn 8 × 0.25 = 2. Như vậy hệ thống ưu tiên
                        điều người dùng quan tâm gần đây hơn.
                    </DetailTerm>
                    <DetailTerm term="chia cho 8">
                        Đổi điểm hành vi sang thang 0–1. Điểm 8 trở lên được xem
                        là mức tối đa 1; 4 điểm thành 0.5; 0 điểm thành 0.
                    </DetailTerm>
                    <DetailTerm term="max(0, điểm đã giảm)">
                        Chỉ lấy sở thích dương cho phần phù hợp. Nếu điểm đang
                        âm, phần phù hợp này nhận 0. Nói cách khác, không thích
                        không thể biến thành “thích”; nó chỉ làm giảm tổng điểm
                        ở khoản trừ riêng.
                    </DetailTerm>
                    <DetailTerm term="0.6 × điểm danh mục; 0.4 × điểm thương hiệu">
                        Điểm khớp danh mục được nhân 0.6; điểm khớp thương hiệu
                        được nhân 0.4. Ví dụ danh mục đạt 0.5 thì đóng góp 0.5 ×
                        0.6 = 0.3; thương hiệu đạt 0.5 thì đóng góp 0.5 × 0.4 =
                        0.2. Khớp đúng sản phẩm không bị nhân giảm.
                    </DetailTerm>
                    <DetailTerm term="giới hạn trong 0–1">
                        Tổng cao hơn 1 vẫn chỉ nhận 1, để một tiêu chí không
                        vượt thang điểm chung.
                    </DetailTerm>
                </ul>
                <p className="mt-2">
                    Nói gọn: điểm sở thích sau khi giảm theo thời gian → đổi về
                    0–1 → cộng điểm sản phẩm, danh mục và thương hiệu.
                </p>
            </DetailSection>
            <DetailSection title="Ví dụ tính từng bước">
                <p>
                    Giả sử sau khi tính độ cũ/mới, hồ sơ đang có: sản phẩm này 4
                    điểm, danh mục 4 điểm và thương hiệu 2 điểm.
                </p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                    <li>Sản phẩm: 4 ÷ 8 = 0.5 điểm phù hợp.</li>
                    <li>Danh mục: 4 ÷ 8 = 0.5; nhân 0.6 = 0.3.</li>
                    <li>Thương hiệu: 2 ÷ 8 = 0.25; nhân 0.4 = 0.1.</li>
                </ol>
                <p className="mt-1">
                    Cộng lại: 0.5 + 0.3 + 0.1 ={' '}
                    <strong className="text-zinc-900">0.9</strong>. Nghĩa là sản
                    phẩm khớp khá mạnh với hồ sơ ở tiêu chí này; không có nghĩa
                    người dùng có 90% khả năng mua.
                </p>
            </DetailSection>
            <DetailSection title="Lưu ý về thời gian và điểm âm">
                Hệ thống giảm tổng điểm đang lưu cho từng sản phẩm, danh mục
                hoặc thương hiệu dựa theo lần tương tác gần nhất với mục đó;
                không tính tuổi riêng cho từng lượt xem hay lượt mua cũ. Điểm âm
                như bỏ giỏ hoặc hoàn trả không làm tăng độ phù hợp, mà có thể
                làm giảm điểm cuối qua khoản trừ riêng. Nếu chưa có lịch sử thì
                tiêu chí này bằng 0, các tiêu chí khác vẫn có thể xếp hạng sản
                phẩm.
            </DetailSection>
            <DetailSection title="Khoản trừ vì người dùng không thích được tính ra sao?">
                <ul className="space-y-1.5">
                    <DetailTerm term="điểm âm">
                        Điểm âm trong hồ sơ của đúng sản phẩm, danh mục hoặc
                        thương hiệu đang được chấm, thường đến từ hành động như
                        bỏ giỏ hoặc hoàn trả.
                    </DetailTerm>
                    <DetailTerm term="chia độ lớn điểm âm cho 8">
                        Đổi mức không thích sang thang chung. Ví dụ −4 điểm
                        thành 4 ÷ 8 = 0.5; dấu trừ chỉ dùng để nhận ra đây là sở
                        thích âm.
                    </DetailTerm>
                    <DetailTerm term="cộng các điểm âm rồi nhân 0.15">
                        Nhiều dấu hiệu không thích có thể cộng lại. Kết quả bị
                        giới hạn tối đa 0.15, tức tối đa 15 điểm trên thang 100.
                    </DetailTerm>
                </ul>
                <p className="mt-1">
                    Ví dụ một sở thích âm −4 điểm, chưa tính giảm theo thời
                    gian, tạo khoản trừ (4 ÷ 8) × 0.15 ={' '}
                    <strong className="text-zinc-900">0.075</strong>, tương
                    đương 7.5 điểm trên thang 100. Nếu tổng khoản trừ lớn hơn
                    0.15 thì chỉ trừ 0.15.
                </p>
            </DetailSection>
        </>
    );
}
