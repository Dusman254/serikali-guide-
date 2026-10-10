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
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import { useServiceJourney } from '../context/ServiceJourneyContext';
import { matchServiceByNaturalLanguage } from '../data/serviceKnowledgeBase';
import { PersonalizedServiceResult } from '../types/serviceAssistant';

export const HomeServiceAssistantSection: React.FC = () => {
  const { navigate } = useStore();
  const { openGetStarted } = useSerikali();
  const { startServiceJourney } = useServiceJourney();

  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{
    bestMatch: PersonalizedServiceResult;
    confidence: 'high' | 'medium' | 'low';
    explanation: string;
    otherPossibilities: PersonalizedServiceResult[];
  } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const match = matchServiceByNaturalLanguage(query);
    setSearchResult(match);
  };

  const handleQuickServiceClick = (promptQuery: string) => {
    setQuery(promptQuery);
    const match = matchServiceByNaturalLanguage(promptQuery);
    setSearchResult(match);
  };

  return (
    <section className="bg-[#EAE9E4] border-b border-[#141413]/12 py-10 sm:py-14 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141413] text-[#F4F3EF] rounded-full text-[10px] font-mono-num uppercase tracking-widest font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D94E34] fill-current" />
              <span>Interactive Services Platform</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl text-[#141413] tracking-tight text-balance">
              How Can We Help You Today?
            </h2>
            <p className="text-xs sm:text-sm text-[#5E5D59] max-w-2xl mx-auto leading-relaxed">
              Tell us what immigration, business, or civil service you need, and Serikali Guide will
              guide you through statutory requirements, document checklists, and application steps.
            </p>
          </div>

          {/* "I need help with..." Interactive Quick Chips */}
          <div className="space-y-2.5 text-center">
            <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] font-medium">
              I need help with:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: 'Passports', query: 'I need to apply for or renew a passport' },
                { label: 'Work Permits', query: 'I need an employment or investor work permit' },
                { label: 'Special Pass', query: 'I need a short term temporary special pass' },
                { label: 'Visa & eTA', query: 'I need electronic travel authorization to Kenya' },
                { label: 'Company Registration', query: 'I want to register a private limited company' },
                { label: 'NGO Registration', query: 'I want to register an NGO or charitable foundation' },
                { label: 'KRA Tax Clearance', query: 'I need a Tax Compliance Certificate' },
                { label: 'Dependent Pass', query: 'I need a dependent pass for spouse and children' },
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
              <Search className="w-4 h-4 text-[#8E8D87] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your situation (e.g. 'I lost my passport', 'Hiring an expatriate doctor')..."
                className="w-full bg-transparent text-xs sm:text-sm text-[#141413] placeholder:text-[#8E8D87] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#141413] hover:bg-[#252523] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <span>Find My Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Instant Best Match Result Card */}
          {searchResult && (
            <div className="bg-[#F4F3EF] border-2 border-[#141413] p-5 sm:p-6 space-y-4 animate-in fade-in duration-200 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#141413]/10">
                <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#D94E34] font-bold">
                  BEST SERVICE MATCH
                </span>
                <span className="text-xs font-mono-num text-[#5E5D59]">
                  {searchResult.bestMatch.categoryName}
                </span>
              </div>

              <div>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#141413]">
                  {searchResult.bestMatch.serviceName}
                </h3>
                <p className="text-xs sm:text-sm text-[#5E5D59] mt-1.5 leading-relaxed">
                  {searchResult.explanation}
                </p>
              </div>

              {/* Requirements Teaser */}
              <div className="p-3.5 bg-[#EAE9E4]/60 border border-[#141413]/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono-num text-[#6E6D68]">
                  <span>Mandatory Documents:</span>
                  <span>Portal: {searchResult.bestMatch.officialPortal}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#141413]">
                  {searchResult.bestMatch.requirements.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6F43] shrink-0" />
                      <span className="line-clamp-1">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => startServiceJourney(searchResult.bestMatch)}
                  className="px-5 py-2.5 bg-[#D94E34] hover:bg-[#BF3E26] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Start Guided Service</span>
                </button>

                {searchResult.bestMatch.guideUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        page: 'service-detail',
                        serviceId: searchResult.bestMatch.guideUrl!.serviceId,
                        subCategoryId: searchResult.bestMatch.guideUrl!.subCategoryId,
                      })
                    }
                    className="px-4 py-2.5 bg-[#141413] hover:bg-[#252523] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>View Requirements</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openGetStarted(searchResult.bestMatch.serviceId)}
                  className="px-4 py-2.5 border border-[#141413]/30 hover:border-[#141413] text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ml-auto transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-[#D94E34]" />
                  <span>Start Assisted Application</span>
                </button>
              </div>

              {/* Other Possibilities */}
              {searchResult.otherPossibilities.length > 0 && (
                <div className="pt-3 border-t border-[#141413]/10">
                  <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#8E8D87] block mb-1.5">
                    Other Related Services:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.otherPossibilities.map((pos) => (
                      <button
                        key={pos.subCategoryId}
                        type="button"
                        onClick={() => {
                          setSearchResult({
                            bestMatch: pos,
                            confidence: 'medium',
                            explanation: pos.whyThisService,
                            otherPossibilities: searchResult.otherPossibilities.filter(
                              (p) => p.subCategoryId !== pos.subCategoryId
                            ),
                          });
                        }}
                        className="text-xs font-mono-num text-[#141413] hover:text-[#D94E34] hover:underline"
                      >
                        → {pos.serviceName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
