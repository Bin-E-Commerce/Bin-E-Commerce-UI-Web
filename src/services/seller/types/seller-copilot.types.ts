// Contract frontend tương ứng với event SSE và resource read-only của Seller Copilot.
// Type này không chứa access token và không cho client truyền shop scope.
export type SellerCopilotRange = '7d' | '30d' | '90d';

export interface SellerCopilotCitation {
    id: string;
    label: string;
    type: string;
    excerpt?: string;
    content?: string;
    documentId?: string;
    domain?: string;
    dataAsOf?: string;
    version?: string;
}

export type SellerCapabilityStatus =
    'SUPPORTED' | 'PARTIAL' | 'IN_DEVELOPMENT' | 'UNSUPPORTED';

export type SellerCopilotAnswerStatus =
    | 'answered'
    | 'partial'
    | 'in_development'
    | 'unsupported'
    | 'provider_error';

export interface SellerCapabilityStatusItem {
    code: string;
    label: string;
    status: SellerCapabilityStatus;
    message: string;
    missingEvidence: string[];
    suggestedQuestions: string[];
}

export interface SellerCopilotMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    metadata?: {
        citations?: SellerCopilotCitation[];
        insights?: Array<Record<string, unknown>>;
        intent?: string;
        dataAsOf?: string;
        capabilities?: SellerCapabilityStatusItem[];
        answerStatus?: SellerCopilotAnswerStatus;
    } | null;
    createdAt: string;
}

export interface SellerCopilotConversation {
    id: string;
    title: string;
    isPinned: boolean;
    pinnedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SellerCopilotConversationPage {
    items: SellerCopilotConversation[];
    hasMore: boolean;
    nextOffset: number | null;
}

export interface SellerCopilotSearchResult {
    conversationId: string;
    title: string;
    snippet: string;
    matchedIn: 'title' | 'user' | 'assistant';
    updatedAt: string;
}

export interface SellerCopilotConversationDetail {
    conversation: SellerCopilotConversation;
    messages: SellerCopilotMessage[];
    hasMoreMessages: boolean;
    nextBefore: string | null;
}

export type SellerCopilotStreamEvent =
    | { type: 'started'; conversationId: string; requestId: string }
    | { type: 'status'; phase: string; message: string }
    | { type: 'sources'; items: SellerCopilotCitation[] }
    | { type: 'insight'; items: Array<Record<string, unknown>> }
    | {
          type: 'capability';
          items: SellerCapabilityStatusItem[];
      }
    | {
          type: 'policy_notice';
          status:
              'partial' | 'in_development' | 'unsupported' | 'provider_error';
          message: string;
          topics: string[];
          suggestedPrompts: string[];
      }
    | { type: 'token'; text: string }
    | {
          type: 'clarification';
          question: string;
          options: Array<{ label: string; value: string }>;
      }
    | { type: 'out_of_scope'; message: string; suggestedPrompts: string[] }
    | { type: 'warning'; code: string; message: string }
    | {
          type: 'done';
          dataAsOf: string;
          citations: SellerCopilotCitation[];
          latencyMs: number;
      }
    | { type: 'error'; code: string; retryable: boolean; message: string };
