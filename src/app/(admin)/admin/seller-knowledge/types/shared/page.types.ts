// Kiểu khu vực và đích điều hướng của trang điều phối Seller Knowledge.

export type PageSection = 'documents' | 'domains';

export type PendingNavigation =
    | { type: 'close' }
    | { type: 'select-document'; id: string }
    | { type: 'create-document'; domainCode?: string }
    | { type: 'open-domains' }
    | { type: 'cancel-edit' };
