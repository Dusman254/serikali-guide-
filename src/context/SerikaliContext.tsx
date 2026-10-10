import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  BLOG_POSTS,
  BlogDonation,
  BlogPost,
  ClientInquiry,
  ConsultationBooking,
  ConsultationStatus,
  INITIAL_CONSULTATIONS,
  INITIAL_DONATIONS,
  INITIAL_INQUIRIES,
  InquiryStatus,
  SERVICE_CATEGORIES,
  ServiceCategory,
  SubCategoryDetail,
} from '../data/serikaliData';
import { blogDbService } from '../services/blogDbService';
import {
  subscribeToBlogs,
  saveBlogToFirestore,
  removeBlogFromFirestore,
  subscribeToServiceRequests,
  saveServiceRequestToFirestore,
  deleteServiceRequestFromFirestore,
  subscribeToNewsletterSubscribers,
  saveNewsletterSubscriberToFirestore,
  subscribeToManagedServices,
  saveManagedServiceToFirestore,
  removeManagedServiceFromFirestore,
  subscribeToServiceCategories,
  saveServiceCategoryToFirestore,
} from '../services/firebase';
import { DETAILED_SERVICE_RESULTS } from '../data/serviceKnowledgeBase';
import {
  ManagedServiceItem,
  ServiceRequestSubmission,
  ServiceRequestStatus,
  NewsletterSubscriber,
} from '../types/serviceApplication';
import {
  INITIAL_MANAGED_SERVICES,
  INITIAL_SERVICE_REQUESTS,
} from '../data/initialManagedServices';
import { INITIAL_NEWSLETTER_SUBSCRIBERS } from '../data/initialNewsletterSubscribers';

export interface RegisteredService {
  id: string;
  serviceId: string;
  subCategoryId: string;
  categoryId: string;
  serviceName: string;
  categoryName: string;
  summary: string;
  officialPortal: string;
  estimatedTimeline: string;
  statutoryFeeNote?: string;
  keywords: string[];
  intents: string[];
  requirements: Array<{
    id: string;
    label: string;
    isMandatory: boolean;
    whyNeeded?: string;
    whatCounts?: string;
    commonMistakes?: string;
  }>;
  explanationTemplate?: string;
}

// Common English stop words to filter out during intent tokenization
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which',
  'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
  'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
  'should', 'now', 'need', 'want', 'help', 'looking', 'please', 'tell', 'get'
]);

/**
 * Tokenizes user input, stripping punctuation, converting to lowercase,
 * and filtering out common non-substantive words to isolate intent-carrying keywords.
 */
