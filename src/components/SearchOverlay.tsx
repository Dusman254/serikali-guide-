import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
  Clock,
  ShieldCheck,
  BookOpen,
  FileCheck2,
  Tag,
  FileText,
  Building,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  useSerikali,
  RegisteredService,
  IntentMatchResult,
  tokenizeInput,
  mapNaturalLanguageToServices as contextMapNaturalLanguageToServices,
} from '../context/SerikaliContext';
import { useServiceJourney } from '../context/ServiceJourneyContext';
import {
  ServiceCategoryId,
  SubCategoryDetail,
  BlogPost,
} from '../data/serikaliData';

// Re-export for any external callers or unit tests
export type { IntentMatchResult };
export { tokenizeInput };

/**
 * Natural language mapping function using SerikaliContext service registry.
 */
export function mapNaturalLanguageToServices(
  rawQuery: string,
  registry: RegisteredService[] = []
): IntentMatchResult {
  return contextMapNaturalLanguageToServices(rawQuery, registry);
}

const QUICK_NL_CHIPS = [
  'I lost my passport',
  'How do I renew my passport?',
  'I need a work permit',
  'Short term consultant special pass',
  'Apply for tourist eTA',
  'Register a private company',
  'NGO registration in Kenya',
  'Tax compliance certificate',
  'Dependent pass for family',
];

