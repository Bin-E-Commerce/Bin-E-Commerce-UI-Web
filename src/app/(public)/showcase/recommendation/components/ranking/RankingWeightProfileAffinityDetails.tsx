// Giải thích công thức profileAffinity của Standard Ranking và các giả định chưa được kiểm chứng trên khách hàng thật.
import {
    DetailFormula,
    DetailSection,
    DetailTerm,
} from './RankingWeightDetails.shared';

// Hiển thị công thức, ví dụ và giới hạn chứng cứ; không đọc cấu hình runtime hay tạo side effect.
export function RankingWeightProfileAffinityDetails() {
    return (
        <>
            <DetailFormula>
                <p>
                    Điểm tích lũy của từng mục = tổng [điểm hành động dương ×
                    0.5^(số ngày từ hành động / số ngày giảm một nửa)]
                </p>
                <p>
                    Điểm từng chiều = min(1, điểm tích lũy / ngưỡng của chiều)
                </p>
                <p>
                    Độ phù hợp hồ sơ = 0.5 × điểm sản phẩm + 0.3 × điểm danh mục
                    + 0.2 × điểm thương hiệu
                </p>
            </DetailFormula>
            <DetailSection title="Nói đơn giản">
                Hệ thống cộng các hành động tích cực với đúng sản phẩm, danh mục
                và thương hiệu. Mỗi hành động giảm ảnh hưởng theo tuổi riêng của
                nó. Ba điểm được đổi về thang 0–1 rồi ghép bằng trọng số có tổng
                bằng 1.
            </DetailSection>
            <DetailSection title="Hệ thống lấy dữ liệu nào?">
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    <li>Hiển thị sản phẩm: +0.05 điểm.</li>
                    <li>Xem sản phẩm: +1 điểm.</li>
                    <li>Nhấp sản phẩm: +2 điểm.</li>
                    <li>Thêm vào giỏ: +4 điểm.</li>
                    <li>Tìm kiếm: +1.5 điểm nếu có đối tượng liên quan.</li>
                    <li>Mua hàng: +8 điểm cho mỗi sản phẩm.</li>
                    <li>Bỏ khỏi giỏ: −2 điểm; hoàn trả: −8 điểm.</li>
                </ul>
                <p className="mt-1">
                    Điểm hành động là mặc định của dự án và có thể đổi bằng cấu
                    hình. Danh mục và thương hiệu lấy từ thông tin sản phẩm. Tín
                    hiệu âm được lưu riêng để tính khoản trừ, không triệt tiêu
                    lịch sử tích cực.
                </p>
            </DetailSection>
            <DetailSection title="Mỗi phần trong công thức nghĩa là gì?">
                <ul className="space-y-1.5">
                    <DetailTerm term="Số ngày từ từng hành động">
                        Mỗi lượt xem, nhấp hoặc mua có thời điểm riêng. Một hành
                        động mới không làm hành động cũ trở lại như mới.
                    </DetailTerm>
                    <DetailTerm term="Số ngày giảm một nửa (H)">
                        Mặc định H = 7 ngày. Sau 7 ngày, đóng góp của một hành
                        động còn một nửa; sau 14 ngày còn một phần tư. Đây là
                        giả định cấu hình, chưa được chứng minh tối ưu.
                    </DetailTerm>
                    <DetailTerm term="Ngưỡng từng chiều (M)">
                        Mặc định sản phẩm M = 8, danh mục M = 16, thương hiệu M
                        = 8. Điểm tích lũy bằng ngưỡng thì điểm chiều đạt 1; cao
                        hơn vẫn là 1. Các ngưỡng cần kiểm định bằng dữ liệu lịch
                        sử.
                    </DetailTerm>
                    <DetailTerm term="Trọng số 0.5 / 0.3 / 0.2">
                        Mặc định sản phẩm, danh mục, thương hiệu lần lượt đóng
                        góp tối đa 0.5, 0.3 và 0.2. Trọng số được chuẩn hóa về
                        tổng 1 khi thay bằng cấu hình.
                    </DetailTerm>
                </ul>
            </DetailSection>
            <DetailSection title="Ví dụ tính từng bước">
                <p>
                    Giả sử sau khi giảm theo tuổi của từng hành động, sản phẩm
                    có 4 điểm, danh mục có 8 điểm và thương hiệu có 2 điểm.
                </p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5">
                    <li>Sản phẩm: min(1, 4 / 8) = 0.5.</li>
                    <li>Danh mục: min(1, 8 / 16) = 0.5.</li>
                    <li>Thương hiệu: min(1, 2 / 8) = 0.25.</li>
                </ol>
                <p className="mt-1">
                    Điểm chung = 0.5 × 0.5 + 0.3 × 0.5 + 0.2 × 0.25 ={' '}
                    <strong className="text-zinc-900">0.45</strong>. Đây là điểm
                    để xếp thứ tự, không phải xác suất mua 45%.
                </p>
            </DetailSection>
            <DetailSection title="Điểm âm và giới hạn kết luận">
                <p>
                    Bỏ giỏ và hoàn trả được giảm theo thời gian trong tổng âm
                    riêng. Khoản trừ tối đa là 0.15 điểm theo chính sách ranking
                    hiện tại. Không có lịch sử tích cực thì độ phù hợp hồ sơ
                    bằng 0.
                </p>
                <p className="mt-1">
                    Dạng giảm một nửa và tổng có trọng số có cơ sở nghiên cứu;
                    các số mặc định là giả thuyết của dự án. Cần so với baseline
                    trên log tương tác thật để kết luận hệ thống xếp hạng tốt
                    hơn.
                </p>
            </DetailSection>
        </>
    );
}
