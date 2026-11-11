// Trình bày vector 8 tiêu chí và công thức riêng từng feature trước khi model LambdaRank xếp hạng.

import { RankingWeightDetails } from './criteria/RankingWeightDetails';
import type { RankingWeightKey } from './criteria/RankingWeightDetails.types';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';

type RankingFeatureDescription = {
    name: string;
    key: RankingWeightKey;
    description: string;
};

const rankingFeatures: RankingFeatureDescription[] = [
    {
        name: 'Sở thích trong hồ sơ',
        key: 'profileAffinity',
        description:
            'Mức độ candidate khớp với lịch sử quan tâm dài hạn về sản phẩm, danh mục và thương hiệu.',
    },
    {
        name: 'Ngữ cảnh phiên hiện tại',
        key: 'sessionContext',
        description:
            'Mức candidate khớp với danh mục, thương hiệu và sản phẩm đang xem trong phiên.',
    },
    {
        name: 'Tương đồng ngữ nghĩa',
        key: 'semanticSimilarity',
        description:
            'Điểm tương đồng nội dung do semantic retrieval trả về cho candidate.',
    },
    {
        name: 'Hành vi liên quan',
        key: 'coBehavior',
        description:
            'Mức candidate xuất hiện cùng sản phẩm mốc trong quan hệ xem, giỏ hàng hoặc mua.',
    },
    {
        name: 'Độ phổ biến',
        key: 'popularity',
        description:
            'Kết hợp log doanh số với vị trí trong danh sách trending/best-selling.',
    },
    {
        name: 'Độ mới của sản phẩm',
        key: 'freshness',
        description:
            'Ánh xạ tuổi sản phẩm trong catalog vào các mức freshness đã định nghĩa.',
    },
    {
        name: 'Chất lượng và tồn kho',
        key: 'quality',
        description:
            'Kết hợp rating, số review đã chuẩn hóa và khả năng còn hàng.',
    },
    {
        name: 'Khám phá',
        key: 'exploration',
        description:
            'Đánh dấu candidate từ EXPLORE/NEWEST khi sở thích hồ sơ còn yếu.',
    },
];

// Hiển thị đúng luồng đang chạy: tạo vector feature, dự đoán raw score, rồi áp dụng diversity.
export function RecommendationScoring() {
    return (
        <section className="space-y-4">
            <section
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                aria-label="Luồng LambdaRank xếp hạng candidate"
            >
                <header className="border-b border-zinc-100 px-4 py-4 sm:px-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Luồng chấm điểm
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                        Từ candidate đến thứ tự sản phẩm
                    </h4>
                </header>
                <ol className="grid divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                    <li className="p-4">
                        <p className="font-mono text-[10px] font-semibold text-zinc-400">
                            01 · ỨNG VIÊN
                        </p>
                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                            Hợp nhất tối đa 300 sản phẩm
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Candidate đến từ hồ sơ, session, semantic search,
                            quan hệ hành vi và catalog.
                        </p>
                    </li>
                    <li className="p-4">
                        <p className="font-mono text-[10px] font-semibold text-zinc-400">
                            02 · FEATURE VECTOR
                        </p>
                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                            Tính 8 tiêu chí
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Mỗi feature được chuẩn hóa trong [0, 1]. Tín hiệu
                            phạt sở thích âm được truyền thêm thành feature thứ
                            chín.
                        </p>
                    </li>
                    <li className="p-4">
                        <p className="font-mono text-[10px] font-semibold text-zinc-400">
                            03 · LAMBDARANK
                        </p>
                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                            Model học thứ tự
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            LightGBM LambdaRank trả relevance score thô; code không cộng
                            điểm tuyến tính thủ công và không coi score là xác suất mua.
                        </p>
                    </li>
                    <li className="p-4">
                        <p className="font-mono text-[10px] font-semibold text-zinc-400">
                            04 · TRẢ DANH SÁCH
                        </p>
                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                            Sắp xếp rồi đa dạng hóa
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Sắp theo model score giảm dần, sau đó áp dụng giới
                            hạn lặp danh mục, thương hiệu và shop.
                        </p>
                    </li>
                </ol>
                <p className="border-t border-zinc-100 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600 sm:px-5">
                    Nếu model thiếu hoặc lỗi, API báo unavailable; request
                    không chuyển sang công thức xếp hạng khác. Candidate
                    generation và diversity vẫn là các bước riêng với model.
                </p>
            </section>

            <RecommendationDisclosure
                id="ranking-feature-formulas"
                number="2.2.1"
                title="Cách tính 8 tiêu chí đầu vào"
                description="Các công thức bên dưới tạo feature cho từng sản phẩm. LambdaRank học cách kết hợp chúng từ dữ liệu đã gán nhãn."
                level={4}
                variant="flow"
            >
                <div className="space-y-3">
                    <p className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-600 sm:p-4">
                        Các giá trị như ngưỡng, mốc thời gian và hệ số trong
                        từng feature là quy tắc hiện được cấu hình trong dự án.
                        Nguồn nghiên cứu bên dưới hỗ trợ nguyên lý hoặc họ
                        phương pháp, nhưng không tự chứng minh các hằng số này
                        tối ưu cho dữ liệu của hệ thống.
                    </p>
                    {rankingFeatures.map((feature, index) => (
                        <RecommendationDisclosure
                            key={feature.key}
                            id={`ranking-feature-${feature.key}`}
                            number={`2.2.1.${index + 1}`}
                            title={feature.name}
                            description={feature.description}
                            level={5}
                            variant="flow"
                        >
                            <RankingWeightDetails
                                id={`ranking-feature-detail-${feature.key}`}
                                signal={feature.key}
                            />
                        </RecommendationDisclosure>
                    ))}
                </div>
            </RecommendationDisclosure>
        </section>
    );
}
