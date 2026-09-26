// Giải thích chi tiết tín hiệu sessionContext; nội dung và công thức phải khớp với Standard Ranking trong Recommendation Service.
import {
    DetailFormula,
    DetailSection,
    DetailTerm,
} from './RankingWeightDetails.shared';

// Trình bày ý nghĩa, dữ liệu đầu vào và ví dụ của tín hiệu sessionContext mà không chứa state hay side effect runtime.
export function RankingWeightSessionContextDetails() {
    return (
        <>
            <DetailFormula>
                <p>
                    Điểm ngữ cảnh = giới hạn 0–1 [(khớp danh mục ? 0.60 : 0) +
                    (khớp thương hiệu ? 0.25 : 0) + (được gợi ý từ sản phẩm hiện
                    tại ? 0.15 : 0)]
                </p>
                <p>Mỗi điều kiện trong ngoặc nhận 1 nếu đúng, 0 nếu sai.</p>
            </DetailFormula>
            <DetailSection title="Nói đơn giản">
                Đây là phần ghi nhận điều người dùng đang quan tâm trong lần ghé
                thăm hiện tại. Khác với hồ sơ dài hạn, nó giúp gợi ý thay đổi
                nhanh khi người dùng vừa xem một nhóm hàng hoặc thương hiệu nào
                đó.
            </DetailSection>
            <DetailSection title="Hệ thống nhớ những gì trong lần ghé thăm?">
                Trong lúc người dùng ghé website, hệ thống nhớ tạm các danh
                mục/thương hiệu người dùng vừa tương tác và sản phẩm gần nhất họ
                thật sự xem hoặc bấm. Dữ liệu này chỉ được nhớ tạm trong lần ghé
                thăm, không phải toàn bộ lịch sử dài hạn. Chỉ nhìn thấy sản phẩm
                trên màn hình mà chưa xem/bấm thì không đổi sản phẩm hiện tại.
            </DetailSection>
            <DetailSection title="Các con số trong cách tính">
                <ul className="space-y-1.5">
                    <DetailTerm term="0.60 điểm">
                        Cộng khi sản phẩm đang chấm thuộc danh mục người dùng
                        vừa xem/tương tác. Nếu không trùng, phần này cộng 0.
                    </DetailTerm>
                    <DetailTerm term="0.25 điểm">
                        Cộng khi thương hiệu của sản phẩm nằm trong các thương
                        hiệu vừa tương tác; không trùng thì cộng 0.
                    </DetailTerm>
                    <DetailTerm term="0.15 điểm">
                        Cộng khi sản phẩm đang chấm được tìm thấy nhờ sản phẩm
                        người dùng đang xem/bấm. Nếu không có mốc này thì cộng
                        0.
                    </DetailTerm>
                    <DetailTerm term="tổng điểm">
                        Cộng các phần khớp lại. Ba phần cộng tối đa 0.60 + 0.25
                        + 0.15 = 1.00. Các số này là điểm của tiêu chí, không
                        phải xác suất mua.
                    </DetailTerm>
                </ul>
            </DetailSection>
            <DetailSection title="Ví dụ">
                Người dùng vừa xem một chiếc nồi. Một sản phẩm khác cùng danh
                mục nhận 0.60; nếu cùng thương hiệu thì cộng thêm 0.25; nếu còn
                được gợi ý từ chính chiếc nồi đang xem thì cộng thêm 0.15. Khớp
                cả ba được 0.60 + 0.25 + 0.15 = 1.00; chỉ cùng danh mục thì được
                0.60.
            </DetailSection>
            <DetailSection title="Khi nào điểm bằng 0?">
                Không có dữ liệu phiên, sản phẩm không trùng danh mục/thương
                hiệu gần đây và cũng không được tìm từ sản phẩm hiện tại. Khi đó
                tiêu chí này không cộng điểm; các tiêu chí còn lại vẫn hoạt
                động.
            </DetailSection>
        </>
    );
}
