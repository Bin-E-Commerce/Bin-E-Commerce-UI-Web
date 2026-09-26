// Giải thích chi tiết tín hiệu exploration; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import {
    DetailFormula,
    DetailSection,
    DetailTerm,
} from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu exploration mà không chứa state hay side effect runtime.
export function RankingWeightExplorationDetails() {
    return (
        <>
            <DetailFormula>
                <p>
                    Điểm khám phá = 1 nếu độ phù hợp hồ sơ ≤ 0.4 VÀ nguồn sản
                    phẩm là NEWEST hoặc EXPLORE
                </p>
                <p>Trong mọi trường hợp khác, điểm khám phá = 0.</p>
            </DetailFormula>
            <DetailSection title="Nói đơn giản">
                Khi hệ thống chưa hiểu rõ sở thích người dùng, tiêu chí này cho
                sản phẩm mới hoặc sản phẩm được chọn để khám phá thêm cơ hội
                xuất hiện. Khi hồ sơ đã đủ rõ, hệ thống ưu tiên những tiêu chí
                phù hợp trực tiếp hơn.
            </DetailSection>
            <DetailSection title="Từng phần trong điều kiện">
                <ul className="space-y-1.5">
                    <DetailTerm term="Độ phù hợp hồ sơ ≤ 0.4">
                        Dùng kết quả của tiêu chí Độ phù hợp hồ sơ đã giải thích
                        ở trên. 0.4 tương đương 40/100; nghĩa là hệ thống chưa
                        có bằng chứng sở thích mạnh. Mốc này là điều kiện bật
                        khám phá, không phải tỷ trọng.
                    </DetailTerm>
                    <DetailTerm term="NEWEST">
                        Sản phẩm được lấy từ danh sách sản phẩm mới trong dữ
                        liệu sản phẩm.
                    </DetailTerm>
                    <DetailTerm term="EXPLORE">
                        Sản phẩm được lấy từ danh sách sản phẩm dành cho khám
                        phá.
                    </DetailTerm>
                    <DetailTerm term="điểm 1 hoặc 0">
                        Nếu đồng thời hồ sơ không quá 0.4 và sản phẩm đến từ
                        NEWEST hoặc EXPLORE, tiêu chí này cho 1 điểm. Thiếu một
                        trong hai điều kiện thì cho 0 điểm.
                    </DetailTerm>
                </ul>
            </DetailSection>
            <DetailSection title="Ví dụ">
                Hồ sơ đạt 0.35/1 và sản phẩm thuộc danh sách mới: cả hai điều
                kiện đúng, nên điểm khám phá = 1. Nếu đặt tỷ trọng 4%, phần đóng
                góp sẽ là 1 × 0.04 = 0.04 điểm. Nếu hồ sơ đạt 0.41/1 thì điểm
                khám phá bằng 0, kể cả sản phẩm mới.
            </DetailSection>
            <DetailSection title="Khi nào không được cộng điểm?">
                Khi hồ sơ đã trên 0.4, hoặc sản phẩm không có nguồn từ danh sách
                mới/khám phá. Hai tên này chỉ cho biết sản phẩm được đưa vào
                danh sách gợi ý từ đâu; chúng không phải điểm hay dữ liệu sở
                thích.
            </DetailSection>
        </>
    );
}
