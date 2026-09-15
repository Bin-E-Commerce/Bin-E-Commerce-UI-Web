// Trình bày hai vòng chạy riêng: request trả danh sách và event bất đồng bộ cập nhật dữ liệu cho lần gợi ý sau.
import { ShowcaseSectionHeading } from '../../../components/shared/ShowcaseSectionHeading';
import { ShowcaseStepExplorer } from '../../../components/shared/ShowcaseStepExplorer';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import type { ShowcaseFlowStep } from '../../../types/showcase.types';

const recommendationRequestSteps: ShowcaseFlowStep[] = [
    {
        id: 'request',
        title: 'Gửi yêu cầu',
        summary:
            'Trang chủ hoặc trang sản phẩm hỏi hệ thống nên hiển thị sản phẩm nào ở vị trí này.',
        detail: 'Web gọi GET /api/v1/recommendation/recommendations qua API Gateway, gửi surface (home, product_detail hoặc recommendations_page), page/pageSize và productId nếu đây là trang chi tiết. Gateway chuyển identity user đã xác thực hoặc guest session; backend không nhận userId do trình duyệt tự chọn. Guest chỉ xem page đầu.',
        output: 'RecommendationController nhận actor tin cậy cùng vị trí hiển thị, giới hạn phân trang và sản phẩm mốc nếu có.',
        implementation:
            'RecommendationProxyController → RecommendationController.getRecommendations',
    },
    {
        id: 'context',
        title: 'Nạp ngữ cảnh',
        summary:
            'Hệ thống kiểm tra kết quả đã cache; nếu cần tạo mới thì đọc lịch sử sở thích và hoạt động phiên.',
        detail: 'Cache key bao gồm loại/ID actor, session, surface, productId, page/pageSize, version cache, policy và variant experiment. Khi cache miss, RecommendationQueryService đọc tối đa 30 preference sản phẩm, 12 danh mục và 12 thương hiệu; session context đến từ Redis. Có preference dương thì strategy là PERSONALIZED; nếu không nhưng session context tồn tại thì SESSION_BASED; không có context mới là COLD_START. Cache hit vẫn cấp requestId và item token mới cho lần phục vụ hiện tại.',
        output: 'Context đã chọn đúng user/guest, strategy và phiên bản policy; không dùng lẫn response của actor hoặc trang khác.',
        implementation:
            'RecommendationQueryService · ProfileQueryService · SessionContextService · RecommendationRedisService',
    },
    {
        id: 'candidates',
        title: 'Gom candidate',
        summary:
            'Tìm các sản phẩm có thể phù hợp từ catalog, hồ sơ, nội dung tương tự và quan hệ hành vi.',
        detail: 'CandidateGenerationService kết hợp product/category/brand affinity và trending; riêng COLD_START bổ sung best-selling, newest, explore. Phương pháp tương đồng nội dung lấy sản phẩm đang xem (trọng số 1), tối đa 5 sản phẩm gần đây theo trọng số event và tối đa 5 sản phẩm hồ sơ (mỗi anchor 0,5), tạo vector đại diện rồi nhờ Qdrant tìm tối đa 60 ứng viên. Phương pháp hành vi liên quan lấy tối đa 10 product anchor để tra quan hệ đã hình thành từ lượt xem, giỏ hàng và đơn mua. Hai nguồn này cần anchor và dữ liệu tương ứng; vector phải có contentHash khớp catalog. Các source chạy bằng Promise.allSettled; candidate trùng được gộp, product đang xem và tối đa 3 product gần đây bị loại. Nếu vượt giới hạn, CandidateUnionService chia lượt theo source để giữ độ phủ; pool dừng ở 300.',
        output: 'Candidate duy nhất kèm source, raw score, reason và anchor; source rỗng/lỗi không chặn các nguồn còn lại.',
        implementation:
            'CandidateGenerationService · SemanticCandidateService · RelationCandidateService · CandidateUnionService',
    },
    {
        id: 'ranking',
        title: 'Chấm và sắp xếp',
        summary:
            'Standard Ranking tính điểm cho từng candidate, rồi cân bằng danh mục, thương hiệu và shop.',
        detail: 'RankingFeatureService tính 8 tín hiệu trong [0,1]; RecommendationRuleService chuẩn hóa tổng trọng số về 100%, còn negativePenalty được trừ riêng và bị chặn tối đa 0,15. Có hai cách xếp cùng candidate: Standard áp dụng trọng số đã cấu hình; AI-Enhanced kết hợp điểm Standard với dự đoán ML theo mlBlend. Dữ liệu experiment có attribution giúp so sánh hai cách và tinh chỉnh trọng số/tỷ lệ AI theo mục tiêu. Nếu lượt AI thiếu prediction hoặc modelVersion hợp lệ, hệ thống dùng Standard và không tính lượt fallback là AI. Trong code, hai mode này mang tên HYBRID và ML_HYBRID. RecommendationRankingService sắp xếp, trộn quota nguồn khi cold-start rồi diversity theo cửa sổ: product_detail tối đa 2 cùng category, 2 cùng brand, 3 cùng shop trong 6 item; surface khác là 4/3/5 trong 24 item. Nếu quota làm thiếu danh sách, lượt thứ hai nới quota thay vì bỏ hết candidate.',
        output: 'Danh sách canonical tối đa 180 item; sau đó API mới cắt trang (pageSize tối đa 24, product_detail tối đa 6).',
        implementation:
            'RankingExperimentService · RankingFeatureService · RecommendationRankingService · RecommendationMlRankingService',
    },
    {
        id: 'response',
        title: 'Hiển thị kết quả',
        summary:
            'Web nhận product card cùng thứ hạng, nguồn gợi ý và dấu vết bảo vệ attribution.',
        detail: 'Mỗi item trả rank, score đã làm tròn 6 chữ số, source và reason do backend ánh xạ; cùng response có requestId, strategy, profileState, page và policy/model/experiment metadata. Item token được ký để gắn product, rank, source, surface, policy và experiment. ProductCard chỉ queue impression khi ít nhất 50% card đi vào viewport; client khử trùng lặp rồi gửi batch tối đa 20 event. Cache hit cũng tạo token mới, không dùng lại attribution của request trước.',
        output: 'Web render được product card và có đủ metadata để click/impression sau này truy ngược đúng recommendation item.',
        implementation:
            'RecommendationQueryService.toResponseItem · RecommendationTrackingTokenService · ProductCard · impression-queue',
    },
];

