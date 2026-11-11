// Giải thích feature sessionContext theo vị trí danh mục và thương hiệu trong phiên; không chấm điểm cuối.
import {
    DetailFormula,
    DetailSection,
    DetailTerm,
} from './RankingWeightDetails.shared';

// Trình bày công thức, nguồn dữ liệu và giới hạn của tín hiệu phiên mà không thực hiện I/O.
export function RankingWeightSessionContextDetails() {
    return (
        <>
            <DetailFormula>
                <p>Điểm ngữ cảnh = (điểm danh mục + điểm thương hiệu) ÷ 2.</p>
                <p>
                    Điểm một thuộc tính = (số mục trong danh sách − vị trí tính
                    từ 0) ÷ số mục; không khớp thì bằng 0.
                </p>
            </DetailFormula>
            <DetailSection title="Nói đơn giản">
                Hệ thống so danh mục và thương hiệu của sản phẩm với những mục
                người dùng vừa chủ động tương tác trong phiên. Mục gần đây hơn
                có điểm cao hơn. Đây là một tín hiệu đầu vào của model AI, không
                phải xác suất mua.
            </DetailSection>
            <DetailSection title="Dữ liệu nào được nhớ?">
                Hệ thống giữ hai danh sách tạm: danh mục và thương hiệu từng
                tương tác, mới nhất ở đầu và không lặp khóa. Tương tác lại với
                một khóa sẽ đưa khóa đó lên đầu. Lượt hiển thị thụ động không
                làm đổi hai danh sách. Dữ liệu có giới hạn số mục và thời gian
                lưu theo cấu hình phiên.
            </DetailSection>
            <DetailSection title="Cách đọc điểm">
                <ul className="space-y-1.5">
                    <DetailTerm term="Vị trí đầu">
                        Thuộc tính vừa tương tác gần nhất có điểm riêng bằng 1.
                    </DetailTerm>
                    <DetailTerm term="Vị trí cũ hơn">
                        Với danh sách hai mục, mục thứ hai có điểm riêng 1/2.
                        Không xuất hiện trong danh sách thì bằng 0.
                    </DetailTerm>
                    <DetailTerm term="Hai chiều">
                        Danh mục và thương hiệu đóng góp ngang nhau; chỉ một
                        chiều đạt 1 thì điểm ngữ cảnh bằng 0,5.
                    </DetailTerm>
                </ul>
            </DetailSection>
            <DetailSection title="Ví dụ">
                Danh mục gần đây là [nồi, sách], thương hiệu là [A, B]. Sản phẩm
                thuộc danh mục nồi, thương hiệu B nhận (1 + 0,5) ÷ 2 = 0,75. Sản
                phẩm khớp cả hai mục mới nhất nhận 1; không khớp mục nào nhận 0.
            </DetailSection>
            <DetailSection title="Cơ sở và giới hạn">
                Nghiên cứu về gợi ý theo phiên đã dùng trọng số vị trí để ưu
                tiên tương tác mới hơn. Công thức này áp dụng ý tưởng đó cho
                danh mục và thương hiệu; việc lấy trung bình hai chiều là lựa
                chọn của dự án, chưa được chứng minh là tối ưu trên người dùng
                thật. Điểm có nguồn gợi ý từ sản phẩm đang xem được giữ ở
                attribution, không tự cộng vào tiêu chí này.
            </DetailSection>
        </>
    );
}
