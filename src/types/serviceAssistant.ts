import { ServiceCategoryId } from '../data/serikaliData';

export type AssistantMode = 'find-service' | 'ask-question' | 'my-journeys';

export interface ServiceRequirementItem {
  id: string;
  label: string;
  isMandatory: boolean;
  whyNeeded: string;
  whatCounts: string;
  commonMistakes: string;
  completed?: boolean;
}

export interface ServiceStepItem {
  number: number;
  title: string;
  description: string;
}

export interface PersonalizedServiceResult {
  serviceId: string;
  subCategoryId: string;
  categoryId: ServiceCategoryId;
  serviceName: string;
  categoryName: string;
  summary: string;
  whyThisService: string;
  officialPortal: string;
  estimatedTimeline: string;
  statutoryFeeNote?: string;
  requirements: ServiceRequirementItem[];
  nextSteps: ServiceStepItem[];
  guideUrl?: {
    page: 'service-detail';
    serviceId: ServiceCategoryId;
    subCategoryId: string;
  };
}

export interface ProgressiveQuestionOption {
  id: string;
  label: string;
  subLabel?: string;
  nextQuestionId?: string;
  result?: PersonalizedServiceResult;
}

export interface ProgressiveQuestion {
  id: string;
  prompt: string;
  subPrompt?: string;
  categoryContext?: string;
  options: ProgressiveQuestionOption[];
}

export interface ServiceJourney {
  id: string;
  serviceId: string;
  subCategoryId: string;
  categoryId: ServiceCategoryId;
  serviceName: string;
  startedAt: string;
  updatedAt: string;
  currentStepIndex: number;
  completedRequirementIds: string[];
  totalRequirementsCount: number;
  trackingReference?: string;
  trackingStatus?: 'Request Received' | 'Documents Under Review' | 'Processing at Agency' | 'Approved / Completed';
  userNotes?: string;
}

export interface AssistantChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'navigate' | 'start-service' | 'open-checklist';
    payload: any;
  };
  matchedService?: {
    categoryId: ServiceCategoryId;
    subCategoryId: string;
    serviceName: string;
    summary: string;
  };
}