const recommendationFeedbackSteps: ShowcaseFlowStep[] = [
    {
        id: 'interaction',
        title: 'Người mua tương tác',
        summary:
            'Xem, click, thêm/xóa giỏ, mua hoặc trả hàng tạo các tín hiệu có ý nghĩa khác nhau.',
        detail: 'ProductCard ghi impression khi visibility đạt 50%, còn view/click/cart đi theo event tương ứng. Mặc định profile cộng impression 0,05; view 1; click 2; search 1,5; thêm giỏ 4; xóa giỏ −2. Purchase hoàn tất cộng 8 × số lượng từng sản phẩm; trả hàng trừ 8 × số lượng. Đây là điểm preference cấu hình được, không phải xác suất mua. Nếu hành động phát sinh từ card recommendation, event gửi kèm signed item token để backend kiểm tra attribution.',
        output: 'Hành vi Web có actor/session và thông tin item; sự kiện đơn hàng đến từ order event stream riêng.',
        implementation:
            'ProductCard · recommendation.api.ts · Order purchase event producers',
    },
    {
        id: 'queue',
        title: 'API xác thực và đưa vào Kafka',
        summary:
            'Request tracking được kiểm tra rồi xếp hàng; người dùng không phải chờ profile tính toán xong.',
        detail: 'Web gọi POST /api/v1/recommendation/events hoặc /events/batch qua Gateway. InteractionIngestionService lấy userId/sessionId từ trusted header, từ chối attribution thiếu/sai và verify item token bằng actor, product, rank, source, surface, policy/experiment. Server tự cấp eventId và occurredAt rồi publish recommendation.interactions.v1. Batch API chấp nhận 1–50 event; HTTP 202 chỉ có nghĩa Kafka đã nhận, không có nghĩa profile đã cập nhật. Kafka lỗi thì API trả lỗi, không báo queued giả.',
        output: 'Event đã được broker tiếp nhận, có định danh/thời gian từ server và có thể được consumer retry an toàn.',
        implementation:
            'RecommendationProxyController → InteractionController → InteractionIngestionService → KafkaProducerService',
    },
    {
        id: 'projection',
        title: 'Consumer cập nhật cho lần sau',
        summary:
            'Consumer chống xử lý lặp, cập nhật hồ sơ sở thích và tạo quan hệ giữa những sản phẩm cùng được quan tâm.',
        detail: 'KafkaConsumerService gọi InteractionProcessingService: validate, insert ledger idempotent rồi ProfileProjectionService cập nhật preference PRODUCT/CATEGORY/BRAND/QUERY. Điểm preference giảm theo half-life mặc định 7 ngày. SessionContextService giữ tối đa 30 product gần nhất, TTL mặc định 24 giờ. RelationConsumerService là consumer group riêng: co-view ghép view/click/impression trong cửa sổ 30 phút; co-cart ghép add-to-cart trong 7 ngày; co-purchase nối sản phẩm trong cùng đơn; return trừ relation mua. Vì profile và relation là hai projection riêng, thời điểm cập nhật có thể khác nhau.',
        output: 'Request kế tiếp có thể dùng preference/session mới và relation mới; đây là xử lý bất đồng bộ, không sửa ngược response đã trả.',
        implementation:
            'KafkaConsumerService → InteractionProcessingService / RelationConsumerService → ProfileProjectionService / RelationProjectionService',
    },
];

