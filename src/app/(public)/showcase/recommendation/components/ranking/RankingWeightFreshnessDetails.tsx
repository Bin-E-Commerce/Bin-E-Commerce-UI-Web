// Giải thích chi tiết tín hiệu freshness; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import { DetailFormula, DetailSection, DetailTerm } from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu freshness mà không chứa state hay side effect runtime.
export function RankingWeightFreshnessDetails() {
    return (
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
    );
}

