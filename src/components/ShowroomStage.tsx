import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  FileCheck2,
  FileText,
  Globe,
  HeartHandshake,
  Landmark,
  Loader2,
  Receipt,
  Scale,
  Search,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import {
  BlogPost,
  ServiceCategory,
  ServiceCategoryId,
  SubCategoryDetail,
} from '../data/serikaliData';
import { StudioImage } from './StudioImage';

export const SERVICE_CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  'immigration-visas': Globe,
  'business-registration': Building2,
  'ngo-nonprofit': HeartHandshake,
  'government-documents': FileText,
  'licences-permits': Scale,
  'tax-compliance': Receipt,
  'investment-relocation': Compass,
  'government-services': Landmark,
};

interface AiSynthesizedAnswer {
  answer: string;
  portal: string;
  timeline: string;
  keyPoints: string[];
  followUpQuestions: string[];
  sourceTitle: string;
}

export const ShowroomStage: React.FC = () => {
  const { navigate } = useStore();
  const {
    serviceCategories,
    blogPosts,
    t,
    language,
    openGetStarted,
    openTrackModal,
  } = useSerikali();

  // Desktop hover index on the hanger rail
  const [hoveredRailIdx, setHoveredRailIdx] = useState<number | null>(null);

  // Tablet & Mobile auto-carousel index
  const [carouselIdx, setCarouselIdx] = useState<number>(0);
  const [isTouchPaused, setIsTouchPaused] = useState<boolean>(false);

  // Large interactive search box state (NO star icon!)
  const [aiQuery, setAiQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [customAiResponse, setCustomAiResponse] =
    useState<AiSynthesizedAnswer | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Section 01: Blog Top Stories active selector state
  const [selectedTopStoryIdx, setSelectedTopStoryIdx] = useState<number>(0);

  const railServices: ServiceCategory[] = serviceCategories;
  const topStories: BlogPost[] = useMemo(() => {
    const tops = blogPosts.filter((b) => b.isTopStory);
    return tops.length > 0 ? tops : blogPosts.slice(0, 4);
  }, [blogPosts]);

  // Auto-carousel every 2 seconds for Tablet & Mobile Hero Hanger Rail
  useEffect(() => {
    if (isTouchPaused || railServices.length === 0) return;
    const timer = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % railServices.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isTouchPaused, railServices.length]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset custom AI response when query changes so local synthesis updates immediately
  useEffect(() => {
    setCustomAiResponse(null);
  }, [aiQuery]);

  // Intelligent Search Engine: Reads directly from live blogs and service pages to give accurate interactive answers
  const searchKnowledgeResult = useMemo(() => {
    const q = aiQuery.trim().toLowerCase();

    if (!q) {
      const defaultBlog = blogPosts[0];
      const defaultSvc = serviceCategories[0];
      const defaultSub = defaultSvc?.subCategories[0];
      return {
        synthesized: defaultSub
          ? {
              sourceTitle: `${defaultSvc.name} — ${defaultSub.name}`,
              answer: defaultSub.summary,
              portal: defaultSub.portal,
              timeline: defaultSub.timeline,
              keyPoints: defaultSub.requirements.slice(0, 3),
              followUpQuestions: [
                'What documents are required for a Class D or Class G work permit?',
                'How do I register a 100% foreign-owned company on BRS eCitizen?',
                'How do I apply for a KRA PIN and Tax Compliance Certificate?',
              ],
            }
          : null,
        blogs: blogPosts.slice(0, 4).map((post) => ({
          post,
          matchReason: `Verified Guide · ${post.categoryName}`,
        })),
        subCategories: serviceCategories.slice(0, 3).flatMap((svc) =>
          svc.subCategories.slice(0, 1).map((sub) => ({
            service: svc,
            sub,
          }))
        ),
      };
    }

    const tokens = q.split(/\s+/).filter((tok) => tok.length >= 2);

    // 1. Score all Blog Posts
    const scoredBlogs = blogPosts
      .map((post) => {
        let score = 0;
        let matchedTerm = '';
        const titleL = post.title.toLowerCase();
        const subL = post.subtitle.toLowerCase();
        const catL = post.categoryName.toLowerCase();
        const subCatL = post.subCategoryName.toLowerCase();
        const excerptL = post.excerpt.toLowerCase();
        const bodyText = post.sections
          .map((s) => `${s.heading} ${s.paragraphs.join(' ')}`)
          .join(' ')
          .toLowerCase();

        if (titleL.includes(q)) score += 15;
        if (subCatL.includes(q)) score += 14;
        if (catL.includes(q)) score += 10;

        for (const kw of post.keywords) {
          const kwL = kw.toLowerCase();
          if (kwL.includes(q) || q.includes(kwL)) {
            score += 12;
            if (!matchedTerm) matchedTerm = kw;
          }
        }

        for (const tok of tokens) {
          if (titleL.includes(tok)) score += 6;
          if (subCatL.includes(tok)) score += 6;
          if (catL.includes(tok)) score += 4;
          if (subL.includes(tok)) score += 4;
          if (excerptL.includes(tok)) score += 3;
          if (bodyText.includes(tok)) score += 2;
        }

        const matchReason = matchedTerm
          ? `Reads from "${matchedTerm}" · ${post.categoryName}`
          : `Matched Blog Guide · ${post.categoryName}`;

        return { post, score, matchReason };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    // 2. Score all Service Sub-Categories
    const scoredSubs: Array<{
      service: ServiceCategory;
      sub: SubCategoryDetail;
      score: number;
    }> = [];

    for (const service of serviceCategories) {
      for (const sub of service.subCategories) {
        let score = 0;
        const nameL = sub.name.toLowerCase();
        const svcNameL = service.name.toLowerCase();
        const sumL = sub.summary.toLowerCase();
        const reqL = sub.requirements.join(' ').toLowerCase();
        const stepsL = sub.steps
          .map((st) => (typeof st === 'string' ? st : `${st.title} ${st.detail}`))
          .join(' ')
          .toLowerCase();

        if (nameL.includes(q) || q.includes(nameL)) score += 18;
        if (svcNameL.includes(q)) score += 10;
        if (sumL.includes(q)) score += 8;

        for (const tok of tokens) {
          if (nameL.includes(tok)) score += 8;
          if (svcNameL.includes(tok)) score += 5;
          if (sumL.includes(tok)) score += 4;
          if (reqL.includes(tok)) score += 3;
          if (stepsL.includes(tok)) score += 2;
        }

        if (score > 0) {
          scoredSubs.push({ service, sub, score });
        }
      }
    }

    scoredSubs.sort((a, b) => b.score - a.score);

    // 3. Synthesize accurate answer directly from best matching Sub-Category & Blog Post
    const bestSub = scoredSubs[0];
    const bestBlog = scoredBlogs[0]?.post;

    let synthesized: AiSynthesizedAnswer;
    if (bestSub && (!bestBlog || bestSub.score >= (scoredBlogs[0]?.score || 0))) {
      synthesized = {
        sourceTitle: `${bestSub.service.name} · ${bestSub.sub.name}`,
        answer: `${bestSub.sub.summary} (${bestSub.sub.statutoryNote}). Applications are processed through ${bestSub.sub.portal} with an estimated timeline of ${bestSub.sub.timeline}.`,
        portal: bestSub.sub.portal,
        timeline: bestSub.sub.timeline,
        keyPoints: bestSub.sub.requirements.slice(0, 4),
        followUpQuestions: [
          `What are the step-by-step procedures for ${bestSub.sub.name}?`,
          bestBlog
            ? `Tell me more about ${bestBlog.subCategoryName}`
            : `How do I book a consultation for ${bestSub.sub.name}?`,
        ],
      };
    } else if (bestBlog) {
      const matchingSvc = serviceCategories.find(
        (s) => s.id === bestBlog.categoryId
      );
      const matchingSub = matchingSvc?.subCategories.find(
        (sub) =>
          sub.name.toLowerCase() === bestBlog.subCategoryName.toLowerCase()
      );
      synthesized = {
        sourceTitle: bestBlog.title,
        answer: `${bestBlog.excerpt} ${
          bestBlog.sections[0]?.paragraphs[0] || ''
        }`,
        portal: bestBlog.officialPortal,
        timeline: matchingSub?.timeline || '3 to 15 Working Days',
        keyPoints:
          bestBlog.keyTakeaways.length > 0
            ? bestBlog.keyTakeaways.slice(0, 4)
            : matchingSub?.requirements.slice(0, 4) || [],
        followUpQuestions: [
          `What documents are required for ${bestBlog.subCategoryName}?`,
          `What is the official portal for ${bestBlog.categoryName}?`,
        ],
      };
    } else {
      const fallbackBlog = blogPosts[0];
      synthesized = {
        sourceTitle: 'Serikali Guide Knowledge Base',
        answer: `We cover 8 core Kenyan regulatory desks including Immigration & Visas, Business & Company Registration, NGOs, Government Documents, Licences, KRA Tax, Investment, and eCitizen services. Select any topic below or refine your question.`,
        portal: 'ecitizen.go.ke · fns.immigration.go.ke · itax.kra.go.ke',
        timeline: 'Varies by Statutory Agency',
        keyPoints: fallbackBlog ? fallbackBlog.keyTakeaways.slice(0, 3) : [],
        followUpQuestions: [
          'How do I apply for a Kenya Work Permit on eFNS?',
          'How to register a Limited Company on BRS eCitizen?',
        ],
      };
    }

    return {
      synthesized,
      blogs:
        scoredBlogs.length > 0
          ? scoredBlogs.slice(0, 4)
          : blogPosts.slice(0, 4).map((post) => ({
              post,
              score: 1,
              matchReason: `Suggested Guide · ${post.categoryName}`,
            })),
      subCategories:
        scoredSubs.length > 0
          ? scoredSubs.slice(0, 3).map(({ service, sub }) => ({ service, sub }))
          : serviceCategories.slice(0, 3).flatMap((svc) =>
              svc.subCategories.slice(0, 1).map((sub) => ({
                service: svc,
                sub,
              }))
            ),
    };
  }, [aiQuery, blogPosts, serviceCategories]);

  // Ask server-side Gemini assistant grounded on our live blogs & services
  const handleAskInteractiveAi = async (questionToAsk?: string) => {
    const targetQuery = (questionToAsk ?? aiQuery).trim();
    if (!targetQuery) {
      setIsSearchFocused(true);
      return;
    }
    if (questionToAsk) {
      setAiQuery(questionToAsk);
    }
    setIsSearchFocused(true);
    setIsAiLoading(true);

    try {
      const contextSummary = [
        ...searchKnowledgeResult.subCategories.map(
          ({ service, sub }) =>
            `SERVICE [${service.name} -> ${sub.name}]: Summary: ${sub.summary}. Portal: ${sub.portal}. Timeline: ${sub.timeline}. Requirements: ${sub.requirements.join('; ')}.`
        ),
        ...searchKnowledgeResult.blogs.map(
          ({ post }) =>
            `BLOG [${post.title}]: ${post.excerpt} Key Takeaways: ${post.keyTakeaways.join('; ')}`
        ),
      ].join('\n');

      const res = await fetch('/api/ai/search-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery,
          contextSummary,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          setCustomAiResponse({
            answer: data.answer,
            portal:
              data.portal ||
              searchKnowledgeResult.synthesized?.portal ||
              'ecitizen.go.ke',
            timeline:
              data.timeline ||
              searchKnowledgeResult.synthesized?.timeline ||
              'Standard Statutory Timeline',
            keyPoints: Array.isArray(data.keyPoints)
              ? data.keyPoints
              : searchKnowledgeResult.synthesized?.keyPoints || [],
            followUpQuestions: Array.isArray(data.followUpQuestions)
              ? data.followUpQuestions
              : [],
            sourceTitle:
              searchKnowledgeResult.synthesized?.sourceTitle ||
              'Serikali Guide Knowledge Base',
          });
        }
      }
    } catch {
      // Uses local synthesized knowledge result seamlessly
    } finally {
      setIsAiLoading(false);
    }
  };

  const activeAnswer = customAiResponse || searchKnowledgeResult.synthesized;
  const activeTopStory = topStories[selectedTopStoryIdx] || topStories[0];

  return (
    <div className="w-full">
      {/* =====================================================================
          HERO SECTION:
          1. Headline: "Your one border stop post." ("border" in red only!)
          2. Hanger Rail with the Service Categories (clicking opens the Sub-Category Chooser page!)
          3. Large Interactive Search Box below the Hanger (NO star icon; reads from blogs & services)
         ===================================================================== */}
      <section className="relative showroom-canvas min-h-0 sm:min-h-[70vh] lg:min-h-[80vh] flex flex-col justify-between border-b border-[#141413]/10 py-5 sm:py-8 lg:py-14">
        {/* 1. HERO HEADLINE — Only the word "border" is in red (Kicker removed completely as requested) */}
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-editorial text-3xl sm:text-5xl lg:text-[64px] leading-[1.05] tracking-tight text-[#141413] max-w-3xl mx-auto"
            style={{ textWrap: 'balance' }}
          >
            {t.heroPrefix}
            <span className="text-[#D94E34]">{t.heroBorderRed}</span>
            {t.heroSuffix}
          </motion.h1>
          <p className="text-xs sm:text-sm text-[#5E5D59] mt-2 sm:mt-3 max-w-xl mx-auto">
            {t.heroSubtext}
          </p>
        </div>

        {/* 2. THE HANGER RAIL WITH SERVICE CATEGORIES (Clicking opens full-page Sub-Category Chooser!) */}
        <div className="relative max-w-[1400px] w-full mx-auto px-4 sm:px-8 my-auto pt-3 sm:pt-6 pb-2 sm:pb-4">
          {/* DESKTOP HORIZONTAL HANGER RAIL (lg+) */}
          <div
            onMouseLeave={() => setHoveredRailIdx(null)}
            className="hidden lg:block relative mx-auto max-w-[1320px]"
          >
            {/* Brushed Anodized Aluminum Bar */}
            <div
              aria-hidden="true"
              className="flex items-center justify-between w-full h-3.5 aluminum-rail rounded-full relative z-10"
            >
              <div className="w-5 h-7 -ml-1 aluminum-bracket rounded-xs border border-[#141413]/20" />
              <div className="w-5 h-7 -mr-1 aluminum-bracket rounded-xs border border-[#141413]/20" />
            </div>

            {/* Service Categories Hanging on the Rail */}
            <div className="flex items-start justify-between gap-2 w-full pt-0 -mt-1.5 min-h-[255px] px-2">
              {railServices.map((service, idx) => {
                const isHovered = hoveredRailIdx === idx;
                const isAnyHovered = hoveredRailIdx !== null;
                const IconComponent =
                  SERVICE_CATEGORY_ICONS[service.id] || Globe;

                return (
                  <motion.div
                    key={service.id}
                    layout
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 26,
                    }}
                    onMouseEnter={() => setHoveredRailIdx(idx)}
                    onClick={() =>
                      navigate({
                        page: 'service-subcategories',
                        serviceId: service.id,
                      })
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`${service.name} — Open sub-categories page`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate({
                          page: 'service-subcategories',
                          serviceId: service.id,
                        });
                      }
                    }}
                    className={`group relative flex flex-col items-center cursor-pointer select-none transition-opacity duration-200 ${
                      isHovered
                        ? 'flex-[1.55] z-30 opacity-100'
                        : isAnyHovered
                        ? 'flex-[0.9] z-10 opacity-65'
                        : 'flex-1 z-20 opacity-100'
                    }`}
                  >
                    {/* Metallic Hanger Hook & Shoulder */}
                    <svg
                      viewBox="0 0 80 54"
                      className={`transition-all duration-300 ${
                        isHovered ? 'w-20 h-14' : 'w-16 h-12'
                      }`}
                      fill="none"
                    >
                      <path
                        d="M40 2 C46 2, 48 10, 40 15 L40 24"
                        stroke="#52514D"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 50 L40 24 L72 50"
                        stroke={isHovered ? '#141413' : '#5E5D59'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Suspended Service Category Card on the Hanger */}
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.05 : 1,
                        y: isHovered ? 3 : 0,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 24,
                      }}
                      className={`w-full max-w-[156px] min-h-[168px] flex flex-col items-center justify-between p-3.5 transition-colors duration-200 ${
                        isHovered
                          ? 'bg-[#141413] text-[#F4F3EF] shadow-[0_20px_34px_rgba(20,20,19,0.20)]'
                          : 'bg-[#F4F3EF] text-[#141413] border border-[#141413]/14 shadow-[0_8px_18px_rgba(20,20,19,0.06)]'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono-num ${
                          isHovered ? 'text-[#D94E34]' : 'text-[#8E8D87]'
                        }`}
                      >
                        0{idx + 1}
                      </span>

                      <IconComponent
                        className={`transition-transform duration-300 stroke-[1.4] my-2 ${
                          isHovered
                            ? 'w-9 h-9 text-[#F4F3EF] scale-105'
                            : 'w-7 h-7 text-[#141413]'
                        }`}
                      />

                      <div className="text-center">
                        <span
                          className={`block text-[10px] font-mono-num uppercase tracking-[0.12em] leading-snug ${
                            isHovered
                              ? 'text-[#F4F3EF] font-semibold'
                              : 'text-[#141413]'
                          }`}
                        >
                          {service.name}
                        </span>
                        <span
                          className={`block mt-1 text-[10px] font-mono-num ${
                            isHovered ? 'text-[#D94E34]' : 'text-[#6E6D68]'
                          }`}
                        >
                          {service.subCategories.length} sub-categories →
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* TABLET & MOBILE HANGER RAIL (< lg) */}
          <div
            onMouseEnter={() => setIsTouchPaused(true)}
            onMouseLeave={() => setIsTouchPaused(false)}
            onTouchStart={() => setIsTouchPaused(true)}
            onTouchEnd={() => setIsTouchPaused(false)}
            className="lg:hidden max-w-2xl mx-auto"
          >
            {/* Aluminum Rail Bar */}
            <div className="w-full h-3.5 aluminum-rail rounded-full flex items-center justify-between mb-1">
              <div className="w-4 h-6 -ml-1 aluminum-bracket rounded-xs border border-[#141413]/20" />
              <div className="w-4 h-6 -mr-1 aluminum-bracket rounded-xs border border-[#141413]/20" />
            </div>

            <div className="relative min-h-[195px] sm:min-h-[225px] flex flex-col items-center justify-center">
              {/* Mobile View (< sm): 1 Centered Hanger Item */}
              <div className="sm:hidden w-full flex flex-col items-center">
                <AnimatePresence mode="wait">
                  {railServices[carouselIdx] &&
                    (() => {
                      const service = railServices[carouselIdx];
                      const MobileIcon =
                        SERVICE_CATEGORY_ICONS[service.id] || Globe;
                      return (
                        <motion.button
                          key={service.id}
                          initial={{ opacity: 0, x: 28, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -28, scale: 0.95 }}
                          transition={{
                            duration: 0.28,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          onClick={() =>
                            navigate({
                              page: 'service-subcategories',
                              serviceId: service.id,
                            })
                          }
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <svg
                            viewBox="0 0 80 54"
                            className="w-20 h-12 -mt-1.5"
                            fill="none"
                          >
                            <path
                              d="M40 2 C46 2, 48 10, 40 15 L40 24"
                              stroke="#52514D"
                              strokeWidth="2.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M8 50 L40 24 L72 50"
                              stroke="#141413"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>

                          <div className="w-44 h-36 bg-[#141413] text-[#F4F3EF] flex flex-col items-center justify-center p-3 shadow-xl text-center">
                            <MobileIcon className="w-8 h-8 stroke-[1.4] text-[#F4F3EF]" />
                            <span className="mt-2 text-xs font-mono-num uppercase tracking-[0.12em] leading-snug line-clamp-2">
                              {service.name}
                            </span>
                            <span className="mt-1 text-[10px] font-mono-num text-[#D94E34]">
                              {t.chooseSubCategory} (
                              {service.subCategories.length}) →
                            </span>
                          </div>
                        </motion.button>
                      );
                    })()}
                </AnimatePresence>
              </div>

              {/* Tablet View (sm to lg): 3-Item Sliding Hanger Carousel */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-5 w-full px-4">
                <AnimatePresence mode="popLayout">
                  {[0, 1, 2].map((offset) => {
                    const itemIdx =
                      (carouselIdx + offset) % railServices.length;
                    const service = railServices[itemIdx];
                    if (!service) return null;
                    const TabletIcon =
                      SERVICE_CATEGORY_ICONS[service.id] || Globe;
                    const isCenter = offset === 1;
                    return (
                      <motion.button
                        key={`${service.id}-${itemIdx}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() =>
                          navigate({
                            page: 'service-subcategories',
                            serviceId: service.id,
                          })
                        }
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <svg
                          viewBox="0 0 80 54"
                          className="w-20 h-13 -mt-2"
                          fill="none"
                        >
                          <path
                            d="M40 2 C46 2, 48 10, 40 15 L40 24"
                            stroke="#52514D"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8 50 L40 24 L72 50"
                            stroke={isCenter ? '#141413' : '#787772'}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <div
                          className={`w-full max-w-[175px] h-40 flex flex-col items-center justify-center p-4 text-center transition-colors ${
                            isCenter
                              ? 'bg-[#141413] text-[#F4F3EF] shadow-xl'
                              : 'bg-[#F4F3EF] text-[#141413] border border-[#141413]/15'
                          }`}
                        >
                          <TabletIcon className="w-8 h-8 stroke-[1.4]" />
                          <span className="mt-2.5 text-[11px] font-mono-num uppercase tracking-[0.12em] leading-tight">
                            {service.name}
                          </span>
                          <span className="mt-1 text-[10px] font-mono-num opacity-75">
                            {service.subCategories.length} sub-categories →
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Quick Service Selector Dots */}
              <div className="flex items-center gap-1.5 mt-4">
                {railServices.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setCarouselIdx(i)}
                    aria-label={`Slide ${s.name}`}
                    className={`h-1.5 transition-all rounded-full cursor-pointer ${
                      carouselIdx === i
                        ? 'w-6 bg-[#141413]'
                        : 'w-2 bg-[#141413]/25'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. HERO PRIMARY CTA: GET STARTED (Guided Service Application Flow) */}
          <div className="mt-6 sm:mt-8 max-w-xl mx-auto text-center relative z-30">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openGetStarted()}
                className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-[#141413] text-[#F4F3EF] hover:bg-[#2B2B28] text-xs sm:text-sm font-mono-num uppercase tracking-[0.2em] font-semibold shadow-[0_12px_28px_rgba(20,20,19,0.18)] hover:shadow-[0_16px_36px_rgba(20,20,19,0.26)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border border-[#141413] active:scale-[0.99]"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4 text-[#D94E34]" />
              </button>

              <button
                type="button"
                onClick={() => openTrackModal()}
                className="w-full sm:w-auto px-6 py-4 bg-[#EAE9E4]/80 hover:bg-[#EAE9E4] text-[#141413] text-xs font-mono-num uppercase tracking-[0.16em] font-medium transition-colors cursor-pointer border border-[#141413]/20 flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5 text-[#5E5D59]" />
                <span>Track Existing Request</span>
              </button>
            </div>

            <p className="text-[11px] font-mono-num text-[#6E6D68] mt-3">
              Direct guided service applications for Passports, Permits, Visas, Business & Tax.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          01. BLOG TOP STORIES (No. 1 Section on Landing Page)
         ===================================================================== */}
      <section className="py-8 sm:py-12 lg:py-20 border-b border-[#141413]/10 bg-[#EAE9E4]/55">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <p className="text-xs font-mono-num uppercase tracking-[0.18em] text-[#6E6D68] mb-1">
                {t.section01Kicker}
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                {t.section01Title}
              </h2>
            </div>
            <button
              onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
              className="text-xs font-mono-num uppercase tracking-[0.16em] text-[#141413] hover:opacity-70 flex items-center gap-1.5 cursor-pointer self-start sm:self-end whitespace-nowrap"
            >
              <span>
                {t.viewAllBlogs} ({blogPosts.length})
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Top Story Selector Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-3 sm:pb-4 border-b border-[#141413]/10">
            {topStories.map((story, idx) => {
              const isSelected = selectedTopStoryIdx === idx;
              return (
                <button
                  key={story.id}
                  onClick={() => setSelectedTopStoryIdx(idx)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 ${
                    isSelected
                      ? 'bg-[#141413] text-[#F4F3EF]'
                      : 'bg-[#F4F3EF] text-[#5E5D59] hover:text-[#141413] border border-[#141413]/12'
                  }`}
                >
                  <span className="font-mono-num text-[11px] opacity-65">
                    0{idx + 1}.
                  </span>
                  <span>{story.subCategoryName}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Lead Top Story Display */}
          {activeTopStory && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTopStory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-5 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center"
              >
                <button
                  onClick={() =>
                    navigate({
                      page: 'blog-detail',
                      blogId: activeTopStory.id,
                    })
                  }
                  className="lg:col-span-6 overflow-hidden bg-[#F4F3EF] border border-[#141413]/10 aspect-[16/10] cursor-pointer group text-left"
                >
                  <StudioImage
                    src={activeTopStory.image}
                    alt={activeTopStory.title}
                    width={640}
                    height={400}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    disableCutout
                  />
                </button>

                <div className="lg:col-span-6 space-y-4">
                  {/* Unboxed Metadata with Typographic Separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#5E5D59]">
                    <span className="font-semibold text-[#D94E34]">
                      {activeTopStory.categoryName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeTopStory.subCategoryName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeTopStory.publishedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeTopStory.readTime}</span>
                  </div>

                  <button
                    onClick={() =>
                      navigate({
                        page: 'blog-detail',
                        blogId: activeTopStory.id,
                      })
                    }
                    className="text-left block cursor-pointer group"
                  >
                    <h3
                      className="font-editorial text-3xl sm:text-4xl text-[#141413] leading-tight group-hover:opacity-80 transition-opacity"
                      style={{ textWrap: 'balance' }}
                    >
                      {activeTopStory.title}
                    </h3>
                  </button>

                  <p className="text-sm text-[#5E5D59] leading-relaxed">
                    {activeTopStory.excerpt}
                  </p>

                  {/* Key Takeaways Preview */}
                  <div className="py-3 border-y border-[#141413]/10 space-y-1.5">
                    <p className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold">
                      Key Regulatory Takeaways
                    </p>
                    <ul className="space-y-1 text-xs text-[#5E5D59]">
                      {activeTopStory.keyTakeaways.slice(0, 2).map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-mono-num text-[#D94E34]">
                            —
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#6E6D68] pt-1">
                    <span>
                      By{' '}
                      <strong className="text-[#141413]">
                        {activeTopStory.author}
                      </strong>{' '}
                      · {activeTopStory.authorRole}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() =>
                        navigate({
                          page: 'blog-detail',
                          blogId: activeTopStory.id,
                        })
                      }
                      className="px-5 py-2.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] hover:bg-[#2B2B28] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{t.readFullStory}</span>
                    </button>

                    <button
                      onClick={() =>
                        navigate({
                          page: 'service-subcategories',
                          serviceId: activeTopStory.categoryId,
                        })
                      }
                      className="px-5 py-2.5 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-[0.16em] hover:border-[#141413] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Explore {activeTopStory.categoryName}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Top Stories: List Default on Mobile/Tablet (<lg), 4-Card Grid on Desktop (lg+) */}
          <div className="mt-10 pt-8 border-t border-[#141413]/10">
            {/* Mobile & Tablet: List Layout Default */}
            <div className="lg:hidden space-y-3">
              {topStories.slice(0, 4).map((story, idx) => (
                <div
                  key={story.id}
                  onClick={() =>
                    navigate({
                      page: 'blog-detail',
                      blogId: story.id,
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate({
                        page: 'blog-detail',
                        blogId: story.id,
                      });
                    }
                  }}
                  className="bg-[#F4F3EF] border border-[#141413]/12 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 group cursor-pointer hover:border-[#141413] transition-colors"
                >
                  <div className="w-24 sm:w-32 aspect-[4/3] shrink-0 overflow-hidden bg-[#EAE9E4] border border-[#141413]/10">
                    <StudioImage
                      src={story.image}
                      alt={story.title}
                      width={128}
                      height={96}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      disableCutout
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono-num text-[#6E6D68] mb-1">
                      <span className="text-[#D94E34] font-semibold truncate">
                        0{idx + 1} · {story.subCategoryName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0">{story.readTime}</span>
                    </div>

                    <h4 className="font-editorial text-base sm:text-lg text-[#141413] leading-snug group-hover:underline line-clamp-2">
                      {story.title}
                    </h4>

                    <div className="mt-2 flex items-center gap-1 text-[11px] font-mono-num uppercase tracking-wider text-[#141413] font-medium">
                      <span>{t.readGuide}</span>
                      <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: 4-Card Grid */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-5">
              {topStories.slice(0, 4).map((story, idx) => (
                <div
                  key={story.id}
                  onClick={() =>
                    navigate({
                      page: 'blog-detail',
                      blogId: story.id,
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate({
                        page: 'blog-detail',
                        blogId: story.id,
                      });
                    }
                  }}
                  className="bg-[#F4F3EF] border border-[#141413]/12 p-4 flex flex-col justify-between group cursor-pointer hover:border-[#141413] transition-colors"
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden bg-[#EAE9E4] border border-[#141413]/10 mb-3">
                      <StudioImage
                        src={story.image}
                        alt={story.title}
                        width={400}
                        height={250}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        disableCutout
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono-num text-[#6E6D68] mb-1.5">
                      <span className="text-[#D94E34] font-semibold truncate">
                        0{idx + 1} · {story.subCategoryName}
                      </span>
                      <span className="shrink-0">{story.readTime}</span>
                    </div>
                    <h4 className="font-editorial text-lg text-[#141413] leading-snug group-hover:underline line-clamp-2">
                      {story.title}
                    </h4>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#141413]/10 flex items-center justify-between text-xs font-mono-num uppercase tracking-wider text-[#141413]">
                    <span>{t.readGuide}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
