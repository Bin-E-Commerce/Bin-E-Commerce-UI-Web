// Contract nội bộ của các component Admin User; giữ dữ liệu API ở một boundary chung
// để list, detail và các card không phải tự khai báo lại shape của user.
export type AdminUsersSummary = {
    total: number;
    active: number;
    banned: number;
};
