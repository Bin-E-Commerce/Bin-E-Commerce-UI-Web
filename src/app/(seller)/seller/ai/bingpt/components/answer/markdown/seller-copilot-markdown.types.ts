// Contract nội bộ của renderer Markdown Seller Copilot.
// Type chỉ mô tả block đã parse, không biết dữ liệu API và không chứa JSX layout.

export interface SellerCopilotMarkdownProps {
    content: string;
}

export type SellerCopilotMarkdownBlock =
    | { type: 'paragraph'; lines: string[] }
    | { type: 'heading'; level: number; content: string }
    | { type: 'quote'; lines: string[] }
    | {
          type: 'callout';
          variant: 'summary' | 'info' | 'warning' | 'tip';
          title: string;
          lines: string[];
      }
    | { type: 'code'; language: string; content: string }
    | { type: 'unordered-list'; items: string[] }
    | { type: 'ordered-list'; items: string[] }
    | {
          type: 'numbered-sections';
          items: Array<{ title: string; details: string[] }>;
      }
    | { type: 'table'; headers: string[]; rows: string[][] }
    | { type: 'rule' };
