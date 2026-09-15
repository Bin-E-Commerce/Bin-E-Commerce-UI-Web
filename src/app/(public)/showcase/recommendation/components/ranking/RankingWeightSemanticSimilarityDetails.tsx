// Giải thích chi tiết tín hiệu semanticSimilarity; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import { DetailFormula, DetailSection, DetailTerm } from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu semanticSimilarity mà không chứa state hay side effect runtime.
export function RankingWeightSemanticSimilarityDetails() {
    return (
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
    );
}

