// Quản lý bản nháp tạm của wizard sản phẩm khi Seller chuyển sang trang cấu hình giao nhận.

import type { ProductCreateStepId } from '../types/product-create-step.type';
import type {
    SellerProductCreateFormValues,
    SellerProductCreateReferences,
} from '../types/seller-product-create-form.type';

const PRODUCT_EDITOR_DRAFT_KEY = 'seller-product-editor-draft-v1';
const PRODUCT_EDITOR_DRAFT_VERSION = 1;
const PRODUCT_CREATE_STEP_IDS: ProductCreateStepId[] = [
    'basic',
    'details',
    'sales',
    'shipping',
    'other',
];

interface ProductEditorDraft {
    version: number;
    values: SellerProductCreateFormValues;
    references: SellerProductCreateReferences;
    activeStep: ProductCreateStepId;
}

// Xác minh tối thiểu dữ liệu đọc từ sessionStorage trước khi đưa vào React Hook Form.
function isProductEditorDraft(value: unknown): value is ProductEditorDraft {
    if (!value || typeof value !== 'object') return false;

    const draft = value as Partial<ProductEditorDraft>;
    return (
        draft.version === PRODUCT_EDITOR_DRAFT_VERSION &&
        typeof draft.values === 'object' &&
        draft.values !== null &&
        typeof draft.references === 'object' &&
        draft.references !== null &&
        PRODUCT_CREATE_STEP_IDS.includes(draft.activeStep as ProductCreateStepId)
    );
}

// Lưu dữ liệu cần để quay lại đúng bước và giữ category/brand/attribute đã tải từ backend.
export function saveProductEditorDraft(
    values: SellerProductCreateFormValues,
    references: SellerProductCreateReferences,
    activeStep: ProductCreateStepId,
): void {
    if (typeof window === 'undefined') return;

    try {
        const draft: ProductEditorDraft = {
            version: PRODUCT_EDITOR_DRAFT_VERSION,
            values,
            references,
            activeStep,
        };
        window.sessionStorage.setItem(PRODUCT_EDITOR_DRAFT_KEY, JSON.stringify(draft));
    } catch {
        // Không chặn Seller sang trang giao nhận nếu trình duyệt từ chối sessionStorage.
    }
}

// Đọc bản nháp hợp lệ; dữ liệu hỏng hoặc sai version sẽ bị bỏ qua để wizard dùng defaultValues an toàn.
export function readProductEditorDraft(): ProductEditorDraft | null {
    if (typeof window === 'undefined') return null;

    try {
        const rawDraft = window.sessionStorage.getItem(PRODUCT_EDITOR_DRAFT_KEY);
        if (!rawDraft) return null;

        const parsedDraft: unknown = JSON.parse(rawDraft);
        return isProductEditorDraft(parsedDraft) ? parsedDraft : null;
    } catch {
        return null;
    }
}

// Xóa bản nháp sau khi submit thành công hoặc Seller chủ động hủy wizard.
export function clearProductEditorDraft(): void {
    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.removeItem(PRODUCT_EDITOR_DRAFT_KEY);
    } catch {
        // Bỏ qua lỗi storage vì bản nháp không ảnh hưởng đến dữ liệu đã lưu trên server.
    }
}