export function tokenizeInput(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

export interface IntentMatchResult {
  bestMatch: RegisteredService | null;
  relatedSuggestions: RegisteredService[];
  relatedCategories: ServiceCategory[];
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  identifiedKeywords: string[];
  primaryIntent: string;
}

/**
 * Natural language mapping function that tokenizes user input to identify
 * key procedural keywords (e.g., 'lost', 'passport', 'renew', 'visa') and
 * dynamically correlates them to service IDs from the SerikaliContext service registry,
 * while returning related service categories.
 */
export function mapNaturalLanguageToServices(
  rawQuery: string,
  registry: RegisteredService[] = [],
  categories: ServiceCategory[] = SERVICE_CATEGORIES
): IntentMatchResult {
  const clean = rawQuery.trim().toLowerCase();
  const tokens = tokenizeInput(rawQuery);

  // Helper to resolve related categories based on service and tokens
  const resolveRelatedCategories = (primaryCategoryId?: string): ServiceCategory[] => {
    const matchedCategoryIds = new Set<string>();
    if (primaryCategoryId) {
      matchedCategoryIds.add(primaryCategoryId);
    }
    if (tokens.some((t) => ['passport', 'passports', 'booklet', 'lost', 'renew'].includes(t))) {
      matchedCategoryIds.add('government-documents');
      matchedCategoryIds.add('immigration-visas');
    }
    if (tokens.some((t) => ['work', 'permit', 'visa', 'eta', 'travel', 'special', 'pass', 'dependent'].includes(t))) {
      matchedCategoryIds.add('immigration-visas');
      matchedCategoryIds.add('government-documents');
    }
    if (tokens.some((t) => ['company', 'business', 'incorporation', 'brs'].includes(t))) {
      matchedCategoryIds.add('business-registration');
      matchedCategoryIds.add('tax-compliance');
    }
    if (tokens.some((t) => ['ngo', 'nonprofit', 'charity', 'foundation'].includes(t))) {
      matchedCategoryIds.add('ngo-nonprofit');
      matchedCategoryIds.add('tax-compliance');
    }
    if (tokens.some((t) => ['tax', 'kra', 'compliance', 'tcc', 'pin'].includes(t))) {
      matchedCategoryIds.add('tax-compliance');
      matchedCategoryIds.add('business-registration');
    }

    categories.forEach((cat) => {
      const catText = `${cat.name} ${cat.overview} ${(cat.shortLabel || '')}`.toLowerCase();
      if (tokens.some((tok) => catText.includes(tok))) {
        matchedCategoryIds.add(cat.id);
      }
    });

    const res = categories.filter((c) => matchedCategoryIds.has(c.id));
    if (res.length > 0) return res;
    return categories.slice(0, 3);
  };

  if (tokens.length === 0 && !clean) {
    return {
      bestMatch: null,
      relatedSuggestions: [],
      relatedCategories: categories.slice(0, 3),
      confidence: 'low',
      explanation: '',
      identifiedKeywords: [],
      primaryIntent: '',
    };
  }

  // Identify core keyword clusters from tokens
  const hasLost = tokens.some((t) =>
    ['lost', 'stolen', 'misplaced', 'missing', 'damaged', 'replace', 'replacement', 'abstract', 'affidavit'].includes(t)
  );
  const hasPassport = tokens.some((t) =>
    ['passport', 'passports', 'booklet', 'nyayo', 'travel-document'].includes(t)
  ) || clean.includes('passport');
  const hasRenew = tokens.some((t) =>
    ['renew', 'renewal', 'renewing', 'expire', 'expired', 'expiring', 'validity'].includes(t)
  );
  const hasWork = tokens.some((t) =>
    ['work', 'employment', 'job', 'hire', 'hiring', 'expatriate', 'understudy'].includes(t)
  );
  const hasPermit = tokens.some((t) => ['permit', 'permits', 'class-d', 'class-g'].includes(t)) || clean.includes('permit');
  const hasVisa = tokens.some((t) =>
    ['visa', 'visas', 'eta', 'travel', 'tourist', 'tourism', 'entry', 'visitor', 'holiday'].includes(t)
  );
  const hasSpecialPass = clean.includes('special pass') || (tokens.includes('special') && tokens.includes('pass')) || clean.includes('consultant');
  const hasCompany = tokens.some((t) =>
    ['company', 'business', 'incorporate', 'incorporation', 'ltd', 'limited', 'brs', 'cr12'].includes(t)
  );
  const hasNgo = tokens.some((t) =>
    ['ngo', 'nonprofit', 'charity', 'foundation', 'cbo', 'pbo'].includes(t)
  );
  const hasTax = tokens.some((t) =>
    ['tax', 'kra', 'tcc', 'compliance', 'pin', 'returns', 'itax'].includes(t)
  );
  const hasDependent = tokens.some((t) =>
    ['dependent', 'spouse', 'child', 'children', 'family', 'wife', 'husband'].includes(t)
  );

  const identifiedKeywords: string[] = [];
  if (hasLost) identifiedKeywords.push('lost/replacement');
  if (hasPassport) identifiedKeywords.push('passport');
  if (hasRenew) identifiedKeywords.push('renewal');
  if (hasWork || hasPermit) identifiedKeywords.push('work-permit');
  if (hasVisa) identifiedKeywords.push('visa/eTA');
  if (hasSpecialPass) identifiedKeywords.push('special-pass');
  if (hasCompany) identifiedKeywords.push('business');
  if (hasNgo) identifiedKeywords.push('ngo');
  if (hasTax) identifiedKeywords.push('tax');
  if (hasDependent) identifiedKeywords.push('dependent-pass');

  // Helper to find service by registered ID with fallback to knowledge base if registry is empty
  const findServiceById = (id: string): RegisteredService | undefined => {
    const fromRegistry = registry.find((s) => s.id === id || s.serviceId === id);
    if (fromRegistry) return fromRegistry;

    const fallbackDetail = (DETAILED_SERVICE_RESULTS as Record<string, any>)[id];
    if (fallbackDetail) {
      return {
        id,
        serviceId: fallbackDetail.serviceId,
        subCategoryId: fallbackDetail.subCategoryId,
        categoryId: fallbackDetail.categoryId,
        serviceName: fallbackDetail.serviceName,
        categoryName: fallbackDetail.categoryName,
        summary: fallbackDetail.summary,
        officialPortal: fallbackDetail.officialPortal,
        estimatedTimeline: fallbackDetail.estimatedTimeline,
        statutoryFeeNote: fallbackDetail.statutoryFeeNote,
        keywords: [id, fallbackDetail.serviceName.toLowerCase()],
        intents: [id],
        requirements: (fallbackDetail.requirements || []).map((r: any) => ({
          id: r.id,
          label: r.label,
          isMandatory: r.isMandatory,
          whyNeeded: r.whyNeeded,
          whatCounts: r.whatCounts,
          commonMistakes: r.commonMistakes,
        })),
        explanationTemplate: fallbackDetail.whyThisService,
      };
    }
    return undefined;
  };

  // RULE A: Lost Passport / Replacement -> Passport Replacement
  if (
    (hasLost && hasPassport) ||
    hasLost ||
    (hasPassport && (clean.includes('replace') || clean.includes('replacement')))
  ) {
    const best = findServiceById('passport-lost-replace') || registry[0] || null;
    const related = [
      findServiceById('passport-renewal'),
      findServiceById('passport-new'),
      findServiceById('special-pass'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'government-documents'),
      confidence: 'high',
      explanation: "Because you've reported a lost passport, this service may be relevant.",
      identifiedKeywords,
      primaryIntent: 'replace_lost_passport',
    };
  }

  // RULE B: Renew Passport -> Passport Renewal
  if (hasRenew && hasPassport) {
    const best = findServiceById('passport-renewal') || registry[0] || null;
    const related = [
      findServiceById('passport-new'),
      findServiceById('passport-lost-replace'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'government-documents'),
      confidence: 'high',
      explanation: 'Because your current passport has expired or is nearing expiration, standard passport renewal applies.',
      identifiedKeywords,
      primaryIntent: 'renew_passport',
    };
  }

  // RULE C: General Passport inquiry
  if (hasPassport && !hasWork && !hasVisa) {
    const best = findServiceById('passport-renewal') || registry[0] || null;
    const related = [
      findServiceById('passport-new'),
      findServiceById('passport-lost-replace'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'government-documents'),
      confidence: 'medium',
      explanation: 'Based on your passport inquiry, this procedural guide outlines official application and renewal requirements.',
      identifiedKeywords,
      primaryIntent: 'passport_general',
    };
  }

  // RULE D: Special Pass
  if (hasSpecialPass) {
    const best = findServiceById('special-pass') || registry[0] || null;
    const related = [
      findServiceById('work-permit-class-d'),
      findServiceById('eta-visa'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'immigration-visas'),
      confidence: 'high',
      explanation: 'For temporary professional assignments under 6 months, a Special Pass provides rapid legal authorization.',
      identifiedKeywords,
      primaryIntent: 'temporary_special_pass',
    };
  }

  // RULE E: Work Permits
  if (hasWork || (hasPermit && !hasSpecialPass)) {
    const isInvestor = tokens.some((t) => ['invest', 'investor', 'capital', 'entrepreneur'].includes(t));
    const bestId = isInvestor ? 'work-permit-class-g' : 'work-permit-class-d';
    const altId = isInvestor ? 'work-permit-class-d' : 'work-permit-class-g';

    const best = findServiceById(bestId) || registry[0] || null;
    const related = [
      findServiceById(altId),
      findServiceById('special-pass'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'immigration-visas'),
      confidence: 'high',
      explanation: isInvestor
        ? 'For foreign investors establishing commercial trade with capital investment ($100k+), Class G Permit is the designated statutory pathway.'
        : 'For expatriate employment in Kenya, a statutory Class D Work Permit with a Kenyan understudy is mandated.',
      identifiedKeywords,
      primaryIntent: 'work_permit',
    };
  }

  // RULE F: Tourist Visa / eTA
  if (hasVisa) {
    const best = findServiceById('eta-visa') || registry[0] || null;
    const related = [
      findServiceById('special-pass'),
      findServiceById('work-permit-class-d'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'immigration-visas'),
      confidence: 'high',
      explanation: 'All international travelers visiting Kenya must hold a valid electronic Travel Authorisation (eTA) prior to boarding.',
      identifiedKeywords,
      primaryIntent: 'tourist_eta',
    };
  }

  // RULE G: Company / Business Registration
  if (hasCompany) {
    const best = findServiceById('company-registration') || registry[0] || null;
    const related = [
      findServiceById('tax-compliance'),
      findServiceById('work-permit-class-g'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'business-registration'),
      confidence: 'high',
      explanation: 'For starting a legal commercial venture in Kenya, Private Limited Company registration via BRS provides corporate standing.',
      identifiedKeywords,
      primaryIntent: 'company_registration',
    };
  }

  // RULE H: NGO / Non-profit Registration
  if (hasNgo) {
    const best = findServiceById('ngo-registration') || registry[0] || null;
    const related = [
      findServiceById('company-registration'),
      findServiceById('tax-compliance'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'ngo-nonprofit'),
      confidence: 'high',
      explanation: 'Non-profit and philanthropic organizations must obtain statutory gazettement from the NGO Co-ordination Board.',
      identifiedKeywords,
      primaryIntent: 'ngo_registration',
    };
  }

  // RULE I: Tax Compliance / KRA PIN
  if (hasTax) {
    const best = findServiceById('tax-compliance') || registry[0] || null;
    const related = [
      findServiceById('company-registration'),
      findServiceById('work-permit-class-d'),
    ].filter(Boolean) as RegisteredService[];

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best?.categoryId || 'tax-compliance'),
      confidence: 'high',
      explanation: 'A KRA Tax Compliance Certificate (TCC) confirms all statutory tax obligations and returns are in good standing.',
      identifiedKeywords,
      primaryIntent: 'tax_compliance',
    };
  }

  // 2. Dynamic scoring across entire SerikaliContext service registry
  const scored = registry.map((service) => {
    let score = 0;
    const nameLower = service.serviceName.toLowerCase();
    const summaryLower = service.summary.toLowerCase();
    const keywordsLower = service.keywords.map((k) => k.toLowerCase());
    const intentsLower = service.intents.map((i) => i.toLowerCase());

    if (nameLower.includes(clean)) score += 30;
    if (summaryLower.includes(clean)) score += 15;

    tokens.forEach((token) => {
      if (nameLower.includes(token)) score += 10;
      if (keywordsLower.some((k) => k.includes(token))) score += 8;
      if (intentsLower.some((i) => i.includes(token))) score += 7;
      if (summaryLower.includes(token)) score += 3;
    });

    return { service, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score > 0) {
    const best = scored[0].service;
    const related = scored
      .slice(1, 4)
      .filter((s) => s.score > 0)
      .map((s) => s.service);

    return {
      bestMatch: best,
      relatedSuggestions: related,
      relatedCategories: resolveRelatedCategories(best.categoryId),
      confidence: scored[0].score > 15 ? 'high' : 'medium',
      explanation: best.explanationTemplate || `Based on your query, ${best.serviceName} matches your procedural request.`,
      identifiedKeywords,
      primaryIntent: best.intents[0] || 'service_search',
    };
  }

  return {
    bestMatch: registry[0] || null,
    relatedSuggestions: registry.slice(1, 4),
    relatedCategories: resolveRelatedCategories(registry[0]?.categoryId),
    confidence: 'low',
    explanation: 'Here are the closest available government procedural guidelines.',
    identifiedKeywords,
    primaryIntent: 'general_search',
  };
}

export type LanguageCode = 'en' | 'sw' | 'fr' | 'ar' | 'zh' | 'es' | 'de' | 'hi';

export interface LanguageOption {
  code: LanguageCode;
  shortCode: string;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', shortCode: 'EN', label: 'English', nativeLabel: 'English' },
  { code: 'sw', shortCode: 'SW', label: 'Swahili', nativeLabel: 'Kiswahili' },
  { code: 'fr', shortCode: 'FR', label: 'French', nativeLabel: 'Français' },
  { code: 'ar', shortCode: 'AR', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'zh', shortCode: 'ZH', label: 'Chinese', nativeLabel: '中文' },
  { code: 'es', shortCode: 'ES', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'de', shortCode: 'DE', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'hi', shortCode: 'HI', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export interface UiTranslations {
  navHome: string;
  navAbout: string;
  navBlogs: string;
  navContact: string;
  navFreeConsultation: string;
  heroKicker: string;
  heroPrefix: string;
  heroBorderRed: string;
  heroSuffix: string;
  heroSubtext: string;
  searchPlaceholder: string;
  searchButton: string;
  tryAsking: string;
  section01Kicker: string;
  section01Title: string;
  viewAllBlogs: string;
  readFullStory: string;
  section02Kicker: string;
  section02Title: string;
  browseFullArchive: string;
  allFeaturedGuides: string;
  readGuide: string;
  section03Kicker: string;
  section03Title: string;
  chooseSubCategory: string;
  subCategoriesCount: string;
  backToHanger: string;
  bookConsultationFor: string;
  footerNavigation: string;
  footerAdminLink: string;
  // Consultation Stepper & Multi-Page Labels
  step1Title: string;
  step2Title: string;
  step3Title: string;
  stepsRemaining: string;
  stepCompleted: string;
  nextStep: string;
  prevStep: string;
  confirmConsultation: string;
  mandatoryRequirements: string;
  stepByStepProcedure: string;
  officialPortalLabel: string;
  estimatedTimelineLabel: string;
  statutoryFeeLabel: string;
  donateSupportTitle: string;
  donateNowBtn: string;
}

export const TRANSLATIONS: Record<LanguageCode, UiTranslations> = {
  en: {
    navHome: 'Home',
    navAbout: 'About',
    navBlogs: 'Blogs',
    navContact: 'Contact',
    navFreeConsultation: 'Free Consultation',
    heroKicker: '',
    heroPrefix: 'Your one ',
    heroBorderRed: 'border',
    heroSuffix: ' stop post.',
    heroSubtext:
      'Tap or click any service category on the hanger below to choose a sub-category, or search our regulatory blog & service knowledge base.',
    searchPlaceholder:
      'Ask anything about work permits, company registration, NGOs, KRA PIN, passports, eCitizen...',
    searchButton: 'Ask & Search',
    tryAsking: 'Try asking:',
    section01Kicker: '01. Blog Top Stories',
    section01Title: 'Essential Border, Immigration & Corporate Briefings',
    viewAllBlogs: 'View All Blog Stories',
    readFullStory: 'Read Full Story',
    section02Kicker: '02. Blog Features',
    section02Title: 'In-Depth Regulatory Playbooks & Step-by-Step Guides',
    browseFullArchive: 'Browse Full Blog Archive',
    allFeaturedGuides: 'All Featured Guides',
    readGuide: 'Read Guide',
    section03Kicker: '03. Complete Service & Sub-Category Directory',
    section03Title: 'All 8 Core Practice Areas & 45 Sub-Categories',
    chooseSubCategory: 'Choose Sub-Category',
    subCategoriesCount: 'Sub-Categories',
    backToHanger: 'Back to Hanger Overview',
    bookConsultationFor: 'Book Free Consultation for',
    footerNavigation: 'Navigation',
    footerAdminLink: 'Admin Portal',
    step1Title: 'Service & Sub-Category',
    step2Title: 'Your Contact Details',
    step3Title: 'Schedule & Case Summary',
    stepsRemaining: 'steps remaining',
    stepCompleted: 'Ready to confirm booking',
    nextStep: 'Continue to Next Step',
    prevStep: 'Previous Step',
    confirmConsultation: 'Confirm Free Consultation',
    mandatoryRequirements: 'Mandatory Statutory Requirements Checklist',
    stepByStepProcedure: 'Step-by-Step Application Procedure',
    officialPortalLabel: 'Official Government Portal',
    estimatedTimelineLabel: 'Estimated Processing Timeline',
    statutoryFeeLabel: 'Statutory Fee & Tariff Note',
    donateSupportTitle: 'Keep Our Immigration & Civic Guides Free for Everyone',
    donateNowBtn: 'Donate Now',
  },
  sw: {
    navHome: 'Mwanzo',
    navAbout: 'Kuhusu Sisi',
    navBlogs: 'Blogu',
    navContact: 'Mawasiliano',
    navFreeConsultation: 'Ushauri wa Bure',
    heroKicker: '',
    heroPrefix: 'Kituo chako kimoja cha ',
    heroBorderRed: 'mpaka',
    heroSuffix: ' na huduma.',
    heroSubtext:
      'Bofya kitengo chochote cha huduma kwenye fremu hapo chini kuchagua huduma ndogo, au tafuta kwenye miongozo yetu ya blogu na huduma.',
    searchPlaceholder:
      'Uliza kuhusu vibali vya kazi, usajili wa kampuni, NGO, KRA PIN, pasipoti, eCitizen...',
    searchButton: 'Uliza na Tafuta',
    tryAsking: 'Jaribu kuuliza:',
    section01Kicker: '01. Habari Kuu za Blogu',
    section01Title: 'Taarifa Muhimu za Uhamiaji, Mpaka na Usajili wa Biashara',
    viewAllBlogs: 'Tazama Makala Zote',
    readFullStory: 'Soma Makala Kamili',
    section02Kicker: '02. Makala Maalum za Blogu',
    section02Title: 'Miongozo ya Kina ya Hatua kwa Hatua',
    browseFullArchive: 'Tazama Kumbukumbu Yote ya Blogu',
    allFeaturedGuides: 'Miongozo Yote Maalum',
    readGuide: 'Soma Mwongozo',
    section03Kicker: '03. Orodha Kamili ya Huduma',
    section03Title: 'Idara Kuu 8 na Huduma Ndogo 45',
    chooseSubCategory: 'Chagua Huduma Ndogo',
    subCategoriesCount: 'Huduma Ndogo',
    backToHanger: 'Rudi Kwenye Orodha Kuu',
    bookConsultationFor: 'Weka Ushauri wa Bure kwa',
    footerNavigation: 'Viungo vya Ukurasa',
    footerAdminLink: 'Ukurasa wa Admin',
    step1Title: 'Huduma na Kipengele',
    step2Title: 'Mawasiliano Yako',
    step3Title: 'Tarehe na Maelezo',
    stepsRemaining: 'hatua zimesalia',
    stepCompleted: 'Tayari kuthibitisha miadi',
    nextStep: 'Endelea Hatua Inayofuata',
    prevStep: 'Rudi Nyuma',
    confirmConsultation: 'Thibitisha Ushauri wa Bure',
    mandatoryRequirements: 'Orodha ya Mahitaji ya Kisheria',
    stepByStepProcedure: 'Utaratibu wa Kutuma Maombi Hatua kwa Hatua',
    officialPortalLabel: 'Tovuti Rasmi ya Serikali',
    estimatedTimelineLabel: 'Muda wa Kushughulikia Maombi',
    statutoryFeeLabel: 'Ada ya Serikali',
    donateSupportTitle: 'Saidia Kuweka Miongozo Yetu ya Uhamiaji na Huduma Bure',
    donateNowBtn: 'Changia Sasa',
  },
  fr: {
    navHome: 'Accueil',
    navAbout: 'À Propos',
    navBlogs: 'Blogs',
    navContact: 'Contact',
    navFreeConsultation: 'Consultation Gratuite',
    heroKicker: '',
    heroPrefix: 'Votre guichet unique ',
    heroBorderRed: 'frontalier',
    heroSuffix: ' au Kenya.',
    heroSubtext:
      'Cliquez sur une catégorie de service ci-dessous pour choisir une sous-catégorie, ou recherchez dans nos guides et services.',
    searchPlaceholder:
      'Recherchez permis de travail, création de société, ONG, KRA PIN, passeport, eCitizen...',
    searchButton: 'Rechercher',
    tryAsking: 'Essayez de demander :',
    section01Kicker: '01. À la Une du Blog',
    section01Title: 'Analyses Essentielles sur l’Immigration et les Entreprises',
    viewAllBlogs: 'Voir Tous les Articles',
    readFullStory: 'Lire l’Article Complet',
    section02Kicker: '02. Dossiers du Blog',
    section02Title: 'Guides Réglementaires Étape par Étape',
    browseFullArchive: 'Parcourir Toutes les Archives',
    allFeaturedGuides: 'Tous les Guides',
    readGuide: 'Lire le Guide',
    section03Kicker: '03. Répertoire Complet des Services',
    section03Title: 'Nos 8 Piliers de Pratique et 45 Sous-Catégories',
    chooseSubCategory: 'Choisir une Sous-Catégorie',
    subCategoriesCount: 'Sous-Catégories',
    backToHanger: 'Retour à l’Accueil',
    bookConsultationFor: 'Consultation Gratuite pour',
    footerNavigation: 'Navigation',
    footerAdminLink: 'Portail Admin',
    step1Title: 'Service & Sous-Catégorie',
    step2Title: 'Vos Coordonnées',
    step3Title: 'Date & Résumé du Dossier',
    stepsRemaining: 'étapes restantes',
    stepCompleted: 'Prêt à confirmer le rendez-vous',
    nextStep: 'Étape Suivante',
    prevStep: 'Étape Précédente',
    confirmConsultation: 'Confirmer la Consultation Gratuite',
    mandatoryRequirements: 'Liste des Documents Légaux Requis',
    stepByStepProcedure: 'Procédure de Demande Étape par Étape',
    officialPortalLabel: 'Portail Officiel du Gouvernement',
    estimatedTimelineLabel: 'Délai de Traitement Estimé',
    statutoryFeeLabel: 'Frais Statutaires Officiels',
    donateSupportTitle: 'Soutenez Nos Guides Civiques et d’Immigration Gratuits',
    donateNowBtn: 'Faire un Don',
  },
  ar: {
    navHome: 'الرئيسية',
    navAbout: 'من نحن',
    navBlogs: 'المدونة',
    navContact: 'اتصل بنا',
    navFreeConsultation: 'استشارة مجانية',
    heroKicker: '',
    heroPrefix: 'محطتك الشاملة عبر ',
    heroBorderRed: 'الحدود',
    heroSuffix: ' في كينيا.',
    heroSubtext:
      'انقر على أي فئة خدمة أدناه لاختيار الخدمة الفرعية، أو ابحث مباشرة في قاعدة بيانات المقالات والخدمات.',
    searchPlaceholder:
      'ابحث عن تصاريح العمل، تسجيل الشركات، المنظمات، الرقم الضريبي KRA، جوازات السفر...',
    searchButton: 'بحث ذكي',
    tryAsking: 'جرّب السؤال عن:',
    section01Kicker: '01. أهم مقالات المدونة',
    section01Title: 'تقارير أساسية حول الهجرة وتأسيس الشركات في كينيا',
    viewAllBlogs: 'عرض جميع المقالات',
    readFullStory: 'قراءة المقال كاملاً',
    section02Kicker: '02. الأدلة المميزة',
    section02Title: 'أدلة تنظيمية مفصلة خطوة بخطوة',
    browseFullArchive: 'تصفح أرشيف المدونة الكامل',
    allFeaturedGuides: 'جميع الأدلة المميزة',
    readGuide: 'اقرأ الدليل',
    section03Kicker: '03. دليل الخدمات والفئات الفرعية',
    section03Title: 'جميع الأقسام الثمانية و45 خدمة فرعية',
    chooseSubCategory: 'اختر الفئة الفرعية',
    subCategoriesCount: 'فئات فرعية',
    backToHanger: 'العودة إلى القائمة الرئيسية',
    bookConsultationFor: 'احجز استشارة مجانية في',
    footerNavigation: 'روابط التنقل',
    footerAdminLink: 'بوابة الإدارة (Admin)',
    step1Title: 'الخدمة والفئة الفرعية',
    step2Title: 'بيانات الاتصال الخاصة بك',
    step3Title: 'الموعد وملخص الطلب',
    stepsRemaining: 'خطوات متبقية',
    stepCompleted: 'جاهز لتأكيد الحجز',
    nextStep: 'الانتقال للخطوة التالية',
    prevStep: 'الخطوة السابقة',
    confirmConsultation: 'تأكيد الاستشارة المجانية',
    mandatoryRequirements: 'قائمة المتطلبات والوثائق الرسمية',
    stepByStepProcedure: 'خطوات التقديم بالتفصيل',
    officialPortalLabel: 'البوابة الحكومية الرسمية',
    estimatedTimelineLabel: 'المدة المتوقعة للإنجاز',
    statutoryFeeLabel: 'الرسوم الحكومية المقررة',
    donateSupportTitle: 'ادعم استمرار أدلة الهجرة والخدمات الحكومية مجاناً للجميع',
    donateNowBtn: 'تبرع الآن',
  },
  zh: {
    navHome: '首页',
    navAbout: '关于我们',
    navBlogs: '博客指南',
    navContact: '联系我们',
    navFreeConsultation: '免费咨询',
    heroKicker: '',
    heroPrefix: '您的一站式',
    heroBorderRed: '边境',
    heroSuffix: '服务驿站。',
    heroSubtext:
      '点击下方挂架上的任何服务类别以选择子类别，或直接搜索我们的博客与政务知识库。',
    searchPlaceholder:
      '搜索工作许可、公司注册、NGO注册、KRA税号、护照、eCitizen...',
    searchButton: '智能搜索',
    tryAsking: '热门问题：',
    section01Kicker: '01. 博客头条报道',
    section01Title: '肯尼亚移民、投资与企业合规核心简报',
    viewAllBlogs: '查看全部文章',
    readFullStory: '阅读全文',
    section02Kicker: '02. 博客精选指南',
    section02Title: '分步法规实操指南与全流程解析',
    browseFullArchive: '浏览完整博客档案',
    allFeaturedGuides: '全部精选指南',
    readGuide: '阅读指南',
    section03Kicker: '03. 完整服务与子类别目录',
    section03Title: '8大核心业务领域与45项子服务',
    chooseSubCategory: '选择子类别',
    subCategoriesCount: '个子类别',
    backToHanger: '返回挂架概览',
    bookConsultationFor: '预约免费咨询：',
    footerNavigation: '网站导航',
    footerAdminLink: '管理后台 (Admin)',
    step1Title: '选择服务与子类别',
    step2Title: '您的联系方式',
    step3Title: '预约时间与需求概述',
    stepsRemaining: '步剩余',
    stepCompleted: '准备确认预约',
    nextStep: '下一步',
    prevStep: '上一步',
    confirmConsultation: '确认预约免费咨询',
    mandatoryRequirements: '法定必备申请材料清单',
    stepByStepProcedure: '分步申请操作流程',
    officialPortalLabel: '官方政务门户网站',
    estimatedTimelineLabel: '预计审批办理周期',
    statutoryFeeLabel: '法定政府收费标准',
    donateSupportTitle: '支持我们持续免费提供肯尼亚移民与政务指南',
    donateNowBtn: '立即捐赠支持',
  },
  es: {
    navHome: 'Inicio',
    navAbout: 'Nosotros',
    navBlogs: 'Blogs',
    navContact: 'Contacto',
    navFreeConsultation: 'Consulta Gratis',
    heroKicker: '',
    heroPrefix: 'Su puesto único de ',
    heroBorderRed: 'frontera',
    heroSuffix: ' y servicios.',
    heroSubtext:
      'Toque cualquier categoría de servicio en el perchero para elegir una subcategoría o busque en nuestra base de conocimientos.',
    searchPlaceholder:
      'Pregunte sobre permisos de trabajo, registro de empresas, ONG, KRA PIN, pasaportes, eCitizen...',
    searchButton: 'Buscar',
    tryAsking: 'Pruebe preguntar:',
    section01Kicker: '01. Historias Destacadas del Blog',
    section01Title: 'Informes Esenciales de Inmigración y Registro Corporativo',
    viewAllBlogs: 'Ver Todos los Blogs',
    readFullStory: 'Leer Artículo Completo',
    section02Kicker: '02. Guías Especiales del Blog',
    section02Title: 'Manuales Regulatorios Paso a Paso',
    browseFullArchive: 'Explorar Archivo Completo',
    allFeaturedGuides: 'Todas las Guías',
    readGuide: 'Leer Guía',
    section03Kicker: '03. Directorio Completo de Servicios',
    section03Title: 'Las 8 Áreas Principales y 45 Subcategorías',
    chooseSubCategory: 'Elegir Subcategoría',
    subCategoriesCount: 'Subcategorías',
    backToHanger: 'Volver al Inicio',
    bookConsultationFor: 'Consulta Gratis para',
    footerNavigation: 'Navegación',
    footerAdminLink: 'Portal Admin',
    step1Title: 'Servicio y Subcategoría',
    step2Title: 'Datos de Contacto',
    step3Title: 'Fecha y Resumen del Caso',
    stepsRemaining: 'pasos restantes',
    stepCompleted: 'Listo para confirmar',
    nextStep: 'Siguiente Paso',
    prevStep: 'Paso Anterior',
    confirmConsultation: 'Confirmar Consulta Gratis',
    mandatoryRequirements: 'Lista de Requisitos Legales Obligatorios',
    stepByStepProcedure: 'Procedimiento de Solicitud Paso a Paso',
    officialPortalLabel: 'Portal Oficial del Gobierno',
    estimatedTimelineLabel: 'Tiempo Estimado de Procesamiento',
    statutoryFeeLabel: 'Tarifa Legal Oficial',
    donateSupportTitle: 'Mantenga Nuestras Guías de Inmigración Gratuitas',
    donateNowBtn: 'Donar Ahora',
  },
  de: {
    navHome: 'Startseite',
    navAbout: 'Über Uns',
    navBlogs: 'Blogs',
    navContact: 'Kontakt',
    navFreeConsultation: 'Gratis Beratung',
    heroKicker: '',
    heroPrefix: 'Ihre zentrale ',
    heroBorderRed: 'Grenz',
    heroSuffix: '-Anlaufstelle.',
    heroSubtext:
      'Klicken Sie unten auf eine Dienstleistungskategorie, um eine Unterkategorie zu wählen, oder durchsuchen Sie unsere Wissensdatenbank.',
    searchPlaceholder:
      'Fragen Sie nach Arbeitsgenehmigungen, Firmengründung, NGOs, KRA PIN, Reisepass, eCitizen...',
    searchButton: 'Suchen',
    tryAsking: 'Beispiele:',
    section01Kicker: '01. Top-Storys im Blog',
    section01Title: 'Wichtige Briefings zu Einwanderung und Unternehmensrecht',
    viewAllBlogs: 'Alle Blogbeiträge',
    readFullStory: 'Vollständigen Beitrag lesen',
    section02Kicker: '02. Blog-Features',
    section02Title: 'Detaillierte Schritt-für-Schritt-Leitfäden',
    browseFullArchive: 'Gesamtes Blog-Archiv',
    allFeaturedGuides: 'Alle Leitfäden',
    readGuide: 'Leitfaden lesen',
    section03Kicker: '03. Vollständiges Leistungsverzeichnis',
    section03Title: 'Alle 8 Kernbereiche & 45 Unterkategorien',
    chooseSubCategory: 'Unterkategorie wählen',
    subCategoriesCount: 'Unterkategorien',
    backToHanger: 'Zurück zur Übersicht',
    bookConsultationFor: 'Kostenlose Beratung für',
    footerNavigation: 'Navigation',
    footerAdminLink: 'Admin-Portal',
    step1Title: 'Kategorie & Unterkategorie',
    step2Title: 'Ihre Kontaktdaten',
    step3Title: 'Termin & Fallbeschreibung',
    stepsRemaining: 'Schritte übrig',
    stepCompleted: 'Bereit zur Bestätigung',
    nextStep: 'Nächster Schritt',
    prevStep: 'Vorheriger Schritt',
    confirmConsultation: 'Kostenlose Beratung bestätigen',
    mandatoryRequirements: 'Gesetzliche Dokumenten-Checkliste',
    stepByStepProcedure: 'Schritt-für-Schritt-Antragsverfahren',
    officialPortalLabel: 'Offizielles Regierungsportal',
    estimatedTimelineLabel: 'Geschätzte Bearbeitungszeit',
    statutoryFeeLabel: 'Gesetzliche Gebühren',
    donateSupportTitle: 'Unterstützen Sie unsere kostenlosen Behörden-Leitfäden',
    donateNowBtn: 'Jetzt Spenden',
  },
  hi: {
    navHome: 'होम',
    navAbout: 'हमारे बारे में',
    navBlogs: 'ब्लॉग',
    navContact: 'संपर्क करें',
    navFreeConsultation: 'निःशुल्क परामर्श',
    heroKicker: '',
    heroPrefix: 'आपका वन स्टॉप ',
    heroBorderRed: 'बॉर्डर',
    heroSuffix: ' पोस्ट।',
    heroSubtext:
      'उप-श्रेणी चुनने के लिए नीचे किसी भी सेवा श्रेणी पर टैप करें, या हमारे ब्लॉग और सेवा ज्ञानकोश में खोजें।',
    searchPlaceholder:
      'वर्क परमिट, कंपनी पंजीकरण, एनजीओ, KRA PIN, पासपोर्ट, eCitizen के बारे में पूछें...',
    searchButton: 'खोजें',
    tryAsking: 'पूछकर देखें:',
    section01Kicker: '01. ब्लॉग प्रमुख खबरें',
    section01Title: 'आव्रजन, सीमा और कॉर्पोरेट पंजीकरण पर आवश्यक मार्गदर्शिकाएँ',
    viewAllBlogs: 'सभी ब्लॉग देखें',
    readFullStory: 'पूरी कहानी पढ़ें',
    section02Kicker: '02. ब्लॉग विशेष लेख',
    section02Title: 'चरण-दर-चरण नियामक मार्गदर्शिकाएँ',
    browseFullArchive: 'संपूर्ण ब्लॉग संग्रह देखें',
    allFeaturedGuides: 'सभी विशेष मार्गदर्शिकाएँ',
    readGuide: 'मार्गदर्शिका पढ़ें',
    section03Kicker: '03. संपूर्ण सेवा और उप-श्रेणी निर्देशिका',
    section03Title: 'सभी 8 मुख्य सेवा क्षेत्र और 45 उप-श्रेणियाँ',
    chooseSubCategory: 'उप-श्रेणी चुनें',
    subCategoriesCount: 'उप-श्रेणियाँ',
    backToHanger: 'मुख्य सूची पर वापस जाएँ',
    bookConsultationFor: 'निःशुल्क परामर्श बुक करें:',
    footerNavigation: 'नेविगेशन',
    footerAdminLink: 'एडमिन पोर्टल (Admin)',
    step1Title: 'सेवा और उप-श्रेणी',
    step2Title: 'आपका संपर्क विवरण',
    step3Title: 'तिथि और मामले का विवरण',
    stepsRemaining: 'चरण शेष हैं',
    stepCompleted: 'पुष्टि करने के लिए तैयार',
    nextStep: 'अगला चरण',
    prevStep: 'पिछला चरण',
    confirmConsultation: 'निःशुल्क परामर्श की पुष्टि करें',
    mandatoryRequirements: 'अनिवार्य वैधानिक दस्तावेज़ सूची',
    stepByStepProcedure: 'चरण-दर-चरण आवेदन प्रक्रिया',
    officialPortalLabel: 'आधिकारिक सरकारी पोर्टल',
    estimatedTimelineLabel: 'अनुमानित प्रक्रिया समय',
    statutoryFeeLabel: 'वैधानिक शुल्क विवरण',
    donateSupportTitle: 'हमारे आव्रजन और नागरिक मार्गदर्शिकाओं को निःशुल्क रखें',
    donateNowBtn: 'अभी दान करें',
  },
};

const STORAGE_KEYS = {
  CATEGORIES: 'serikali_guide_categories_v2',
  BLOGS: 'serikali_guide_blogs_v2',
  CONSULTATIONS: 'serikali_guide_consultations_v2',
  INQUIRIES: 'serikali_guide_inquiries_v2',
  DONATIONS: 'serikali_guide_donations_v2',
  MANAGED_SERVICES: 'serikali_guide_managed_services_v1',
  SERVICE_REQUESTS: 'serikali_guide_service_requests_v1',
  NEWSLETTER: 'serikali_guide_newsletter_v1',
  LANG: 'serikali_guide_lang_v2',
  ADMIN_UNLOCKED: 'serikali_guide_admin_unlocked_v2',
  TRANSLATION_CACHE: 'serikali_guide_i18n_cache_v2',
};

// Singleton broadcast channel instance for zero-latency multi-tab sync
export const getSerikaliBroadcastChannel = (): BroadcastChannel | null => {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel('serikali_realtime_sync_channel');
    } catch {
      return null;
    }
  }
  return null;
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Fast client-side translation helper using public Google Translate endpoint with local caching
// so that ALL details (service categories, sub-categories, requirements, steps, blog titles, excerpts, and sections)
// translate dynamically into the chosen language!
const translationMemory: Record<string, string> = loadJson<Record<string, string>>(
  STORAGE_KEYS.TRANSLATION_CACHE,
  {}
);

async function translateSingleText(
  text: string,
  targetLang: LanguageCode
): Promise<string> {
  if (!text || targetLang === 'en') return text;
  const cacheKey = `${targetLang}::${text}`;
  if (translationMemory[cacheKey]) {
    return translationMemory[cacheKey];
  }
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((segment: any) => (Array.isArray(segment) ? segment[0] : ''))
        .join('');
      if (translated) {
        translationMemory[cacheKey] = translated;
        return translated;
      }
    }
  } catch {
    // Fallback to original text if offline
  }
  return text;
}

