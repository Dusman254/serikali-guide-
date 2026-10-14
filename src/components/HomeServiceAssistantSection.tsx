import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import { useServiceJourney } from '../context/ServiceJourneyContext';
import { matchServiceByNaturalLanguage } from '../data/serviceKnowledgeBase';
import { PersonalizedServiceResult } from '../types/serviceAssistant';
import {
  synthesizeSuperIntelligence,
  AiProblemSolution,
  AiCallToAction,
} from '../services/aiSearchIntelligence';

export const HomeServiceAssistantSection: React.FC = () => {
  const { navigate } = useStore();
  const { openGetStarted, blogPosts, serviceCategories, serviceRegistry } = useSerikali();
  const { startServiceJourney } = useServiceJourney();

  const [query, setQuery] = useState('');
  const [aiSolution, setAiSolution] = useState<AiProblemSolution | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{
    bestMatch: PersonalizedServiceResult;
    confidence: 'high' | 'medium' | 'low';
    explanation: string;
    otherPossibilities: PersonalizedServiceResult[];
  } | null>(null);

  const runIntelligenceSearch = async (targetQuery: string) => {
    const clean = targetQuery.trim();
    if (!clean) return;

    // 1. Instant local synthesis reading live blogs and services
    const solution = synthesizeSuperIntelligence(clean, blogPosts, serviceCategories);
    setAiSolution(solution);

    // Also run standard service match
    const match = matchServiceByNaturalLanguage(clean);
    setSearchResult(match);

    // 2. Background async query to server AI endpoint
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/search-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.solutionOverview || data.answer)) {
          setAiSolution((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              diagnosisTitle: data.problemIdentified || prev.diagnosisTitle,
              summaryOverview: data.solutionOverview || data.answer || prev.summaryOverview,
              immediateActionSteps:
                Array.isArray(data.whatToDoSteps) && data.whatToDoSteps.length > 0
                  ? data.whatToDoSteps.map((s: any) => ({
                      stepNumber: s.stepNumber,
                      title: s.title,
                      detail: s.detail,
                      isUrgent: s.isUrgent,
                    }))
                  : prev.immediateActionSteps,
              followUpQuestions:
                Array.isArray(data.followUpQuestions) && data.followUpQuestions.length > 0
                  ? data.followUpQuestions
                  : prev.followUpQuestions,
              isAiEnhanced: true,
            };
          });
        }
      }
    } catch {
      // Fallback seamlessly to local synthesis
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    runIntelligenceSearch(query);
  };

  const handleQuickServiceClick = (promptQuery: string) => {
    setQuery(promptQuery);
    runIntelligenceSearch(promptQuery);
  };

  const handleExecuteCta = (cta: AiCallToAction) => {
    if (cta.actionType === 'start-service') {
      const targetServiceId = cta.payload.serviceId || 'passport-lost-replace';
      const svc = serviceRegistry.find(
        (s) => s.id === targetServiceId || s.serviceId === targetServiceId
      );
      if (svc) {
        startServiceJourney({
          serviceId: svc.serviceId,
          subCategoryId: svc.subCategoryId,
          categoryId: svc.categoryId as any,
          serviceName: svc.serviceName,
          categoryName: svc.categoryName,
          summary: svc.summary,
          whyThisService: svc.explanationTemplate || svc.summary,
          officialPortal: svc.officialPortal,
          estimatedTimeline: svc.estimatedTimeline,
          statutoryFeeNote: svc.statutoryFeeNote,
          requirements: svc.requirements.map((r) => ({
            id: r.id,
            label: r.label,
            isMandatory: r.isMandatory,
            whyNeeded: (r as any).whyNeeded || 'Statutory requirement for verification.',
            whatCounts: (r as any).whatCounts || 'Official certified document.',
            commonMistakes: (r as any).commonMistakes || 'Uncertified copies or missing signatures.',
          })),
          nextSteps: [
            { number: 1, title: 'Document Verification', description: 'Assemble original documents.' },
            { number: 2, title: 'Portal Filing', description: `Submit on ${svc.officialPortal}.` },
            { number: 3, title: 'Appointment & Processing', description: 'Complete biometrics.' },
          ],
        });
      } else {
        openGetStarted(targetServiceId);
      }
    } else if (cta.actionType === 'open-blog') {
      if (cta.payload.blogId) {
        navigate({ page: 'blog-detail', blogId: cta.payload.blogId });
      } else {
        navigate({ page: 'blogs', categoryId: 'all' });
      }
    } else if (cta.actionType === 'get-started') {
      openGetStarted(cta.payload.topic);
    } else if (cta.actionType === 'consultation') {
      navigate({ page: 'contact' });
    }
  };

  return (
    <section className="bg-[#EAE9E4] border-b border-[#141413]/12 py-10 sm:py-14 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141413] text-[#F4F3EF] rounded-full text-[10px] font-mono-num uppercase tracking-widest font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D94E34] fill-current" />
              <span>SUPER INTELLIGENT CIVIC & IMMIGRATION SEARCH</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#141413] tracking-tight text-balance">
              Describe Your Problem in Plain Words
            </h2>
            <p className="text-xs sm:text-sm text-[#5E5D59] max-w-2xl mx-auto leading-relaxed">
              Type any civic situation (e.g., &ldquo;I lost my laptop&rdquo;, &ldquo;I lost my passport&rdquo;, or &ldquo;How do I hire an expatriate?&rdquo;). Serikali Guide reads through all our live regulatory blogs and official service pages to generate an immediate step-by-step statutory solution.
            </p>
          </div>

          {/* "I need help with..." Interactive Quick Chips */}
          <div className="space-y-2.5 text-center">
            <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-medium">
              Common Citizen &amp; Resident Inquiries:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Lost Laptop / Device', query: 'I lost my laptop' },
                { label: 'Lost Passport', query: 'I lost my passport' },
                { label: 'Lost National ID', query: 'I lost my national ID card' },
                { label: 'Work Permits (Class D & G)', query: 'I need an employment or investor work permit' },
                { label: 'Company Registration', query: 'I want to register a private limited company' },
                { label: 'KRA Tax Compliance', query: 'I need a Tax Compliance Certificate' },
                { label: 'Special Pass', query: 'I need a short term temporary special pass' },
                { label: 'Visa & eTA', query: 'I need electronic travel authorization to Kenya' },
                { label: 'NGO / Foundation', query: 'I want to register an NGO or charitable foundation' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickServiceClick(chip.query)}
                  className="px-3.5 py-1.5 bg-[#F4F3EF] hover:bg-[#141413] text-[#141413] hover:text-[#F4F3EF] border border-[#141413]/15 transition-all text-xs font-mono-num uppercase tracking-wider shadow-2xs cursor-pointer active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Natural Language Search Input */}
          <form
            onSubmit={handleSearch}
            className="bg-[#F4F3EF] border border-[#141413]/25 p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-xs"
          >
            <div className="flex items-center gap-2.5 flex-1 px-2.5">
              <Search className="w-5 h-5 text-[#D94E34] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your situation e.g. 'I lost my laptop', 'I lost my passport', 'Register a company'..."
                className="w-full bg-transparent text-sm sm:text-base text-[#141413] placeholder:text-[#8E8D87] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 bg-[#141413] hover:bg-[#252523] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>Solve Problem</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D94E34]" />
            </button>
          </form>

          {/* Super Intelligent Solution Card */}
          {aiSolution && (
            <div className="bg-[#F4F3EF] border-2 border-[#141413] shadow-[0_12px_32px_rgba(20,20,19,0.08)] relative overflow-hidden transition-all duration-300 animate-in fade-in">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#D94E34] via-[#141413] to-[#D94E34]" />

              <div className="p-5 sm:p-7 space-y-6">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#141413]/12">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141413] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-widest font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-[#D94E34] fill-current" />
                      AI INTEL · GROUNDED ON SERIKALI BLOGS & SERVICES
                    </span>
                    {isAiLoading && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono-num text-[#D94E34] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D94E34]" />
                        Synthesizing...
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-mono-num uppercase tracking-wider font-bold px-2.5 py-1 ${
                      aiSolution.urgencyBadge.level === 'critical'
                        ? 'bg-[#D94E34] text-white shadow-xs'
                        : aiSolution.urgencyBadge.level === 'high'
                        ? 'bg-[#B45309] text-white'
                        : 'bg-[#1F6F43] text-white'
                    }`}
                  >
                    {aiSolution.urgencyBadge.text}
                  </span>
                </div>

                {/* Problem Title & Overview */}
                <div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#141413] font-medium tracking-tight">
                    {aiSolution.diagnosisTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4E4D48] mt-2 leading-relaxed">
                    {aiSolution.summaryOverview}
                  </p>
                </div>

                {/* Statutory Parameters Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-[#EAE9E4]/60 border border-[#141413]/10 text-xs font-mono-num">
                  <div>
                    <span className="text-[10px] uppercase text-[#6E6D68] block">Governing Law</span>
                    <span className="text-[#141413] font-medium truncate block">
                      {aiSolution.governingFramework.governingLaw}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#6E6D68] block">Agency</span>
                    <span className="text-[#141413] font-medium truncate block">
                      {aiSolution.governingFramework.regulatoryAgency}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#6E6D68] block">Official Portal</span>
                    <span className="text-[#141413] font-medium truncate block">
                      {aiSolution.governingFramework.officialPortal}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#6E6D68] block">Statutory Fees</span>
                    <span className="text-[#141413] font-medium truncate block">
                      {aiSolution.governingFramework.statutoryFees}
                    </span>
                  </div>
                </div>

                {/* WHAT TO DO (Step-by-Step Guidance) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-[#141413]/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D94E34]" />
                      <h4 className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#141413] font-bold">
                        WHAT TO DO (Step-by-Step Procedure)
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono-num text-[#6E6D68]">
                      {aiSolution.immediateActionSteps.length} Steps
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {aiSolution.immediateActionSteps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className={`p-3.5 bg-white/80 border ${
                          step.isUrgent ? 'border-[#D94E34]/30' : 'border-[#141413]/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 shrink-0 flex items-center justify-center text-xs font-mono-num font-bold ${
                              step.isUrgent ? 'bg-[#D94E34] text-white' : 'bg-[#141413] text-white'
                            }`}
                          >
                            0{step.stepNumber}
                          </span>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-semibold text-[#141413]">
                                {step.title}
                              </h5>
                              {step.formCode && (
                                <span className="text-[9px] font-mono-num px-1.5 py-0.5 bg-[#EAE9E4] text-[#4E4D48] border border-[#141413]/10">
                                  {step.formCode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#52514D] leading-relaxed">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grounded Blogs Strip */}
                {aiSolution.groundedBlogs.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between border-b border-[#141413]/10 pb-1.5">
                      <span className="text-xs font-mono-num uppercase tracking-[0.16em] text-[#141413] font-semibold flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#D94E34]" />
                        <span>Read From Our Verified Blogs ({aiSolution.groundedBlogs.length})</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {aiSolution.groundedBlogs.slice(0, 2).map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => navigate({ page: 'blog-detail', blogId: b.id })}
                          className="text-left p-3 bg-white/70 border border-[#141413]/12 hover:border-[#141413] transition-colors flex items-start justify-between gap-2 group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-mono-num uppercase text-[#D94E34] block">
                              {b.categoryName} · {b.readTime}
                            </span>
                            <h5 className="text-xs font-semibold text-[#141413] line-clamp-1 group-hover:text-[#D94E34] transition-colors">
                              {b.title}
                            </h5>
                            <p className="text-[11px] text-[#5E5D59] line-clamp-1 mt-0.5">
                              {b.excerpt}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#6E6D68] group-hover:text-[#D94E34] shrink-0 mt-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to Actions (CTAs) */}
                <div className="pt-2 border-t border-[#141413]/12">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {aiSolution.callToActions.map((cta) => {
                      if (cta.variant === 'primary') {
                        return (
                          <button
                            key={cta.id}
                            type="button"
                            onClick={() => handleExecuteCta(cta)}
                            className="px-5 py-3 bg-[#D94E34] hover:bg-[#BF3E26] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                          >
                            <FileCheck2 className="w-4 h-4" />
                            <span>{cta.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        );
                      }
                      if (cta.variant === 'secondary') {
                        return (
                          <button
                            key={cta.id}
                            type="button"
                            onClick={() => handleExecuteCta(cta)}
                            className="px-4 py-3 bg-[#141413] hover:bg-[#252523] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#D94E34]" />
                            <span>{cta.label}</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          key={cta.id}
                          type="button"
                          onClick={() => handleExecuteCta(cta)}
                          className="px-3.5 py-3 border border-[#141413]/25 hover:border-[#141413] text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>{cta.label}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6D68]" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Follow-up question chips */}
                {aiSolution.followUpQuestions && aiSolution.followUpQuestions.length > 0 && (
                  <div className="pt-1 border-t border-[#141413]/8 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono-num uppercase text-[#6E6D68]">
                      Follow up:
                    </span>
                    {aiSolution.followUpQuestions.map((fq, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickServiceClick(fq)}
                        className="px-2.5 py-1 bg-white hover:bg-[#141413] text-[#4E4D48] hover:text-[#F4F3EF] border border-[#141413]/10 text-[10px] font-mono-num transition-all cursor-pointer"
                      >
                        &ldquo;{fq}&rdquo; →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom "Can't find what you need?" Prompt */}
          <div className="text-center pt-2 flex items-center justify-center gap-2 text-xs font-mono-num text-[#5E5D59]">
            <span>Need assistance choosing the right category?</span>
            <button
              type="button"
              onClick={() => openGetStarted()}
              className="font-bold text-[#141413] hover:text-[#D94E34] underline underline-offset-4 cursor-pointer inline-flex items-center gap-1"
            >
              <span>Browse All Services &amp; Get Started →</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
