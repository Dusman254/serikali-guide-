import { ServiceCategoryId } from '../data/serikaliData';

export type ServiceAvailabilityStatus = 'ACTIVE' | 'INACTIVE' | 'COMING_SOON';
export type ServiceStatus = ServiceAvailabilityStatus;

export interface ServiceQuestionConfig {
  id: string;
  prompt: string;
  type: 'boolean' | 'choice' | 'text' | 'number';
  options?: string[]; // e.g. ['Yes', 'No'] or ['Series A (34 Pages)', 'Series B (50 Pages)']
  required: boolean;
  helpText?: string;
  placeholder?: string;
}

export interface ServiceDocumentRequirement {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  acceptedFormats?: string[];
  maxSizeMb?: number;
}

export interface ManagedServiceItem {
  id: string; // e.g. 'passport-renewal', 'passport-lost-replace', etc.
  name: string;
  slug: string;
  description: string;
  category: ServiceCategoryId;
  categoryName: string;
  subCategoryId?: string;
  image?: string;
  status: ServiceAvailabilityStatus;

  // Pricing configuration (Admin controlled)
  serviceFee: number; // Serikali Guide Assistance Fee in KES
  currency: string; // 'KES'
  governmentFee: number; // Statutory Government/Official Fee in KES
  governmentFeeIncluded: boolean; // false = 'Paid separately to authority', true = 'Included in total'
  discount?: number; // Discount in KES

  requirements: string[];
  documents: ServiceDocumentRequirement[];
  questions: ServiceQuestionConfig[];
  steps: string[];
  processingInfo: string;
  officialSource?: string;
  terms?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ServiceRequestStatus =
  | 'Received'
  | 'Payment confirmed'
  | 'Documents pending'
  | 'Documents under review'
  | 'Additional information required'
  | 'Processing at Agency'
  | 'Completed'
  | 'Cancelled';

export interface UploadedDocumentItem {
  documentId: string;
  documentName: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  uploadedAt: string;
  fileData?: string; // Data URL or storage reference for review & download
  retentionExpiresAt?: string; // Auto-purge date (7 days after upload)
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  source?: string;
  status: 'active' | 'unsubscribed';
  lastSentAt?: string;
  notes?: string;
  campaignHistory?: Array<{
    subject: string;
    sentAt: string;
  }>;
}

export interface ServiceRequestSubmission {
  id: string;
  referenceNumber: string; // e.g. 'SG-2026-001245'
  serviceId: string;
  serviceName: string;
  category: ServiceCategoryId;
  categoryName: string;

  // Pricing snapshot
  serviceFee: number;
  governmentFee: number;
  governmentFeeIncluded: boolean;
  discount: number;
  totalPaid: number;
  currency: string;

  // Client Details
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNationality?: string;

  // Answers & Documents
  answers: Record<string, any>;
  documents: UploadedDocumentItem[];

  // Retention disclosure (Max 7 days storage)
  retentionExpiresAt?: string; // 7 days after submission
  retentionDaysLeft?: number;

  // Payment
  paymentMethod: 'mpesa' | 'card';
  paymentReference?: string;
  paymentStatus: 'pending' | 'verifying' | 'confirmed' | 'failed' | 'cancelled';
  paidAt?: string;

  // Request Status
  status: ServiceRequestStatus;
  statusNotes?: string;
  nextStepNote?: string;
  adminNotes?: string;
  nextStep?: string;
  createdAt: string;
  updatedAt: string;
}