export interface SearchOverlayProps {
  searchQuery?: string;
  initialQuery?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSelectService?: (service: RegisteredService) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  searchQuery: propQuery,
  initialQuery,
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSelectService,
}) => {
  const {
    isSearchOpen: storeIsOpen,
    setIsSearchOpen,
    searchQuery: storeQuery,
    setSearchQuery,
    navigate,
  } = useStore();

  const {
    serviceRegistry,
    blogPosts,
    serviceCategories,
    openGetStarted,
    mapQueryToServices,
    mapNaturalLanguageToServices: contextMapServices,
  } = useSerikali();
  const { startServiceJourney } = useServiceJourney();

  const isVisible =
    propIsOpen !== undefined
      ? propIsOpen
      : propQuery !== undefined
      ? true
      : storeIsOpen;

  const [internalQuery, setInternalQuery] = useState(
    propQuery ?? initialQuery ?? storeQuery
  );

  useEffect(() => {
    if (propQuery !== undefined) {
      setInternalQuery(propQuery);
    }
  }, [propQuery]);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setInternalQuery(initialQuery);
      setSearchQuery(initialQuery);
    }
  }, [initialQuery, setSearchQuery]);

  useEffect(() => {
    if (propQuery === undefined && initialQuery === undefined) {
      setInternalQuery(storeQuery);
    }
  }, [storeQuery, propQuery, initialQuery]);

  const activeQuery = propQuery !== undefined ? propQuery : internalQuery;

  const handleQueryChange = (val: string) => {
    setInternalQuery(val);
    setSearchQuery(val);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId | 'all'>('all');

  // Focus input on open
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isVisible]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K to open, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, setIsSearchOpen]);

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setIsSearchOpen(false);
    }
  };

  const cleanQuery = activeQuery.trim();
  const queryTokens = useMemo(() => tokenizeInput(cleanQuery), [cleanQuery]);

  // 1. Natural language mapping function using SerikaliContext service registry and category relevance
  const matchResult = useMemo<IntentMatchResult>(() => {
    if (contextMapServices) {
      return contextMapServices(cleanQuery, serviceRegistry, serviceCategories);
    }
    if (mapQueryToServices) {
      return mapQueryToServices(cleanQuery);
    }
    return mapNaturalLanguageToServices(cleanQuery, serviceRegistry);
  }, [cleanQuery, contextMapServices, mapQueryToServices, serviceRegistry, serviceCategories]);

  // 2. Filtered matching procedural guides from serviceCategories
  const matchedSubCategories = useMemo(() => {
    if (!cleanQuery && selectedCategory === 'all') return [];

    const results: Array<{
      category: typeof serviceCategories[0];
      subCategory: SubCategoryDetail;
      relevanceScore: number;
    }> = [];

    const activeCategories =
      selectedCategory === 'all'
        ? serviceCategories
        : serviceCategories.filter((c) => c.id === selectedCategory);

    activeCategories.forEach((cat) => {
      cat.subCategories.forEach((sub) => {
        if (!cleanQuery) {
          results.push({ category: cat, subCategory: sub, relevanceScore: 1 });
          return;
        }

        const nameLower = sub.name.toLowerCase();
        const summaryLower = sub.summary.toLowerCase();
        const portalLower = (sub.portal || '').toLowerCase();
        const reqsLower = (sub.requirements || []).join(' ').toLowerCase();
        const noteLower = (sub.statutoryNote || '').toLowerCase();
        const haystack = `${nameLower} ${summaryLower} ${portalLower} ${reqsLower} ${noteLower} ${cat.name.toLowerCase()}`;

        const matchesAll = queryTokens.every((token) => haystack.includes(token));
        const matchesAny = queryTokens.some((token) => haystack.includes(token));

        if (matchesAll || matchesAny) {
          let score = 0;
          if (nameLower.includes(cleanQuery.toLowerCase())) score += 10;
          if (matchesAll) score += 5;
          if (matchesAny) score += 2;
          results.push({ category: cat, subCategory: sub, relevanceScore: score });
        }
      });
    });

    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results;
  }, [serviceCategories, cleanQuery, queryTokens, selectedCategory]);

  // 3. Filtered matching blog articles
  const matchedArticles = useMemo(() => {
    if (!cleanQuery) return [];

    return blogPosts
      .filter((post) => {
        if (selectedCategory !== 'all' && post.categoryId !== selectedCategory) {
          return false;
        }
        const haystack = `${post.title} ${post.subtitle} ${post.excerpt} ${post.keywords.join(' ')} ${post.categoryName}`.toLowerCase();
        return queryTokens.some((token) => haystack.includes(token));
      })
      .slice(0, 4);
  }, [blogPosts, queryTokens, selectedCategory, cleanQuery]);

  const handleResetSearch = () => {
    handleQueryChange('');
    setSelectedCategory('all');
    inputRef.current?.focus();
  };

  const handleViewService = (service: RegisteredService) => {
    handleClose();
    if (onSelectService) {
      onSelectService(service);
    } else {
      navigate({
        page: 'service-detail',
        serviceId: service.categoryId as ServiceCategoryId,
        subCategoryId: service.subCategoryId,
      });
    }
  };

  const handleViewSubCategory = (categoryId: ServiceCategoryId, subCategoryId: string) => {
    handleClose();
    navigate({
      page: 'service-detail',
      serviceId: categoryId,
      subCategoryId,
    });
  };

  const handleStartService = (service: RegisteredService) => {
    handleClose();
    // Map to PersonalizedServiceResult for journey context
    startServiceJourney({
      serviceId: service.serviceId,
      subCategoryId: service.subCategoryId,
      categoryId: service.categoryId as ServiceCategoryId,
      serviceName: service.serviceName,
      categoryName: service.categoryName,
      summary: service.summary,
      whyThisService: service.explanationTemplate || service.summary,
      officialPortal: service.officialPortal,
      estimatedTimeline: service.estimatedTimeline,
      statutoryFeeNote: service.statutoryFeeNote,
      requirements: service.requirements.map((r) => ({
        id: r.id,
        label: r.label,
        isMandatory: r.isMandatory,
        whyNeeded: r.whyNeeded || 'Statutory requirement for verification.',
        whatCounts: r.whatCounts || 'Official certified document.',
        commonMistakes: r.commonMistakes || 'Uncertified copies or missing signatures.',
      })),
      nextSteps: [
        { number: 1, title: 'Document Verification', description: 'Compile required original documents and certified copies.' },
        { number: 2, title: 'Portal Filing', description: `Submit statutory forms via ${service.officialPortal}.` },
        { number: 3, title: 'Appointment & Processing', description: 'Attend verification appointment and track issuance.' },
      ],
    });
  };

  const handleOpenGetStarted = (serviceId?: string) => {
    handleClose();
    openGetStarted(serviceId);
  };

  if (!isVisible) return null;

  const bestMatch = matchResult.bestMatch;
  const relatedSuggestions = matchResult.relatedSuggestions;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Serikali Immigration & Government Services"
      className="fixed inset-0 z-50 bg-[#F4F3EF]/98 backdrop-blur-xl overflow-y-auto"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8 min-h-screen flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#141413]/12">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D94E34]" />
            <span className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#6E6D68] font-medium">
              SERIKALI GUIDE · IMMIGRATION SERVICES SMART SEARCH
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {cleanQuery && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="flex items-center gap-1.5 text-xs font-mono-num uppercase tracking-wider text-[#D94E34] hover:opacity-80 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#141413]/20 text-xs font-mono-num uppercase tracking-[0.16em] text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
            >
              <span>Esc</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Natural Language Search Input Bar */}
        <div className="py-6 sm:py-8 border-b border-[#141413]/15">
          <div className="flex items-center gap-3 sm:gap-4">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#D94E34] shrink-0 stroke-[1.75]" />
            <input
              ref={inputRef}
              type="text"
              value={activeQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="What do you need help with? e.g. 'I lost my passport', 'renew work permit'..."
              className="w-full bg-transparent font-editorial text-xl sm:text-3xl md:text-4xl text-[#141413] placeholder:text-[#8E8D87] focus:outline-none"
            />
            {cleanQuery && (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                className="px-3 py-1.5 bg-[#EAE9E4] text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Intent Query Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] mr-1">
              Try searching:
            </span>
            {QUICK_NL_CHIPS.map((chip) => {
              const isSelected = cleanQuery.toLowerCase() === chip.toLowerCase();
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    handleQueryChange(chip);
                    inputRef.current?.focus();
                  }}
                  className={`px-2.5 py-1 text-[11px] font-mono-num transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#141413] text-[#F4F3EF] border-[#141413] shadow-xs'
                      : 'bg-[#EAE9E4]/80 hover:bg-[#EAE9E4] text-[#141413] border-[#141413]/12 hover:border-[#141413]/40'
                  }`}
                >
                  &ldquo;{chip}&rdquo;
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter Pills Bar */}
        <div className="py-4 border-b border-[#141413]/10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] mr-2 shrink-0">
              Department:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-mono-num uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                  : 'bg-[#EAE9E4]/60 text-[#5E5D59] border-[#141413]/12 hover:text-[#141413]'
              }`}
            >
              All Departments
            </button>
            {serviceCategories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(active ? 'all' : cat.id)}
                  className={`px-3 py-1 text-xs font-mono-num uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer border ${
                    active
                      ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                      : 'bg-[#EAE9E4]/60 text-[#5E5D59] border-[#141413]/12 hover:text-[#141413]'
                  }`}
                >
                  {cat.shortLabel || cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results Area */}
        <div className="py-6 sm:py-8 flex-1">
          {cleanQuery && bestMatch ? (
            <div className="space-y-8">
              {/* ===============================================================
                  1. BEST MATCH SERVICE CARD (Displayed First as Requested)
                 =============================================================== */}
              <div className="bg-[#EAE9E4]/50 border-2 border-[#141413] p-5 sm:p-7 shadow-[0_8px_30px_rgba(20,20,19,0.06)] relative overflow-hidden">
                {/* Accent Header Stripe */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#D94E34]" />

                {/* Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D94E34] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-widest font-semibold">
                      <Sparkles className="w-3 h-3 fill-current" />
                      BEST MATCH
                    </span>
                    <span className="text-[11px] font-mono-num uppercase tracking-wider text-[#1F6F43] font-semibold bg-[#1F6F43]/10 px-2 py-0.5 border border-[#1F6F43]/20">
                      Primary Intent Match
                    </span>
                    {matchResult.identifiedKeywords.length > 0 && (
                      <span className="text-[10px] font-mono-num text-[#6E6D68] hidden sm:inline">
                        Matched: {matchResult.identifiedKeywords.join(' + ')}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono-num text-[#6E6D68]">
                    {bestMatch.categoryName}
                  </span>
                </div>

                {/* Service Name — E.g., 'Passport Replacement' when searching 'lost passport' */}
                <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-[#141413] mb-2 font-medium">
                  {bestMatch.serviceName}
                </h3>

                {/* Tailored Intent Explanation Callout */}
                <div className="my-3.5 p-3.5 bg-[#F4F3EF] border-l-3 border-[#D94E34] text-xs sm:text-sm text-[#141413] leading-relaxed">
                  <p className="font-medium italic">
                    &ldquo;{matchResult.explanation}&rdquo;
                  </p>
                </div>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-[#5E5D59] leading-relaxed mb-4 max-w-4xl">
                  {bestMatch.summary}
                </p>

                {/* Statutory Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-t border-b border-[#141413]/10 my-4 text-xs font-mono-num">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase text-[#6E6D68] block">
                      Official Portal
                    </span>
                    <span className="text-[#141413] font-medium truncate block">
                      {bestMatch.officialPortal}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase text-[#6E6D68] block">
                      Estimated Processing
                    </span>
                    <span className="text-[#141413] font-medium truncate block">
                      {bestMatch.estimatedTimeline}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase text-[#6E6D68] block">
                      Statutory Fees
                    </span>
                    <span className="text-[#141413] font-medium truncate block">
                      {bestMatch.statutoryFeeNote || 'Determined by statutory schedule'}
                    </span>
                  </div>
                </div>

                {/* Key Requirements Checklist Preview */}
                {bestMatch.requirements && bestMatch.requirements.length > 0 && (
                  <div className="mb-5">
                    <span className="text-[10px] font-mono-num uppercase tracking-[0.18em] text-[#6E6D68] block mb-2 font-medium">
                      Key Required Documents ({bestMatch.requirements.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {bestMatch.requirements.slice(0, 3).map((req) => (
                        <div
                          key={req.id}
                          className="flex items-start gap-2 p-2 bg-[#F4F3EF] border border-[#141413]/10 text-xs text-[#141413]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6F43] shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-tight">
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleViewService(bestMatch)}
                    className="px-5 py-3 bg-[#141413] text-[#F4F3EF] hover:bg-[#2B2B28] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                  >
                    <span>View Requirements</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartService(bestMatch)}
                    className="px-5 py-3 bg-[#D94E34] text-[#F4F3EF] hover:bg-[#BF3E26] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Start Service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenGetStarted(bestMatch.id)}
                    className="px-4 py-3 border border-[#141413]/25 hover:border-[#141413] text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-[#D94E34]" />
                    <span>Apply With Guidance</span>
                  </button>
                </div>
              </div>

              {/* ===============================================================
                  2. RELATED SERVICE CATEGORIES (Follows Best Match Card as requested)
                 =============================================================== */}
              {matchResult.relatedCategories && matchResult.relatedCategories.length > 0 && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between border-b border-[#141413]/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D94E34]" />
                      <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#141413] font-semibold">
                        Related Service Categories
                      </p>
                    </div>
                    <span className="text-[11px] font-mono-num text-[#6E6D68]">
                      {matchResult.relatedCategories.length} official departments
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matchResult.relatedCategories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-[#F4F3EF] border border-[#141413]/16 hover:border-[#141413] p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md group"
                      >
                        <div>
                          {/* Agency Header Badge */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#D94E34] font-semibold">
                              {category.shortLabel || category.name}
                            </span>
                            <span className="text-[10px] font-mono-num text-[#6E6D68] bg-[#EAE9E4] px-2 py-0.5 border border-[#141413]/10">
                              {category.subCategories.length} Services
                            </span>
                          </div>

                          {/* Category Name */}
                          <h4 className="font-editorial text-xl sm:text-2xl text-[#141413] mb-2 font-medium group-hover:underline">
                            {category.name}
                          </h4>

                          {/* Overview / Subtitle */}
                          <p className="text-xs text-[#5E5D59] line-clamp-2 leading-relaxed mb-4">
                            {category.overview || category.heroSubtitle}
                          </p>

                          {/* Top Sub-Category Checklist Chips */}
                          <div className="space-y-1.5 mb-4">
                            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#8E8D87] block">
                              Available Services:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {category.subCategories.slice(0, 3).map((sub) => (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSubCategory(category.id, sub.id);
                                  }}
                                  className="text-[11px] font-mono-num px-2 py-0.5 bg-[#EAE9E4] hover:bg-[#141413] text-[#141413] hover:text-[#F4F3EF] border border-[#141413]/10 transition-colors cursor-pointer text-left truncate max-w-[200px]"
                                  title={sub.name}
                                >
                                  {sub.name}
                                </button>
                              ))}
                              {category.subCategories.length > 3 && (
                                <span className="text-[10px] font-mono-num text-[#6E6D68] self-center">
                                  +{category.subCategories.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Category Action CTA */}
                        <div className="pt-3 border-t border-[#141413]/10 flex items-center justify-between">
                          <span className="text-[10px] font-mono-num text-[#6E6D68] truncate max-w-[160px]">
                            {category.agencyBadge || 'GOVT PORTAL'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleClose();
                              navigate({
                                page: 'service-subcategories',
                                serviceId: category.id,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold hover:text-[#D94E34] cursor-pointer"
                          >
                            <span>Explore Category</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===============================================================
                  3. RELATED SERVICE SUGGESTIONS (Followed immediately after)
                 =============================================================== */}
              {relatedSuggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#6E6D68] font-medium">
                      Related Service Suggestions
                    </p>
                    <span className="text-[11px] font-mono-num text-[#6E6D68]">
                      {relatedSuggestions.length} alternative options
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedSuggestions.map((alt) => (
                      <div
                        key={alt.id}
                        className="bg-[#EAE9E4]/60 border border-[#141413]/15 p-4 sm:p-5 flex flex-col justify-between hover:border-[#141413] transition-colors"
                      >
                        <div>
                          <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] block mb-1">
                            {alt.categoryName}
                          </span>
                          <h4 className="font-editorial text-lg text-[#141413] mb-1.5 font-medium">
                            {alt.serviceName}
                          </h4>
                          <p className="text-xs text-[#5E5D59] line-clamp-2 leading-relaxed mb-3">
                            {alt.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#141413]/10 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono-num text-[#6E6D68] truncate">
                            {alt.estimatedTimeline}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleViewService(alt)}
                            className="inline-flex items-center gap-1 text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:text-[#D94E34] cursor-pointer"
                          >
                            <span>View Service</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===============================================================
                  3. MATCHING DIRECT PROCEDURAL SUB-CATEGORIES
                 =============================================================== */}
              {matchedSubCategories.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#141413]/10">
                  <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#6E6D68] font-medium">
                    All Matching Procedural Guides ({matchedSubCategories.length})
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matchedSubCategories.slice(0, 6).map(({ category, subCategory }) => (
                      <div
                        key={`${category.id}-${subCategory.id}`}
                        className="bg-[#F4F3EF] border border-[#141413]/12 p-4 hover:border-[#141413]/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                              {category.shortLabel || category.name}
                            </span>
                            <span className="text-[10px] font-mono-num text-[#1F6F43]">
                              {subCategory.timeline}
                            </span>
                          </div>
                          <h4 className="font-editorial text-base text-[#141413] mb-1.5 font-medium">
                            {subCategory.name}
                          </h4>
                          <p className="text-xs text-[#5E5D59] line-clamp-2 leading-relaxed mb-3">
                            {subCategory.summary}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#141413]/8 flex items-center justify-between text-xs font-mono-num">
                          <span className="text-[10px] text-[#6E6D68] truncate max-w-[150px]">
                            {subCategory.portal}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleViewSubCategory(category.id, subCategory.id)}
                            className="text-[#141413] hover:text-[#D94E34] font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Guide</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===============================================================
                  4. MATCHING EDITORIAL BLOG ARTICLES
                 =============================================================== */}
              {matchedArticles.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#141413]/10">
                  <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#6E6D68] font-medium">
                    Related Procedural Articles ({matchedArticles.length})
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedArticles.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => {
                          handleClose();
                          navigate({ page: 'blog-detail', blogId: article.id });
                        }}
                        className="text-left p-3.5 bg-[#EAE9E4]/50 border border-[#141413]/12 hover:border-[#141413] transition-colors flex items-start gap-3 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4 text-[#D94E34] shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] mb-0.5">
                            <span>{article.categoryName}</span>
                            <span>·</span>
                            <span>{article.readTime}</span>
                          </div>
                          <h5 className="text-sm font-editorial text-[#141413] line-clamp-1 font-semibold">
                            {article.title}
                          </h5>
                          <p className="text-xs text-[#5E5D59] line-clamp-1 mt-0.5">
                            {article.excerpt}
                          </p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6D68] shrink-0 self-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : cleanQuery ? (
            /* No direct results state */
            <div className="py-12 px-6 text-center border border-[#141413]/15 bg-[#EAE9E4]/40 max-w-2xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#141413]/5 flex items-center justify-center mx-auto text-[#6E6D68]">
                <Search className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-editorial text-2xl text-[#141413]">
                No exact match found for &ldquo;{cleanQuery}&rdquo;
              </h4>
              <p className="text-xs sm:text-sm text-[#5E5D59] leading-relaxed">
                Try describing what you need in plain English — for example:
                &ldquo;I lost my passport&rdquo;, &ldquo;Class D work permit&rdquo;, or &ldquo;Register a company&rdquo;.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-4 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
                >
                  Clear Search
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenGetStarted()}
                  className="px-4 py-2 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Start Service Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty state (No query typed yet): Welcome guide & Popular Pathways */
            <div className="space-y-8">
              <div className="bg-[#EAE9E4]/40 border border-[#141413]/12 p-6 sm:p-8">
                <div className="max-w-2xl">
                  <span className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#D94E34] font-semibold block mb-1">
                    SMART NATURAL LANGUAGE SEARCH
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#141413] mb-2">
                    Tell us what you need in plain English
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5E5D59] leading-relaxed">
                    You don&rsquo;t need to know the official bureaucratic name or statutory category.
                    Simply describe your situation, such as <strong className="text-[#141413]">&ldquo;I lost my passport&rdquo;</strong>,{' '}
                    <strong className="text-[#141413]">&ldquo;I need a work permit for a foreign engineer&rdquo;</strong>, or{' '}
                    <strong className="text-[#141413]">&ldquo;How do I register an NGO?&rdquo;</strong> — and Serikali Guide will immediately map you to the correct official procedure, requirements checklist, and application portal.
                  </p>
                </div>
              </div>

              {/* Popular Service Pathways */}
              <div>
                <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#6E6D68] mb-3 font-medium">
                  Popular Immigration & Government Service Inquiries
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      label: 'I lost my passport',
                      category: 'Government Documents',
                      subTitle: 'Lost passport gazetting, police abstract & replacement',
                    },
                    {
                      label: 'How do I renew my passport?',
                      category: 'Government Documents',
                      subTitle: 'Statutory renewal of expired 34/50/66 page Kenyan e-Passport',
                    },
                    {
                      label: 'I need a work permit',
                      category: 'Immigration & Visas',
                      subTitle: 'Class D employment authorization for expatriates & understudies',
                    },
                    {
                      label: 'Short term consultant special pass',
                      category: 'Immigration & Visas',
                      subTitle: 'Temporary work authorization for assignments up to 6 months',
                    },
                    {
                      label: 'Apply for tourist eTA',
                      category: 'Immigration & Visas',
                      subTitle: 'Kenya electronic Travel Authorisation entry clearance',
                    },
                    {
                      label: 'Tax compliance certificate',
                      category: 'Tax & Compliance',
                      subTitle: 'KRA Tax Compliance Certificate (TCC) verification',
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.label);
                        inputRef.current?.focus();
                      }}
                      className="text-left p-4 bg-[#F4F3EF] border border-[#141413]/12 hover:border-[#141413] transition-colors flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68] block mb-1">
                          {item.category}
                        </span>
                        <h4 className="font-editorial text-base text-[#141413] font-medium group-hover:text-[#D94E34] transition-colors mb-1">
                          &ldquo;{item.label}&rdquo;
                        </h4>
                        <p className="text-xs text-[#5E5D59] line-clamp-2">
                          {item.subTitle}
                        </p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-[#141413]/8 flex items-center justify-between text-xs font-mono-num text-[#6E6D68]">
                        <span>Map Service</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Information */}
        <div className="pt-4 border-t border-[#141413]/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-num text-[#6E6D68]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1F6F43]" />
            <span>Official Procedures · Republic of Kenya Directorate of Immigration Services & eCitizen</span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenGetStarted()}
            className="flex items-center gap-1.5 text-[#D94E34] hover:underline cursor-pointer font-medium"
          >
            <span>Start Guided Application →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
