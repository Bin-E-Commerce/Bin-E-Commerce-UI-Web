// Hợp đồng trình bày cho các bước trong showcase; không đại diện cho event hay API runtime.
export interface ShowcaseFlowStep {
    id: string;
    title: string;
    summary: string;
    detail: string;
    output: string;
    implementation?: string;
}

// Mô tả một service trong sơ đồ ở mức người xem hiểu được trách nhiệm, không phụ thuộc tên class nội bộ.
export interface ShowcaseArchitectureNode {
    name: string;
    responsibility: string;
}

// Cấu trúc cây mục lục dùng chung cho các trang showcase; mỗi ID phải trùng với một anchor thật trên trang.
// Label là copy trình bày, còn children chỉ mô tả quan hệ phân cấp chứ không chứa logic cuộn trang.
export interface ShowcaseTocItem {
    id: string;
    label: string;
    children?: ShowcaseTocItem[];
}