export interface SeoPageMetadata {
  pageKey: string;
  title: string;
  description: string;
  ogImage: string;
  keywords?: string;
  canonicalUrl?: string;
  updatedAt?: string;
}

interface SerikaliContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: UiTranslations;
  isTranslatingContent: boolean;

  serviceCategories: ServiceCategory[];
  serviceRegistry: RegisteredService[];
  blogPosts: BlogPost[];
  consultations: ConsultationBooking[];
  inquiries: ClientInquiry[];
  donations: BlogDonation[];

  // Page-Specific SEO Metadata Management
  seoOverrides: Record<string, SeoPageMetadata>;
  updateSeoForPage: (key: string, data: Partial<SeoPageMetadata>) => void;
  resetSeoForPage: (key: string) => void;
  getSeoForPage: (key: string) => SeoPageMetadata;

  // Admin Security (Passcode 1940)
  isAdminUnlocked: boolean;
  unlockAdmin: (passcode: string) => boolean;
  lockAdmin: () => void;

  // Admin CRUD: Categories & Sub-Categories / Services
  addServiceCategory: (
    cat: Omit<ServiceCategory, 'id'> & { id?: string }
  ) => ServiceCategory;
  deleteServiceCategory: (id: string) => void;
  addSubCategory: (
    categoryId: string,
    sub: Omit<SubCategoryDetail, 'id'> & { id?: string }
  ) => SubCategoryDetail | null;
  deleteSubCategory: (categoryId: string, subId: string) => void;

  // Admin CRUD: Blogs (Persistent)
  addBlogPost: (post: Partial<BlogPost>) => BlogPost;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<BlogPost | null>;
  deleteBlogPost: (id: string) => void;
  setBlogPostStatus: (id: string, status: 'published' | 'draft' | 'unpublished') => Promise<void>;
  reloadBlogs: () => Promise<void>;
  isBlogsLoading: boolean;

  // Client & Admin Actions: Consultations, Inquiries, Donations
  addConsultation: (
    data: Omit<
      ConsultationBooking,
      'id' | 'reference' | 'bookingRef' | 'status' | 'createdAt'
    >
  ) => ConsultationBooking;
  updateConsultationStatus: (id: string, status: ConsultationStatus) => void;
  deleteConsultation: (id: string) => void;

  addInquiry: (
    data: Omit<ClientInquiry, 'id' | 'reference' | 'status' | 'createdAt'>
  ) => ClientInquiry;
  updateInquiryStatus: (id: string, status: InquiryStatus) => void;
  deleteInquiry: (id: string) => void;

  addDonation: (
    data: Omit<BlogDonation, 'id' | 'reference' | 'ref' | 'createdAt'>
  ) => BlogDonation;

  // Admin-Controlled Services & Pricing ("Get Started" Flow)
  managedServices: ManagedServiceItem[];
  updateServicePricing: (id: string, updates: Partial<ManagedServiceItem>) => void;
  addManagedService: (service: Partial<ManagedServiceItem>) => ManagedServiceItem;
  deleteManagedService: (id: string) => void;

  // Service Request Submissions & Tracking
  serviceRequests: ServiceRequestSubmission[];
  submitServiceRequest: (
    data: Omit<
      ServiceRequestSubmission,
      'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'
    >
  ) => ServiceRequestSubmission;
  updateServiceRequestStatus: (
    id: string,
    status: ServiceRequestStatus,
    notes?: string,
    nextStep?: string
  ) => void;
  deleteServiceRequest: (id: string) => void;

  // Newsletter Subscribers & Broadcast Campaigns (Admin)
  newsletterSubscribers: NewsletterSubscriber[];
  addNewsletterSubscriber: (
    email: string,
    source?: string,
    name?: string
  ) => { success: boolean; message: string; subscriber: NewsletterSubscriber };
  removeNewsletterSubscriber: (id: string) => void;
  updateNewsletterSubscriber: (
    id: string,
    updates: Partial<NewsletterSubscriber>
  ) => void;
  sendNewsletterBroadcast: (
    subject: string,
    message: string,
    recipientIds?: string[]
  ) => { sentCount: number; timestamp: string };

  // Global "Get Started" Modal / Flow Trigger
  isGetStartedOpen: boolean;
  openGetStarted: (preselectedServiceId?: string) => void;
  closeGetStarted: () => void;
  getStartedPreselectedServiceId?: string;

  // Global "Track Service" Modal Trigger
  isTrackModalOpen: boolean;
  openTrackModal: (referenceNumber?: string) => void;
  closeTrackModal: () => void;
  trackModalPreselectedRef?: string;

  // Natural language mapping from SerikaliContext
  mapQueryToServices: (query: string) => IntentMatchResult;
  mapNaturalLanguageToServices: (
    query: string,
    registry?: RegisteredService[],
    categories?: ServiceCategory[]
  ) => IntentMatchResult;

  resetAllToDefaults: () => void;
}