// Đặt hai vòng xử lý nối tiếp nhau để người đọc đối chiếu input, output và service của từng bước.
export function RecommendationJourney() {
    return (
        <section className="space-y-7">
            <ShowcaseSectionHeading
                title="Hai vòng nối tiếp: phục vụ hiện tại, học cho lần sau."
                level={3}
                description="Vòng đọc trả sản phẩm ngay; vòng event chạy nền sau khi người dùng tương tác. Mỗi bước nêu rõ API/service xử lý và dữ liệu được chuyển tiếp."
            />

            <div className="space-y-5">
                <RecommendationDisclosure
                    number="1"
                    title="Vòng request: từ Web đến danh sách sản phẩm"
                    description="Năm bước đồng bộ, kèm input, output và service xử lý."
                >
                    <ShowcaseStepExplorer
                        title="Request được xử lý trước khi Web render card."
                        description="Cache hit có thể trả nhanh; cache miss đi qua context, candidate, ranking và pagination."
                        headingLevel={3}
                        detailId="recommendation-request-step-detail"
                        steps={recommendationRequestSteps}
                    />
                </RecommendationDisclosure>

                <RecommendationDisclosure
                    number="2"
                    title="Vòng feedback: từ hành vi đến dữ liệu lần sau"
                    description="Ba bước bất đồng bộ theo event từ Web/Order đến Kafka, hồ sơ và quan hệ sản phẩm."
                >
                    <ShowcaseStepExplorer
                        title="Event không cập nhật profile ngay trong response hiện tại."
                        description="API chỉ chờ Kafka nhận event; consumer và các projection xử lý sau đó, độc lập với thời gian render sản phẩm."
                        headingLevel={3}
                        detailId="recommendation-feedback-step-detail"
                        steps={recommendationFeedbackSteps}
                    />
                </RecommendationDisclosure>
            </div>
        </section>
    );
}
