import type {
    ShopProfileChangeRequestDto,
    ShopProfileChangeSection,
} from '@/services/seller';

export interface ChangeComparisonRow {
    key: string;
    label: string;
    before: string;
    after: string;
}

export interface RequestedVerificationDocument {
    key: string;
    label: string;
    fileName: string;
    url: string;
}

const SECTION_LABELS: Record<ShopProfileChangeSection, string> = {
    tax: 'Thuế',
    payout: 'Thanh toán',
    identity: 'Định danh',
};

const FIELD_LABELS: Record<string, string> = {
    legalName: 'Tên pháp lý',
    taxCode: 'Mã số thuế',
    invoiceEmail: 'Email nhận hóa đơn',
    bankCode: 'Mã ngân hàng',
    bankName: 'Ngân hàng',
    accountNumber: 'Số tài khoản',
    accountHolderName: 'Chủ tài khoản',
    accountType: 'Loại tài khoản',
    branch: 'Chi nhánh',
    citizenId: 'Số CCCD',
    representativeName: 'Người đại diện',
    representativeRole: 'Chức vụ / Vai trò',
    contactEmail: 'Email pháp lý',
    contactPhone: 'Số điện thoại pháp lý',
    documents: 'Bộ giấy tờ xác minh',
};

const DOCUMENT_LABELS: Record<string, string> = {
    citizenIdFront: 'CCCD mặt trước',
    citizenIdBack: 'CCCD mặt sau',
    businessLicense: 'Giấy đăng ký kinh doanh',
    representativeDocument: 'Giấy tờ người đại diện',
};

// Chuyển section code thành nhãn ngắn dùng chung ở list và detail.
export function formatChangeSection(section: ShopProfileChangeSection): string {
    return SECTION_LABELS[section];
}

// Chuẩn hóa thời gian theo locale Việt Nam cho hàng đợi duyệt.
export function formatChangeDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Làm phẳng snapshot theo từng section để admin nhìn được đúng field trước/sau thay vì phải đọc JSON thô.
export function buildChangeComparisonRows(
    request: ShopProfileChangeRequestDto,
): Record<ShopProfileChangeSection, ChangeComparisonRow[]> {
    const result: Record<ShopProfileChangeSection, ChangeComparisonRow[]> = {
        tax: [],
        payout: [],
        identity: [],
    };

    for (const section of request.sections) {
        const before = request.currentSnapshot[section] ?? {};
        const after = request.requestedChanges[section] ?? {};

        for (const [key, nextValue] of Object.entries(after)) {
            result[section].push({
                key,
                label: FIELD_LABELS[key] ?? key,
                before: formatComparisonValue(
                    before[key as keyof typeof before],
                ),
                after: formatComparisonValue(nextValue),
            });
        }
    }

    return result;
}

// Lọc metadata tài liệu hợp lệ từ payload động để UI chỉ render liên kết có URL an toàn về mặt kiểu dữ liệu.
export function getRequestedVerificationDocuments(
    request: ShopProfileChangeRequestDto,
): RequestedVerificationDocument[] {
    const documents = request.requestedChanges.identity?.documents;
    if (!documents || typeof documents !== 'object') return [];

    return Object.entries(documents).flatMap(([key, value]) => {
        if (!value || typeof value !== 'object') return [];

        const document = value as Record<string, unknown>;
        if (typeof document.url !== 'string' || !document.url) return [];

        return [
            {
                key,
                label: DOCUMENT_LABELS[key] ?? key,
                fileName:
                    typeof document.fileName === 'string'
                        ? document.fileName
                        : 'Tài liệu xác minh',
                url: document.url,
            },
        ];
    });
}

// Hiển thị scalar và metadata giấy tờ theo cách ngắn gọn nhưng không làm mất thông tin admin cần đối chiếu.
function formatComparisonValue(value: unknown): string {
    if (value === null || value === undefined || value === '') return 'Chưa có';
    if (value === 'personal') return 'Cá nhân / Hộ kinh doanh';
    if (value === 'business') return 'Doanh nghiệp';
    if (typeof value === 'object') {
        const count = Object.keys(value as Record<string, unknown>).length;
        return `${count} giấy tờ đã tải lên`;
    }
    return String(value);
}
