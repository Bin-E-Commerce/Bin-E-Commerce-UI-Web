// Giải thích chi tiết tín hiệu popularity; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import {
    DetailFormula,
    DetailSection,
    DetailTerm,
} from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu popularity mà không chứa state hay side effect runtime.
export function RankingWeightPopularityDetails() {
    return (
        <>
            <DetailFormula>
                <p>
                    Điểm thứ hạng = giới hạn 0–1 [1 − (hạng − 1) ÷ max(số sản
                    phẩm trong danh sách − 1, 1)]
                </p>
                <p>
                    Điểm phổ biến = giới hạn 0–1 [max(ln(1 + max(số đã bán, 0))
                    ÷ 12, điểm thứ hạng cao nhất từ danh sách thịnh hành/bán
                    chạy)]
                </p>
            </DetailFormula>
            <DetailSection title="Nói đơn giản">
                Tiêu chí này giúp sản phẩm bán được nhiều hoặc đang đứng cao
                trong danh sách thịnh hành có cơ hội được gợi ý. Nó đặc biệt hữu
                ích khi người dùng chưa có nhiều lịch sử riêng.
            </DetailSection>
            <DetailSection title="Hai nguồn điểm">
                <ul className="space-y-1.5">
                    <DetailTerm term="Số lượng đã bán">
                        Tổng số lượng đã bán được đồng bộ trong thông tin sản
                        phẩm. Bán nhiều giúp tăng điểm, nhưng mức tăng chậm dần
                        để một sản phẩm bán cực nhiều không lấn át tất cả sản
                        phẩm khác.
                    </DetailTerm>
                    <DetailTerm term="Thứ hạng trong danh sách">
                        Vị trí sản phẩm trong danh sách thịnh hành hoặc bán
                        chạy: hạng 1 là đầu danh sách. Danh sách bán chạy được
                        dùng khi hệ thống đang gợi ý cho người chưa có hồ sơ sở
                        thích.
                    </DetailTerm>
                    <DetailTerm term="lấy điểm cao hơn">
                        So sánh điểm từ số bán với điểm từ thứ hạng rồi chọn
                        điểm lớn hơn. Cuối cùng giới hạn kết quả tối đa là 1.
                    </DetailTerm>
                </ul>
            </DetailSection>
            <DetailSection title="Các biến trong công thức thứ hạng">
                <ul className="space-y-1.5">
                    <DetailTerm term="rank">
                        Vị trí của sản phẩm trong một danh sách: hạng 1 là đầu
                        danh sách, hạng 10 là vị trí thứ 10.
                    </DetailTerm>
                    <DetailTerm term="size">
                        Tổng số sản phẩm trong chính danh sách đó. Nếu danh sách
                        có 10 sản phẩm thì
                        <code>size = 10</code>.
                    </DetailTerm>
                    <DetailTerm term="1 − (rank − 1) ÷ (size − 1)">
                        Công thức đổi vị trí thành điểm. Ví dụ danh sách có 10
                        sản phẩm: hạng 1 được 1; hạng 4 được 1 − (4−1) ÷ (10−1)
                        = 0.67; hạng 10 được 0. Danh sách chỉ có một sản phẩm
                        thì sản phẩm đó được 1.
                    </DetailTerm>
                    <DetailTerm term="ln(1 + totalSold) ÷ 12">
                        <code>totalSold</code> là tổng số lượng đã bán;{' '}
                        <code>ln</code> là phép đổi khiến số bán tăng điểm chậm
                        dần; số 1 giúp trường hợp chưa bán món nào cho kết quả
                        0. Số 12 là mức điều chỉnh độ lớn, không đảm bảo riêng
                        phép tính này luôn nằm dưới 1: nếu vượt 1, bước cuối sẽ
                        chặn điểm ở 1. Ví dụ bán 100 món: ln(101) ÷ 12 ≈ 0.38.
                    </DetailTerm>
                </ul>
            </DetailSection>
            <DetailSection title="Ví dụ tính đầy đủ">
                Giả sử sản phẩm đã bán 100 món và đứng hạng 4 trong danh sách có
                10 món. Điểm từ số bán xấp xỉ 0.38. Điểm từ thứ hạng là{' '}
                <code className="rounded bg-white px-1 text-zinc-900">
                    1 − (4 − 1) ÷ (10 − 1) = 0.67
                </code>
                . Hệ thống chọn điểm cao hơn, nên Độ phổ biến của sản phẩm là
                khoảng 0.67.
            </DetailSection>
            <DetailSection title="Lưu ý">
                Số bán và danh sách thịnh hành/bán chạy lấy từ dữ liệu sản phẩm
                đã đồng bộ; tiêu chí này không đếm lượt bấm mới theo thời gian
                thực. 0.67 là điểm để xếp thứ tự, không có nghĩa sản phẩm có 67%
                cơ hội được mua.
            </DetailSection>
        </>
    );
}
