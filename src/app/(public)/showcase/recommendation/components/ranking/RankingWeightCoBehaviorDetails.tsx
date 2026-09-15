// Giải thích chi tiết tín hiệu coBehavior; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import { DetailFormula, DetailSection, DetailTerm } from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu coBehavior mà không chứa state hay side effect runtime.
export function RankingWeightCoBehaviorDetails() {
    return (
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
    );
}

