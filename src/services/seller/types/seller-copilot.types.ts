// Contract frontend tương ứng với event SSE và resource read-only của Seller Copilot.
// Type này không chứa access token và không cho client truyền shop scope.
import type { SellerCopilotInsight } from './seller-copilot-insight.types';

// Mode do người bán chọn; mode chỉ xác định nguồn backend được phép gọi, không tự cấp quyền ghi dữ liệu.
export type SellerCopilotInteractionMode =
    'chat' | 'shop_data' | 'knowledge' | 'agent';

export interface SellerCopilotCitation {
    id: string;
    label: string;
    title?: string;
    sectionPath?: string[];
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
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: {
        citations?: SellerCopilotCitation[];
        incomplete?: boolean;
        insights?: SellerCopilotInsight[];
        intent?: string;
        dataAsOf?: string;
        capabilities?: SellerCapabilityStatusItem[];
        answerStatus?: SellerCopilotAnswerStatus;
        dataSources?: Array<{
            kind: 'shop_data' | 'live_data' | 'seller_profile';
            label: string;
        }>;
        interactionMode?: SellerCopilotInteractionMode;
        modeSessionId?: string;
        timelineEvent?: 'mode_changed';
        actionProposal?: {
            proposalId: string;
            payload: {
                kind: 'SET_INVENTORY';
                productId: string;
                productName: string;
                variantId: string;
                variantName: string;
                expectedAvailable: number;
                nextAvailable: number;
            };
            expiresAt: string;
            status?: 'pending' | 'completed' | 'failed';
            result?: Record<string, unknown>;
        };
    } | null;
    createdAt: string;
}

export interface SellerCopilotInventoryActionResult {
    proposalId: string;
    status: 'completed';
    message: string;
    availableQuantity: number;
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
    | {
          type: 'started';
          conversationId: string;
          requestId: string;
          modeSessionId?: string;
      }
    | { type: 'status'; phase: string; message: string }
    | { type: 'sources'; items: SellerCopilotCitation[] }
    | { type: 'answer_status'; status: SellerCopilotAnswerStatus }
    | { type: 'replace'; text: string }
    | { type: 'insight'; items: SellerCopilotInsight[] }
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
          type: 'data_sources';
          items: Array<{
              kind: 'shop_data' | 'live_data' | 'seller_profile';
              label: string;
          }>;
      }
    | {
          type: 'action_proposed';
          proposalId: string;
          action: {
              kind: 'SET_INVENTORY';
              productId: string;
              productName: string;
              variantId: string;
              variantName: string;
              currentAvailable: number;
              nextAvailable: number;
          };
          expiresAt: string;
      }
    | {
          type: 'action_result';
          proposalId: string;
          status: 'completed' | 'failed';
          message: string;
          availableQuantity?: number;
      }
    | {
          type: 'done';
          dataAsOf: string;
          citations: SellerCopilotCitation[];
          latencyMs: number;
      }
    | { type: 'error'; code: string; retryable: boolean; message: string };