const SerikaliContext = createContext<SerikaliContextValue | undefined>(
  undefined
);

export const SerikaliProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>(() =>
    loadJson<LanguageCode>(STORAGE_KEYS.LANG, 'en')
  );

  const [rawServiceCategories, setRawServiceCategories] = useState<
    ServiceCategory[]
  >(() =>
    loadJson<ServiceCategory[]>(STORAGE_KEYS.CATEGORIES, SERVICE_CATEGORIES)
  );

  const [rawBlogPosts, setRawBlogPosts] = useState<BlogPost[]>(() =>
    loadJson<BlogPost[]>(STORAGE_KEYS.BLOGS, BLOG_POSTS)
  );

  const [isBlogsLoading, setIsBlogsLoading] = useState(false);
  const recentlyDeletedRef = useRef<Map<string, number>>(new Map());
  const optimisticBlogsRef = useRef<Map<string, { blog: BlogPost; timestamp: number }>>(new Map());

  const reloadBlogs = useCallback(async () => {
    setIsBlogsLoading(true);
    try {
      const posts = await blogDbService.fetchBlogs('all');
      if (Array.isArray(posts) && posts.length > 0) {
        setRawBlogPosts(posts);
      }
    } catch (err) {
      console.warn('Could not sync remote blogs:', err);
    } finally {
      setIsBlogsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadBlogs();
  }, [reloadBlogs]);

  // Real-time Firestore WebSocket-like listener for instant state re-hydration across all active user sessions
  useEffect(() => {
    const unsubscribe = subscribeToBlogs((remoteBlogs) => {
      if (Array.isArray(remoteBlogs)) {
        const now = Date.now();
        // Clean up expired recentlyDeleted (retain tombstone for 30s)
        recentlyDeletedRef.current.forEach((timestamp, id) => {
          if (now - timestamp > 30000) {
            recentlyDeletedRef.current.delete(id);
          }
        });

        // Filter out items currently deleted in this session
        const activeRemote = remoteBlogs.filter((b) => !recentlyDeletedRef.current.has(b.id));
        const remoteMap = new Map(activeRemote.map((b) => [b.id, b]));

        // Gather any optimistic items created locally within last 25s not yet received via remote snapshot
        const pendingOptimistic: BlogPost[] = [];
        optimisticBlogsRef.current.forEach(({ blog, timestamp }, id) => {
          if (now - timestamp < 25000) {
            if (!remoteMap.has(id) && !recentlyDeletedRef.current.has(id)) {
              pendingOptimistic.push(blog);
            }
          } else {
            optimisticBlogsRef.current.delete(id);
          }
        });

        // Instant re-hydration
        const merged = [...pendingOptimistic, ...activeRemote];
        setRawBlogPosts(merged);
        setLocalizedBlogs(merged);
        setIsBlogsLoading(false);

        try {
          localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(merged));
        } catch {}
      }
    });

    // Multi-tab cross-session synchronization via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.BLOGS && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated) && updated.length > 0) {
            setRawBlogPosts(updated);
            setLocalizedBlogs(updated);
          }
        } catch {}
      }
      if (e.key === STORAGE_KEYS.CATEGORIES && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated) && updated.length > 0) {
            setRawServiceCategories(updated);
            setLocalizedCategories(updated);
          }
        } catch {}
      }
      if (e.key === STORAGE_KEYS.SERVICE_REQUESTS && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setServiceRequests(updated);
          }
        } catch {}
      }
      if (e.key === STORAGE_KEYS.MANAGED_SERVICES && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setManagedServices(updated);
          }
        } catch {}
      }
      if (e.key === STORAGE_KEYS.NEWSLETTER && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setNewsletterSubscribers(updated);
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const [localizedCategories, setLocalizedCategories] =
    useState<ServiceCategory[]>(rawServiceCategories);
  const [localizedBlogs, setLocalizedBlogs] =
    useState<BlogPost[]>(rawBlogPosts);
  const [isTranslatingContent, setIsTranslatingContent] = useState(false);

  const [consultations, setConsultations] = useState<ConsultationBooking[]>(
    () =>
      loadJson<ConsultationBooking[]>(
        STORAGE_KEYS.CONSULTATIONS,
        INITIAL_CONSULTATIONS
      )
  );

  const [inquiries, setInquiries] = useState<ClientInquiry[]>(() =>
    loadJson<ClientInquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES)
  );

  const [donations, setDonations] = useState<BlogDonation[]>(() =>
    loadJson<BlogDonation[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS)
  );

  const [managedServices, setManagedServices] = useState<ManagedServiceItem[]>(() =>
    loadJson<ManagedServiceItem[]>(
      STORAGE_KEYS.MANAGED_SERVICES,
      INITIAL_MANAGED_SERVICES
    )
  );

  const [serviceRequests, setServiceRequests] = useState<
    ServiceRequestSubmission[]
  >(() =>
    loadJson<ServiceRequestSubmission[]>(
      STORAGE_KEYS.SERVICE_REQUESTS,
      INITIAL_SERVICE_REQUESTS
    )
  );

  const [newsletterSubscribers, setNewsletterSubscribers] = useState<
    NewsletterSubscriber[]
  >(() =>
    loadJson<NewsletterSubscriber[]>(
      STORAGE_KEYS.NEWSLETTER,
      INITIAL_NEWSLETTER_SUBSCRIBERS
    )
  );

  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [getStartedPreselectedServiceId, setGetStartedPreselectedServiceId] =
    useState<string | undefined>();

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackModalPreselectedRef, setTrackModalPreselectedRef] = useState<
    string | undefined
  >();

  const openGetStarted = useCallback((preselectedServiceId?: string) => {
    setGetStartedPreselectedServiceId(preselectedServiceId);
    setIsGetStartedOpen(true);
  }, []);

  const closeGetStarted = useCallback(() => {
    setIsGetStartedOpen(false);
    setGetStartedPreselectedServiceId(undefined);
  }, []);

  const openTrackModal = useCallback((referenceNumber?: string) => {
    setTrackModalPreselectedRef(referenceNumber);
    setIsTrackModalOpen(true);
  }, []);

  const closeTrackModal = useCallback(() => {
    setIsTrackModalOpen(false);
    setTrackModalPreselectedRef(undefined);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.MANAGED_SERVICES,
        JSON.stringify(managedServices)
      );
    } catch {}
  }, [managedServices]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SERVICE_REQUESTS,
        JSON.stringify(serviceRequests)
      );
    } catch {}
  }, [serviceRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.NEWSLETTER,
        JSON.stringify(newsletterSubscribers)
      );
    } catch {}
  }, [newsletterSubscribers]);

  // Real-time synchronization listeners across Firestore & BroadcastChannel
  useEffect(() => {
    const unsubRequests = subscribeToServiceRequests((remoteReqs) => {
      if (Array.isArray(remoteReqs) && remoteReqs.length > 0) {
        setServiceRequests((prev) => {
          const remoteMap = new Map(remoteReqs.map((r) => [r.id, r]));
          const merged = [...remoteReqs];
          prev.forEach((local) => {
            if (!remoteMap.has(local.id)) {
              merged.push(local);
            }
          });
          try {
            localStorage.setItem(
              STORAGE_KEYS.SERVICE_REQUESTS,
              JSON.stringify(merged)
            );
          } catch {}
          return merged;
        });
      }
    });

    const unsubNewsletters = subscribeToNewsletterSubscribers((remoteSubs) => {
      if (Array.isArray(remoteSubs) && remoteSubs.length > 0) {
        setNewsletterSubscribers((prev) => {
          const remoteMap = new Map(remoteSubs.map((s) => [s.id, s]));
          const merged = [...remoteSubs];
          prev.forEach((local) => {
            if (!remoteMap.has(local.id)) {
              merged.push(local);
            }
          });
          try {
            localStorage.setItem(
              STORAGE_KEYS.NEWSLETTER,
              JSON.stringify(merged)
            );
          } catch {}
          return merged;
        });
      }
    });

    const unsubServices = subscribeToManagedServices((remoteSvcs) => {
      if (Array.isArray(remoteSvcs) && remoteSvcs.length > 0) {
        setManagedServices(remoteSvcs);
        try {
          localStorage.setItem(
            STORAGE_KEYS.MANAGED_SERVICES,
            JSON.stringify(remoteSvcs)
          );
        } catch {}
      }
    });

    const unsubCategories = subscribeToServiceCategories((remoteCats) => {
      if (Array.isArray(remoteCats) && remoteCats.length > 0) {
        setRawServiceCategories(remoteCats);
        setLocalizedCategories(remoteCats);
        try {
          localStorage.setItem(
            STORAGE_KEYS.CATEGORIES,
            JSON.stringify(remoteCats)
          );
        } catch {}
      }
    });

    // Zero-latency cross-tab communication
    const syncChannel = getSerikaliBroadcastChannel();
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === 'SERVICE_REQUEST_ADDED' && data) {
          setServiceRequests((prev) => {
            if (prev.some((r) => r.id === data.id)) return prev;
            return [data, ...prev];
          });
        } else if (type === 'SERVICE_REQUEST_UPDATED' && data) {
          setServiceRequests((prev) =>
            prev.map((r) =>
              r.id === data.id || r.referenceNumber === data.referenceNumber
                ? data
                : r
            )
          );
        } else if (type === 'SERVICE_REQUEST_DELETED' && data) {
          setServiceRequests((prev) =>
            prev.filter((r) => r.id !== data && r.referenceNumber !== data)
          );
        } else if (type === 'MANAGED_SERVICES_SYNC' && Array.isArray(data)) {
          setManagedServices(data);
        } else if (type === 'CATEGORIES_SYNC' && Array.isArray(data)) {
          setRawServiceCategories(data);
          setLocalizedCategories(data);
        } else if (type === 'NEWSLETTER_SYNC' && Array.isArray(data)) {
          setNewsletterSubscribers(data);
        } else if (type === 'BLOGS_SYNC' && Array.isArray(data)) {
          setRawBlogPosts(data);
          setLocalizedBlogs(data);
        }
      };
    }

    return () => {
      unsubRequests();
      unsubNewsletters();
      unsubServices();
      unsubCategories();
      syncChannel?.close();
    };
  }, []);

  const updateServicePricing = useCallback(
    (id: string, updates: Partial<ManagedServiceItem>) => {
      setManagedServices((prev) => {
        const next = prev.map((svc) =>
          svc.id === id
            ? { ...svc, ...updates, updatedAt: new Date().toISOString() }
            : svc
        );
        const updatedTarget = next.find((s) => s.id === id);
        if (updatedTarget) {
          saveManagedServiceToFirestore(updatedTarget).catch(() => {});
        }
        try {
          localStorage.setItem(
            STORAGE_KEYS.MANAGED_SERVICES,
            JSON.stringify(next)
          );
        } catch {}
        const channel = getSerikaliBroadcastChannel();
        channel?.postMessage({
          type: 'MANAGED_SERVICES_SYNC',
          data: next,
        });
        return next;
      });
    },
    []
  );

  const addManagedService = useCallback(
    (serviceData: Partial<ManagedServiceItem>): ManagedServiceItem => {
      const id =
        serviceData.id ||
        `svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newService: ManagedServiceItem = {
        id,
        name: serviceData.name || 'New Service',
        slug:
          serviceData.slug ||
          serviceData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
          id,
        description: serviceData.description || '',
        category: serviceData.category || 'immigration-visas',
        categoryName: serviceData.categoryName || 'Immigration & Visas',
        status: serviceData.status || 'ACTIVE',
        serviceFee: serviceData.serviceFee ?? 2500,
        currency: serviceData.currency || 'KES',
        governmentFee: serviceData.governmentFee ?? 0,
        governmentFeeIncluded: serviceData.governmentFeeIncluded ?? false,
        discount: serviceData.discount ?? 0,
        requirements: serviceData.requirements || [],
        documents: serviceData.documents || [],
        questions: serviceData.questions || [],
        steps: serviceData.steps || [],
        processingInfo:
          serviceData.processingInfo || 'Standard statutory timeline.',
        officialSource:
          serviceData.officialSource || 'Official Government Portal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setManagedServices((prev) => {
        const next = [newService, ...prev];
        try {
          localStorage.setItem(
            STORAGE_KEYS.MANAGED_SERVICES,
            JSON.stringify(next)
          );
        } catch {}
        const channel = getSerikaliBroadcastChannel();
        channel?.postMessage({
          type: 'MANAGED_SERVICES_SYNC',
          data: next,
        });
        return next;
      });
      saveManagedServiceToFirestore(newService).catch(() => {});
      return newService;
    },
    []
  );

  const deleteManagedService = useCallback((id: string) => {
    setManagedServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(
          STORAGE_KEYS.MANAGED_SERVICES,
          JSON.stringify(next)
        );
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'MANAGED_SERVICES_SYNC',
        data: next,
      });
      return next;
    });
    removeManagedServiceFromFirestore(id).catch(() => {});
  }, []);

  const submitServiceRequest = useCallback(
    (
      data: Omit<
        ServiceRequestSubmission,
        'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status'
      >
    ): ServiceRequestSubmission => {
      const randNum = Math.floor(100000 + Math.random() * 900000);
      const ref = `SG-2026-${randNum}`;
      const nowStr = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const retentionExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const newRequest: ServiceRequestSubmission = {
        ...data,
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        referenceNumber: ref,
        status: 'Received',
        statusNotes:
          'Service request dossier received and scheduled for compliance audit.',
        nextStepNote:
          'Our specialized immigration desk will verify your submitted documents and prepare your portal filing.',
        adminNotes: 'Initial dossier received via Serikali Guide portal.',
        nextStep: 'Audit client documents against statutory requirements.',
        retentionExpiresAt,
        retentionDaysLeft: 7,
        createdAt: nowStr,
        updatedAt: nowStr,
      };

      setServiceRequests((prev) => {
        const next = [newRequest, ...prev];
        try {
          localStorage.setItem(
            STORAGE_KEYS.SERVICE_REQUESTS,
            JSON.stringify(next)
          );
        } catch {}
        return next;
      });

      // Cross-tab zero-latency broadcast
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'SERVICE_REQUEST_ADDED',
        data: newRequest,
      });

      // Same-window instant notification
      window.dispatchEvent(
        new CustomEvent('serikali_request_event', {
          detail: { action: 'added', request: newRequest },
        })
      );

      // Async Firestore write
      saveServiceRequestToFirestore(newRequest).catch((err) => {
        console.warn('Firestore service_request write:', err);
      });

      return newRequest;
    },
    []
  );

  const updateServiceRequestStatus = useCallback(
    (
      id: string,
      status: ServiceRequestStatus,
      notes?: string,
      nextStep?: string
    ) => {
      const nowStr = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      let updatedReq: ServiceRequestSubmission | null = null;

      setServiceRequests((prev) => {
        const next = prev.map((req) => {
          if (req.id === id || req.referenceNumber === id) {
            const item: ServiceRequestSubmission = {
              ...req,
              status,
              ...(notes ? { statusNotes: notes, adminNotes: notes } : {}),
              ...(nextStep ? { nextStepNote: nextStep, nextStep } : {}),
              updatedAt: nowStr,
            };
            updatedReq = item;
            return item;
          }
          return req;
        });

        try {
          localStorage.setItem(
            STORAGE_KEYS.SERVICE_REQUESTS,
            JSON.stringify(next)
          );
        } catch {}

        if (updatedReq) {
          const channel = getSerikaliBroadcastChannel();
          channel?.postMessage({
            type: 'SERVICE_REQUEST_UPDATED',
            data: updatedReq,
          });

          window.dispatchEvent(
            new CustomEvent('serikali_request_event', {
              detail: { action: 'updated', request: updatedReq },
            })
          );

          saveServiceRequestToFirestore(updatedReq).catch((err) => {
            console.warn('Firestore service_request update:', err);
          });
        }

        return next;
      });
    },
    []
  );

  const deleteServiceRequest = useCallback((id: string) => {
    setServiceRequests((prev) => {
      const next = prev.filter((r) => r.id !== id && r.referenceNumber !== id);
      try {
        localStorage.setItem(
          STORAGE_KEYS.SERVICE_REQUESTS,
          JSON.stringify(next)
        );
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'SERVICE_REQUEST_DELETED',
        data: id,
      });
      return next;
    });

    deleteServiceRequestFromFirestore(id).catch(() => {});
  }, []);

  const addNewsletterSubscriber = useCallback(
    (
      email: string,
      source: string = 'Website Footer',
      name?: string
    ): { success: boolean; message: string; subscriber: NewsletterSubscriber } => {
      const cleanEmail = email.trim().toLowerCase();
      const nowStr = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const existing = newsletterSubscribers.find(
        (s) => s.email.toLowerCase() === cleanEmail
      );

      if (existing) {
        if (existing.status === 'unsubscribed') {
          const reactivated: NewsletterSubscriber = {
            ...existing,
            status: 'active',
            subscribedAt: nowStr,
            source: source || existing.source,
          };
          setNewsletterSubscribers((prev) => {
            const next = prev.map((s) => (s.id === existing.id ? reactivated : s));
            try {
              localStorage.setItem(
                STORAGE_KEYS.NEWSLETTER,
                JSON.stringify(next)
              );
            } catch {}
            return next;
          });
          saveNewsletterSubscriberToFirestore(reactivated).catch(() => {});
          return {
            success: true,
            message: 'Your subscription has been successfully reactivated!',
            subscriber: reactivated,
          };
        }
        return {
          success: true,
          message: 'You are already subscribed to Serikali Guide regulatory briefings.',
          subscriber: existing,
        };
      }

      const newSub: NewsletterSubscriber = {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email: cleanEmail,
        name: name || '',
        subscribedAt: nowStr,
        source,
        status: 'active',
        campaignHistory: [],
      };

      setNewsletterSubscribers((prev) => {
        const next = [newSub, ...prev];
        try {
          localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify(next));
        } catch {}
        const channel = getSerikaliBroadcastChannel();
        channel?.postMessage({
          type: 'NEWSLETTER_SYNC',
          data: next,
        });
        return next;
      });

      saveNewsletterSubscriberToFirestore(newSub).catch(() => {});

      return {
        success: true,
        message: 'Successfully subscribed to Serikali Guide regulatory briefings.',
        subscriber: newSub,
      };
    },
    [newsletterSubscribers]
  );

  const removeNewsletterSubscriber = useCallback((id: string) => {
    setNewsletterSubscribers((prev) => {
      const next = prev.filter((s) => s.id !== id && s.email !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'NEWSLETTER_SYNC',
        data: next,
      });
      return next;
    });
  }, []);

  const updateNewsletterSubscriber = useCallback(
    (id: string, updates: Partial<NewsletterSubscriber>) => {
      setNewsletterSubscribers((prev) => {
        const next = prev.map((s) =>
          s.id === id || s.email === id ? { ...s, ...updates } : s
        );
        try {
          localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify(next));
        } catch {}
        const channel = getSerikaliBroadcastChannel();
        channel?.postMessage({
          type: 'NEWSLETTER_SYNC',
          data: next,
        });
        const target = next.find((s) => s.id === id || s.email === id);
        if (target) {
          saveNewsletterSubscriberToFirestore(target).catch(() => {});
        }
        return next;
      });
    },
    []
  );

  const sendNewsletterBroadcast = useCallback(
    (
      subject: string,
      message: string,
      recipientIds?: string[]
    ): { sentCount: number; timestamp: string } => {
      const nowStr = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      let sentCount = 0;

      setNewsletterSubscribers((prev) => {
        const next = prev.map((sub) => {
          const isTarget =
            (!recipientIds || recipientIds.length === 0 || recipientIds.includes(sub.id)) &&
            sub.status === 'active';

          if (isTarget) {
            sentCount++;
            const updated: NewsletterSubscriber = {
              ...sub,
              lastSentAt: nowStr,
              campaignHistory: [
                { subject, sentAt: nowStr },
                ...(sub.campaignHistory || []),
              ],
            };
            saveNewsletterSubscriberToFirestore(updated).catch(() => {});
            return updated;
          }
          return sub;
        });

        try {
          localStorage.setItem(STORAGE_KEYS.NEWSLETTER, JSON.stringify(next));
        } catch {}

        const channel = getSerikaliBroadcastChannel();
        channel?.postMessage({
          type: 'NEWSLETTER_SYNC',
          data: next,
        });

        return next;
      });

      return { sentCount, timestamp: nowStr };
    },
    []
  );

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() =>
    loadJson<boolean>(STORAGE_KEYS.ADMIN_UNLOCKED, false)
  );

  const [seoOverrides, setSeoOverrides] = useState<
    Record<string, SeoPageMetadata>
  >(() =>
    loadJson<Record<string, SeoPageMetadata>>('serikali_seo_overrides_v1', {})
  );

  const getSeoForPage = useCallback(
    (key: string): SeoPageMetadata => {
      if (seoOverrides[key]) {
        return seoOverrides[key];
      }

      if (key === 'home') {
        return {
          pageKey: 'home',
          title: 'SERIKALI GUIDE — Your One Border Stop Post',
          description:
            'Kenya independent regulatory intelligence and procedural desk for expatriate work permits, foreign business registration, NGO compliance, and KRA tax filing.',
          ogImage: 'https://serikaliguide.co.ke/og-image.svg',
          keywords:
            'Kenya government services, work permits Kenya, business registration Kenya, NGO compliance Kenya, KRA tax guide',
        };
      }

      if (key === 'about') {
        return {
          pageKey: 'about',
          title: 'About Our Regulatory Advisory Desk | Serikali Guide Kenya',
          description:
            'Independent regulatory advisory firm operating from Pioneer House, Nairobi CBD. Bridging government compliance for individuals and corporations.',
          ogImage: 'https://serikaliguide.co.ke/og-image.svg',
          keywords:
            'about Serikali Guide, Kenya regulatory advisory, Nairobi corporate consulting',
        };
      }

      if (key === 'blogs') {
        return {
          pageKey: 'blogs',
          title:
            'Kenya Regulatory Briefings & Statutory Playbooks | Serikali Guide',
          description:
            'Stay ahead with authoritative statutory analysis, procedural playbooks, and verified gazetted regulatory updates in Kenya.',
          ogImage: 'https://serikaliguide.co.ke/og-image.svg',
          keywords:
            'Kenya law blogs, regulatory playbooks, immigration guides Kenya, tax updates Kenya',
        };
      }

      if (key === 'contact') {
        return {
          pageKey: 'contact',
          title: 'Contact Our Senior Advisory Desk | Serikali Guide Nairobi',
          description:
            'Get in touch with our senior statutory consultants at Pioneer House, Nairobi CBD. Direct phone, email, WhatsApp, and case filings.',
          ogImage: 'https://serikaliguide.co.ke/og-image.svg',
          keywords:
            'contact Serikali Guide, Nairobi immigration lawyer, Kenya company registration contact',
        };
      }

      if (key === 'consultation') {
        return {
          pageKey: 'consultation',
          title: 'Book Free 20-Minute Regulatory Consultation | Serikali Guide',
          description:
            'Schedule a complimentary 20-minute case evaluation with our statutory specialists. Review eligibility, timelines, and document checklists.',
          ogImage: 'https://serikaliguide.co.ke/og-image.svg',
          keywords:
            'free consultation Kenya, work permit consultation Nairobi, business registration advice Kenya',
        };
      }

      if (key === 'privacy') {
        return {
          pageKey: 'privacy',
          title: 'Privacy & Data Protection Policy | Serikali Guide Kenya',
          description:
            'Compliance with the Kenya Data Protection Act 2019. How your consultation dossiers, contact details, and client data are protected.',
          ogImage: 'https://serikaliguide.co.ke/og-image.svg',
          keywords:
            'privacy policy, Kenya Data Protection Act 2019, ODPC Kenya compliance',
        };
      }

      if (key === 'terms') {
        return {
          pageKey: 'terms',
          title: 'Terms of Use & Statutory Disclaimers | Serikali Guide Kenya',
          description:
            'Terms and conditions of service, statutory disclaimers, intellectual property notices, and legal compliance policies for Serikali Guide.',
          ogImage: 'https://serikaliguide.co.ke/og-image.svg',
          keywords:
            'terms of use, statutory disclaimer Kenya, Serikali Guide legal terms',
        };
      }

      if (key.startsWith('blog:')) {
        const blogId = key.replace('blog:', '');
        const post = rawBlogPosts.find((b) => b.id === blogId);
        if (post) {
          return {
            pageKey: key,
            title: `${post.title} | Serikali Guide Kenya`,
            description: post.excerpt || post.subtitle,
            ogImage: post.image,
            keywords:
              post.keywords?.join(', ') ||
              `${post.categoryName}, ${post.subCategoryName}, Kenya regulations, 2026 statutory guide`,
          };
        }
      }

      if (key.startsWith('service:')) {
        const catId = key.replace('service:', '');
        const cat = rawServiceCategories.find((c) => c.id === catId);
        if (cat) {
          return {
            pageKey: key,
            title: `${cat.name} in Kenya — Official Requirements & Guide | Serikali`,
            description:
              cat.overview || cat.editorialHeadline || cat.heroSubtitle || '',
            ogImage: cat.heroImage,
            keywords: `${cat.name}, ${cat.agency}, Kenya government compliance, official permits Kenya`,
          };
        }
      }

      return {
        pageKey: key,
        title: 'SERIKALI GUIDE — Your One Border Stop Post',
        description:
          'Kenya independent regulatory intelligence and procedural desk for expatriate work permits, foreign business registration, NGO compliance, and KRA tax filing.',
        ogImage: 'https://serikaliguide.co.ke/og-image.svg',
        keywords:
          'Kenya government services, work permits Kenya, business registration Kenya',
      };
    },
    [seoOverrides, rawBlogPosts, rawServiceCategories]
  );

  const updateSeoForPage = (key: string, data: Partial<SeoPageMetadata>) => {
    setSeoOverrides((prev) => {
      const current = prev[key] || getSeoForPage(key);
      const updated: SeoPageMetadata = {
        ...current,
        ...data,
        pageKey: key,
        updatedAt: new Date().toISOString(),
      };
      const next = { ...prev, [key]: updated };
      try {
        localStorage.setItem(
          'serikali_seo_overrides_v1',
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
  };

  const resetSeoForPage = (key: string) => {
    setSeoOverrides((prev) => {
      const next = { ...prev };
      delete next[key];
      try {
        localStorage.setItem(
          'serikali_seo_overrides_v1',
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, JSON.stringify(lang));
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Automatically translate ALL dynamic content (Service Categories, Sub-Categories, Requirements, Steps, Blog Posts, Sections)
  // whenever the user changes the language!
  useEffect(() => {
    let cancelled = false;

    if (language === 'en') {
      setLocalizedCategories(rawServiceCategories);
      setLocalizedBlogs(rawBlogPosts);
      setIsTranslatingContent(false);
      return;
    }

    const translateAllCatalogDetails = async () => {
      setIsTranslatingContent(true);
      try {
        // 1. Translate Service Categories & Sub-Categories first for immediate navigation & service detail pages
        const translatedCats = await Promise.all(
          rawServiceCategories.map(async (cat) => {
            const [
              name,
              shortLabel,
              heroSubtitle,
              editorialHeadline,
              overview,
              subCategories,
            ] = await Promise.all([
              translateSingleText(cat.name, language),
              translateSingleText(cat.shortLabel, language),
              translateSingleText(cat.heroSubtitle || cat.shortLabel, language),
              translateSingleText(cat.editorialHeadline, language),
              translateSingleText(cat.overview || cat.description || '', language),
              Promise.all(
                cat.subCategories.map(async (sub) => {
                  const [
                    subName,
                    summary,
                    timeline,
                    feeNote,
                    statutoryNote,
                    requirements,
                    steps,
                  ] = await Promise.all([
                    translateSingleText(sub.name, language),
                    translateSingleText(sub.summary, language),
                    translateSingleText(sub.timeline, language),
                    translateSingleText(sub.feeNote || '', language),
                    translateSingleText(sub.statutoryNote, language),
                    Promise.all(
                      sub.requirements.map((r) =>
                        translateSingleText(r, language)
                      )
                    ),
                    Promise.all(
                      sub.steps.map(async (s) => {
                        if (typeof s === 'string') {
                          return translateSingleText(s, language);
                        }
                        const [title, detail] = await Promise.all([
                          translateSingleText(s.title, language),
                          translateSingleText(s.detail, language),
                        ]);
                        return { title, detail };
                      })
                    ),
                  ]);
                  return {
                    ...sub,
                    name: subName,
                    summary,
                    timeline,
                    feeNote,
                    statutoryNote,
                    requirements,
                    steps,
                  };
                })
              ),
            ]);

            return {
              ...cat,
              name,
              shortLabel,
              heroSubtitle,
              editorialHeadline,
              overview,
              subCategories,
            };
          })
        );

        if (!cancelled) {
          setLocalizedCategories(translatedCats);
        }

        // 2. Translate Blog Posts (titles, subtitles, excerpts, takeaways, sections)
        const translatedBlogs = await Promise.all(
          rawBlogPosts.map(async (post) => {
            const [
              title,
              subtitle,
              excerpt,
              categoryName,
              subCategoryName,
              readTime,
              keyTakeaways,
              sections,
            ] = await Promise.all([
              translateSingleText(post.title, language),
              translateSingleText(post.subtitle, language),
              translateSingleText(post.excerpt, language),
              translateSingleText(post.categoryName, language),
              translateSingleText(post.subCategoryName, language),
              translateSingleText(post.readTime, language),
              Promise.all(
                post.keyTakeaways.map((kt) => translateSingleText(kt, language))
              ),
              Promise.all(
                post.sections.map(async (sec) => {
                  const [heading, paragraphs, checklist, callout] =
                    await Promise.all([
                      translateSingleText(sec.heading, language),
                      Promise.all(
                        sec.paragraphs.map((p) =>
                          translateSingleText(p, language)
                        )
                      ),
                      sec.checklist
                        ? Promise.all(
                            sec.checklist.map((c) =>
                              translateSingleText(c, language)
                            )
                          )
                        : Promise.resolve(undefined),
                      sec.callout
                        ? translateSingleText(sec.callout, language)
                        : Promise.resolve(undefined),
                    ]);
                  return {
                    ...sec,
                    heading,
                    paragraphs,
                    checklist,
                    callout,
                  };
                })
              ),
            ]);

            return {
              ...post,
              title,
              subtitle,
              excerpt,
              categoryName,
              subCategoryName,
              readTime,
              keyTakeaways,
              sections,
            };
          })
        );

        if (!cancelled) {
          setLocalizedBlogs(translatedBlogs);
          try {
            localStorage.setItem(
              STORAGE_KEYS.TRANSLATION_CACHE,
              JSON.stringify(translationMemory)
            );
          } catch {}
        }
      } finally {
        if (!cancelled) {
          setIsTranslatingContent(false);
        }
      }
    };

    translateAllCatalogDetails();

    return () => {
      cancelled = true;
    };
  }, [language, rawServiceCategories, rawBlogPosts]);

  // Persist raw data changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(rawServiceCategories)
      );
    } catch {}
  }, [rawServiceCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(rawBlogPosts));
    } catch {}
  }, [rawBlogPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CONSULTATIONS,
        JSON.stringify(consultations)
      );
    } catch {}
  }, [consultations]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.INQUIRIES,
        JSON.stringify(inquiries)
      );
    } catch {}
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.DONATIONS,
        JSON.stringify(donations)
      );
    } catch {}
  }, [donations]);

  // Admin Passcode Authentication (Confidential code: 1940)
  const unlockAdmin = (passcode: string): boolean => {
    if (passcode.trim() === '1940') {
      setIsAdminUnlocked(true);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_UNLOCKED, JSON.stringify(true));
      } catch {}
      blogDbService.adminLogin(passcode).catch(() => {});
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_UNLOCKED, JSON.stringify(false));
    } catch {}
    blogDbService.adminLogout();
  };

  // Admin CRUD: Categories & Sub-Categories
  const addServiceCategory = (
    catData: Omit<ServiceCategory, 'id'> & { id?: string }
  ): ServiceCategory => {
    const slugId =
      catData.id ||
      catData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      `cat-${Date.now()}`;
    const created: ServiceCategory = {
      ...catData,
      id: slugId,
      subCategories:
        catData.subCategories && catData.subCategories.length > 0
          ? catData.subCategories
          : [],
    };
    setRawServiceCategories((prev) => {
      const next = [...prev, created];
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'CATEGORIES_SYNC',
        data: next,
      });
      return next;
    });
    setLocalizedCategories((prev) => [...prev, created]);
    saveServiceCategoryToFirestore(created).catch(() => {});
    return created;
  };

  const deleteServiceCategory = (id: string) => {
    setRawServiceCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'CATEGORIES_SYNC',
        data: next,
      });
      return next;
    });
    setLocalizedCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addSubCategory = (
    categoryId: string,
    subData: Omit<SubCategoryDetail, 'id'> & { id?: string }
  ): SubCategoryDetail | null => {
    const subId =
      subData.id ||
      subData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Math.floor(100 + Math.random() * 900);
    const createdSub: SubCategoryDetail = {
      ...subData,
      id: subId,
    };
    const updater = (prev: ServiceCategory[]) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, subCategories: [...c.subCategories, createdSub] }
          : c
      );
    setRawServiceCategories((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'CATEGORIES_SYNC',
        data: next,
      });
      const updatedCat = next.find((c) => c.id === categoryId);
      if (updatedCat) {
        saveServiceCategoryToFirestore(updatedCat).catch(() => {});
      }
      return next;
    });
    setLocalizedCategories(updater);
    return createdSub;
  };

  const deleteSubCategory = (categoryId: string, subId: string) => {
    const updater = (prev: ServiceCategory[]) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subCategories: c.subCategories.filter((s) => s.id !== subId),
            }
          : c
      );
    setRawServiceCategories((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'CATEGORIES_SYNC',
        data: next,
      });
      const updatedCat = next.find((c) => c.id === categoryId);
      if (updatedCat) {
        saveServiceCategoryToFirestore(updatedCat).catch(() => {});
      }
      return next;
    });
    setLocalizedCategories(updater);
  };

  // Blog CRUD (Persistent to Database & Synced with API)
  const addBlogPost = (postData: Partial<BlogPost>): BlogPost => {
    const title = postData.title || 'Untitled Guide';
    const slugBase = postData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created: BlogPost = {
      id: postData.id || `blog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      slug: `${slugBase}`,
      title,
      subtitle: postData.subtitle || '',
      excerpt: postData.excerpt || '',
      categoryId: (postData.categoryId as any) || 'immigration-visas',
      categoryName: postData.categoryName || 'Immigration & Visas',
      subCategoryName: postData.subCategoryName || 'General Guide',
      author: postData.author || 'Serikali Legal & Regulatory Desk',
      authorRole: postData.authorRole || 'Senior Regulatory Specialist',
      publishedDate: postData.publishedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: postData.readTime || '6 min read',
      image: postData.image || '/src/assets/images/serikali_immigration_visas_1790882120216.jpg',
      isTopStory: Boolean(postData.isTopStory),
      isFeatured: Boolean(postData.isFeatured),
      keywords: postData.keywords || [],
      keyTakeaways: postData.keyTakeaways || [],
      officialPortal: postData.officialPortal || 'ecitizen.go.ke',
      sections: postData.sections || (postData.content ? [{ heading: '1. Procedural Requirements & Overview', paragraphs: postData.content.split('\n\n').filter(Boolean) }] : []),
      status: postData.status || 'published',
      tags: postData.tags || postData.keywords || [],
      content: postData.content || '',
      createdAt: postData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seoTitle: postData.seoTitle,
      seoDescription: postData.seoDescription,
    };

    // Update optimistic tracking
    optimisticBlogsRef.current.set(created.id, { blog: created, timestamp: Date.now() });
    recentlyDeletedRef.current.delete(created.id);

    // Update raw state immediately
    setRawBlogPosts((prev) => {
      const next = [created, ...prev.filter((b) => b.id !== created.id)];
      try {
        localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'BLOGS_SYNC',
        data: next,
      });
      return next;
    });

    // Update localized state immediately so front page sees it without delay
    setLocalizedBlogs((prev) => [created, ...prev.filter((b) => b.id !== created.id)]);

    // Save to persistent database & Firestore in parallel
    saveBlogToFirestore(created).catch(() => {});
    blogDbService.createBlog(created).then((persisted) => {
      optimisticBlogsRef.current.delete(created.id);
      setRawBlogPosts((prev) => prev.map((b) => (b.id === created.id ? persisted : b)));
      setLocalizedBlogs((prev) => prev.map((b) => (b.id === created.id ? persisted : b)));
    }).catch((err) => {
      console.warn('Optimistic blog created; background server sync error:', err);
    });

    return created;
  };

  const updateBlogPost = async (id: string, postData: Partial<BlogPost>): Promise<BlogPost | null> => {
    const existing = rawBlogPosts.find((b) => b.id === id);
    if (!existing) return null;

    const updatedOptimistic: BlogPost = {
      ...existing,
      ...postData,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };

    optimisticBlogsRef.current.set(id, { blog: updatedOptimistic, timestamp: Date.now() });

    setRawBlogPosts((prev) => {
      const next = prev.map((b) => (b.id === id ? updatedOptimistic : b));
      try {
        localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'BLOGS_SYNC',
        data: next,
      });
      return next;
    });
    setLocalizedBlogs((prev) => prev.map((b) => (b.id === id ? updatedOptimistic : b)));

    // Synchronize to Firestore
    saveBlogToFirestore(updatedOptimistic).catch(() => {});

    try {
      const persisted = await blogDbService.updateBlog(id, postData);
      optimisticBlogsRef.current.delete(id);
      setRawBlogPosts((prev) => {
        const next = prev.map((b) => (b.id === id ? persisted : b));
        try {
          localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
        } catch {}
        return next;
      });
      setLocalizedBlogs((prev) => prev.map((b) => (b.id === id ? persisted : b)));
      return persisted;
    } catch (err) {
      console.warn('Optimistic blog updated; server sync failed:', err);
      return updatedOptimistic;
    }
  };

  const deleteBlogPost = (id: string) => {
    recentlyDeletedRef.current.set(id, Date.now());
    optimisticBlogsRef.current.delete(id);

    setRawBlogPosts((prev) => {
      const next = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      } catch {}
      const channel = getSerikaliBroadcastChannel();
      channel?.postMessage({
        type: 'BLOGS_SYNC',
        data: next,
      });
      return next;
    });
    setLocalizedBlogs((prev) => prev.filter((b) => b.id !== id));

    // Synchronize deletion to Firestore & Server API
    removeBlogFromFirestore(id).catch(() => {});
    blogDbService.deleteBlog(id).catch((err) => {
      console.warn('Failed to delete blog on server:', err);
    });
  };

  const setBlogPostStatus = async (id: string, status: 'published' | 'draft' | 'unpublished') => {
    await updateBlogPost(id, { status });
  };

  // Consultations CRUD
  const addConsultation = (
    data: Omit<
      ConsultationBooking,
      'id' | 'reference' | 'bookingRef' | 'status' | 'createdAt'
    >
  ): ConsultationBooking => {
    const ref = `SG-CONS-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const created: ConsultationBooking = {
      ...data,
      id: `cons-${Date.now()}`,
      reference: ref,
      bookingRef: ref,
      status: 'Pending Review',
      createdAt: nowStr,
    };
    setConsultations((prev) => [created, ...prev]);
    return created;
  };

  const updateConsultationStatus = (id: string, status: ConsultationStatus) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const deleteConsultation = (id: string) => {
    setConsultations((prev) => prev.filter((c) => c.id !== id));
  };

  // Inquiries CRUD
  const addInquiry = (
    data: Omit<ClientInquiry, 'id' | 'reference' | 'status' | 'createdAt'>
  ): ClientInquiry => {
    const ref = `SG-INQ-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const created: ClientInquiry = {
      ...data,
      id: `inq-${Date.now()}`,
      reference: ref,
      status: 'New',
      createdAt: nowStr,
    };
    setInquiries((prev) => [created, ...prev]);
    return created;
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  const deleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  // Donations CRUD
  const addDonation = (
    data: Omit<BlogDonation, 'id' | 'reference' | 'ref' | 'createdAt'>
  ): BlogDonation => {
    const ref = `SG-DON-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const created: BlogDonation = {
      ...data,
      id: `don-${Date.now()}`,
      reference: ref,
      ref,
      createdAt: nowStr,
    };
    setDonations((prev) => [created, ...prev]);
    return created;
  };

  const resetAllToDefaults = () => {
    setRawServiceCategories(SERVICE_CATEGORIES);
    setRawBlogPosts(BLOG_POSTS);
    setConsultations(INITIAL_CONSULTATIONS);
    setInquiries(INITIAL_INQUIRIES);
    setDonations(INITIAL_DONATIONS);
    setManagedServices(INITIAL_MANAGED_SERVICES);
    setServiceRequests(INITIAL_SERVICE_REQUESTS);
  };

  const t = useMemo(
    () => TRANSLATIONS[language] || TRANSLATIONS.en,
    [language]
  );

  const serviceRegistry = useMemo<RegisteredService[]>(() => {
    const list: RegisteredService[] = [];
    const seenIds = new Set<string>();

    const detailedMapping: Record<
      string,
      { keywords: string[]; intents: string[]; explanation: string }
    > = {
      'passport-lost-replace': {
        keywords: [
          'lost',
          'stolen',
          'misplaced',
          'missing',
          'replacement',
          'replace',
          'abstract',
          'police',
          'affidavit',
          'loss',
          'passport',
          'lost passport',
        ],
        intents: ['lost_passport', 'replace_document', 'stolen_passport'],
        explanation: "Because you've reported a lost passport, this service may be relevant.",
      },
      'passport-renewal': {
        keywords: [
          'renew',
          'renewal',
          'renewing',
          'expired',
          'expiring',
          'validity',
          'pages full',
          'passport',
          'renew passport',
        ],
        intents: ['renew_passport', 'expired_passport'],
        explanation: 'Because your current travel document has expired or is nearing expiration, standard passport renewal applies.',
      },
      'passport-new': {
        keywords: [
          'first time',
          'new',
          'fresh',
          'apply',
          'applying',
          'birth certificate',
          'first passport',
          'passport',
        ],
        intents: ['new_passport', 'apply_first_passport'],
        explanation: 'First-time passport issuance for citizens who have not previously held a travel document.',
      },
      'work-permit-class-d': {
        keywords: [
          'work',
          'permit',
          'employment',
          'job',
          'hire',
          'hiring',
          'expatriate',
          'foreign worker',
          'class d',
          'understudy',
        ],
        intents: ['work_permit', 'hire_expatriate', 'work_in_kenya'],
        explanation: 'For expatriate employment in Kenya with a registered Kenyan understudy.',
      },
      'work-permit-class-g': {
        keywords: [
          'invest',
          'investor',
          'capital',
          'business permit',
          'entrepreneur',
          'commercial',
          'class g',
        ],
        intents: ['investor_permit', 'invest_in_kenya'],
        explanation: 'For foreign investors establishing commercial trade with capital investment ($100k+).',
      },
      'special-pass': {
        keywords: [
          'special pass',
          'short term',
          'consultant',
          'temporary',
          'emergency',
          'pass',
          'interim',
        ],
        intents: ['temporary_work', 'special_pass'],
        explanation: 'For temporary professional assignments under 6 months.',
      },
      'eta-visa': {
        keywords: [
          'visa',
          'visas',
          'eta',
          'travel',
          'tourism',
          'tourist',
          'holiday',
          'entry',
          'visitor',
          'travel to kenya',
        ],
        intents: ['tourist_visa', 'travel_to_kenya', 'kenya_eta'],
        explanation: 'All international travelers visiting Kenya must hold a valid electronic Travel Authorisation (eTA).',
      },
      'company-registration': {
        keywords: [
          'company',
          'business',
          'incorporate',
          'incorporation',
          'ltd',
          'limited',
          'brs',
          'cr12',
          'register company',
        ],
        intents: ['register_company', 'start_business'],
        explanation: 'Private Limited Company registration via the Business Registration Service (BRS).',
      },
      'ngo-registration': {
        keywords: [
          'ngo',
          'nonprofit',
          'charity',
          'foundation',
          'cbo',
          'pbo',
          'ngo board',
        ],
        intents: ['register_ngo', 'start_charity'],
        explanation: 'Statutory gazettement from the NGO Co-ordination Board.',
      },
      'tax-compliance': {
        keywords: [
          'tax',
          'kra',
          'tcc',
          'compliance',
          'pin',
          'tax clearance',
          'returns',
          'itax',
        ],
        intents: ['tax_compliance', 'get_tcc'],
        explanation: 'Official KRA Tax Compliance Certificate proving tax obligations are in good standing.',
      },
    };

    // 1. Detailed primary services
    Object.entries(DETAILED_SERVICE_RESULTS).forEach(([id, detail]) => {
      const meta = detailedMapping[id] || {
        keywords: [detail.serviceName.toLowerCase()],
        intents: [id],
        explanation: detail.whyThisService,
      };

      seenIds.add(id);
      list.push({
        id,
        serviceId: detail.serviceId,
        subCategoryId: detail.subCategoryId,
        categoryId: detail.categoryId,
        serviceName: detail.serviceName,
        categoryName: detail.categoryName,
        summary: detail.summary,
        officialPortal: detail.officialPortal,
        estimatedTimeline: detail.estimatedTimeline,
        statutoryFeeNote: detail.statutoryFeeNote,
        keywords: meta.keywords,
        intents: meta.intents,
        requirements: detail.requirements,
        explanationTemplate: meta.explanation,
      });
    });

    // 2. Extend with all categories & subcategories from serviceCategories
    const currentCats = language === 'en' ? rawServiceCategories : localizedCategories;
    currentCats.forEach((cat) => {
      cat.subCategories.forEach((sub) => {
        const uniqueKey = `${cat.id}__${sub.id}`;
        if (!seenIds.has(uniqueKey)) {
          seenIds.add(uniqueKey);
          list.push({
            id: uniqueKey,
            serviceId: sub.id,
            subCategoryId: sub.id,
            categoryId: cat.id,
            serviceName: sub.name,
            categoryName: cat.name,
            summary: sub.summary,
            officialPortal: sub.portal,
            estimatedTimeline: sub.timeline,
            statutoryFeeNote: sub.statutoryNote,
            keywords: [
              ...sub.name.toLowerCase().split(/\s+/),
              cat.name.toLowerCase(),
              sub.id,
            ],
            intents: [sub.id, cat.id],
            requirements: (sub.requirements || []).map((req, idx) => ({
              id: `req-${sub.id}-${idx}`,
              label: req,
              isMandatory: true,
            })),
            explanationTemplate: `Official procedure for ${sub.name} via ${sub.portal}.`,
          });
        }
      });
    });

    return list;
  }, [language, rawServiceCategories, localizedCategories]);

  const activeCategories =
    language === 'en' ? rawServiceCategories : localizedCategories;

  const mapQueryToServices = useCallback(
    (query: string): IntentMatchResult => {
      return mapNaturalLanguageToServices(query, serviceRegistry, activeCategories);
    },
    [serviceRegistry, activeCategories]
  );

  const contextMapNaturalLanguageToServices = useCallback(
    (
      query: string,
      customRegistry?: RegisteredService[],
      customCategories?: ServiceCategory[]
    ): IntentMatchResult => {
      return mapNaturalLanguageToServices(
        query,
        customRegistry || serviceRegistry,
        customCategories || activeCategories
      );
    },
    [serviceRegistry, activeCategories]
  );

  return (
    <SerikaliContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTranslatingContent,
        serviceCategories: activeCategories,
        serviceRegistry,
        blogPosts: language === 'en' ? rawBlogPosts : localizedBlogs,
        consultations,
        inquiries,
        donations,
        seoOverrides,
        updateSeoForPage,
        resetSeoForPage,
        getSeoForPage,
        isAdminUnlocked,
        unlockAdmin,
        lockAdmin,
        addServiceCategory,
        deleteServiceCategory,
        addSubCategory,
        deleteSubCategory,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        setBlogPostStatus,
        reloadBlogs,
        isBlogsLoading,
        addConsultation,
        updateConsultationStatus,
        deleteConsultation,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        addDonation,
        managedServices,
        updateServicePricing,
        addManagedService,
        deleteManagedService,
        serviceRequests,
        submitServiceRequest,
        updateServiceRequestStatus,
        deleteServiceRequest,
        newsletterSubscribers,
        addNewsletterSubscriber,
        removeNewsletterSubscriber,
        updateNewsletterSubscriber,
        sendNewsletterBroadcast,
        isGetStartedOpen,
        openGetStarted,
        closeGetStarted,
        getStartedPreselectedServiceId,
        isTrackModalOpen,
        openTrackModal,
        closeTrackModal,
        trackModalPreselectedRef,
        mapQueryToServices,
        mapNaturalLanguageToServices: contextMapNaturalLanguageToServices,
        resetAllToDefaults,
      }}
    >
      {children}
    </SerikaliContext.Provider>
  );
};

export const useSerikali = (): SerikaliContextValue => {
  const ctx = useContext(SerikaliContext);
  if (!ctx) {
    throw new Error('useSerikali must be used within a SerikaliProvider');
  }
  return ctx;
};
