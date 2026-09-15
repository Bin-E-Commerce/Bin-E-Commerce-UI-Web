// Giải thích chi tiết tín hiệu quality; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import { DetailFormula, DetailSection, DetailTerm } from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu quality mà không chứa state hay side effect runtime.
export function RankingWeightQualityDetails() {
    return (
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
    );
}

