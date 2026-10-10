import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import { ServiceCategoryId } from '../data/serikaliData';
import { SERVICE_CATEGORY_ICONS } from './ShowroomStage';
import { StudioImage } from './StudioImage';
import { HomeServiceAssistantSection } from './HomeServiceAssistantSection';

export const HomeEditorialSections: React.FC = () => {
  const { navigate } = useStore();
  const { blogPosts, serviceCategories, t } = useSerikali();

  const [activeFeatureCategory, setActiveFeatureCategory] = useState<
    ServiceCategoryId | 'all'
  >('all');

  // Carousel States for Mobile & Tablet Views
  const [blogCarouselIdx, setBlogCarouselIdx] = useState<number>(0);
  const [serviceCarouselIdx, setServiceCarouselIdx] = useState<number>(0);

  const [isBlogPaused, setIsBlogPaused] = useState<boolean>(false);
  const [isServicePaused, setIsServicePaused] = useState<boolean>(false);

  const featuredPosts = useMemo(() => {
    const base = blogPosts.filter((b) => b.isFeatured || b.isTopStory);
    const list = base.length >= 4 ? base : blogPosts;
    if (activeFeatureCategory === 'all') return list;
    return blogPosts.filter((b) => b.categoryId === activeFeatureCategory);
  }, [activeFeatureCategory, blogPosts]);

  // Safe Index bounds
  const currentBlog =
    featuredPosts[blogCarouselIdx % (featuredPosts.length || 1)] ||
    featuredPosts[0];
  const currentService =
    serviceCategories[serviceCarouselIdx % (serviceCategories.length || 1)] ||
    serviceCategories[0];

  // Auto-carousel every 2 seconds for Section 02 Blog Features on Mobile & Tablet
  useEffect(() => {
    if (isBlogPaused || featuredPosts.length <= 1) return;
    const timer = setInterval(() => {
      setBlogCarouselIdx((prev) => (prev + 1) % featuredPosts.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isBlogPaused, featuredPosts.length]);

  // Auto-carousel every 2 seconds for Section 03 Service Directory on Mobile & Tablet
  useEffect(() => {
    if (isServicePaused || serviceCategories.length <= 1) return;
    const timer = setInterval(() => {
      setServiceCarouselIdx((prev) => (prev + 1) % serviceCategories.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isServicePaused, serviceCategories.length]);

  const handlePrevBlog = () => {
    setBlogCarouselIdx((prev) =>
      prev === 0 ? featuredPosts.length - 1 : prev - 1
    );
  };

  const handleNextBlog = () => {
    setBlogCarouselIdx((prev) =>
      prev === featuredPosts.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevService = () => {
    setServiceCarouselIdx((prev) =>
      prev === 0 ? serviceCategories.length - 1 : prev - 1
    );
  };

  const handleNextService = () => {
    setServiceCarouselIdx((prev) =>
      prev === serviceCategories.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="w-full">
      {/* =====================================================================
          INTERACTIVE IMMIGRATION SERVICES PLATFORM ENTRY (HOW CAN WE HELP YOU?)
         ===================================================================== */}
      <HomeServiceAssistantSection />

      {/* =====================================================================
          02. BLOG FEATURES (No. 2 Section on Landing Page)
          Desktop: 4-Column Grid | Mobile & Tablet: 2-Second Auto-Carousel
         ===================================================================== */}
      <section className="py-8 sm:py-12 lg:py-20 border-b border-[#141413]/10 bg-[#F4F3EF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-8">
            <div>
              <p className="text-xs font-mono-num uppercase tracking-[0.18em] text-[#6E6D68] mb-1">
                {t.section02Kicker}
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                {t.section02Title}
              </h2>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-end">
              <button
                onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
                className="inline-flex items-center gap-1.5 text-xs font-mono-num uppercase tracking-[0.16em] text-[#141413] hover:opacity-70 cursor-pointer whitespace-nowrap"
              >
                <span>
                  {t.browseFullArchive} ({blogPosts.length})
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Filter Controls for Blog Features */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-4 sm:mb-6 border-b border-[#141413]/10">
            <button
              onClick={() => {
                setActiveFeatureCategory('all');
                setBlogCarouselIdx(0);
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeFeatureCategory === 'all'
                  ? 'bg-[#141413] text-[#F4F3EF]'
                  : 'bg-[#EAE9E4] text-[#5E5D59] hover:text-[#141413]'
              }`}
            >
              {t.allFeaturedGuides}
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveFeatureCategory(cat.id);
                  setBlogCarouselIdx(0);
                }}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeFeatureCategory === cat.id
                    ? 'bg-[#141413] text-[#F4F3EF]'
                    : 'bg-[#EAE9E4] text-[#5E5D59] hover:text-[#141413]'
                }`}
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>

          {/* =================================================================
              MOBILE & TABLET VIEW: 2-SECOND AUTO-CAROUSEL (lg:hidden)
             ================================================================= */}
          <div
            className="lg:hidden"
            onTouchStart={() => setIsBlogPaused(true)}
            onTouchEnd={() => setIsBlogPaused(false)}
            onMouseEnter={() => setIsBlogPaused(true)}
            onMouseLeave={() => setIsBlogPaused(false)}
          >
            {/* Carousel Header Controls */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#141413]/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#141413] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-wider">
                  Story {(blogCarouselIdx % (featuredPosts.length || 1)) + 1} /{' '}
                  {featuredPosts.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevBlog}
                  aria-label="Previous featured story"
                  className="w-8 h-8 flex items-center justify-center border border-[#141413]/25 bg-[#F4F3EF] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextBlog}
                  aria-label="Next featured story"
                  className="w-8 h-8 flex items-center justify-center border border-[#141413]/25 bg-[#F4F3EF] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Carousel Slide Card — Compact & High-Impact */}
            {currentBlog && (
              <AnimatePresence mode="wait">
                <motion.article
                  key={currentBlog.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#EAE9E4]/60 border border-[#141413]/15 p-3.5 sm:p-5 shadow-xs"
                >
                  <button
                    onClick={() =>
                      navigate({
                        page: 'blog-detail',
                        blogId: currentBlog.id,
                      })
                    }
                    className="w-full aspect-[16/9] overflow-hidden bg-[#F4F3EF] border border-[#141413]/10 mb-3 block cursor-pointer text-left"
                  >
                    <StudioImage
                      src={currentBlog.image}
                      alt={currentBlog.title}
                      width={640}
                      height={360}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover"
                      disableCutout
                    />
                  </button>

                  <div className="flex items-center justify-between gap-2 text-xs text-[#5E5D59] mb-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold text-[#D94E34]">
                        {currentBlog.categoryName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">
                        {currentBlog.subCategoryName}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono-num text-[11px]">
                      {currentBlog.readTime}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate({
                        page: 'blog-detail',
                        blogId: currentBlog.id,
                      })
                    }
                    className="text-left block cursor-pointer"
                  >
                    <h3 className="font-editorial text-xl sm:text-2xl text-[#141413] leading-snug hover:opacity-75 transition-opacity line-clamp-2">
                      {currentBlog.title}
                    </h3>
                  </button>

                  <p className="text-xs text-[#5E5D59] mt-1.5 leading-relaxed line-clamp-2">
                    {currentBlog.excerpt}
                  </p>

                  <div className="pt-3 mt-3 border-t border-[#141413]/10 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#6E6D68] truncate">
                      {currentBlog.author} · {currentBlog.publishedDate}
                    </span>

                    <button
                      onClick={() =>
                        navigate({
                          page: 'blog-detail',
                          blogId: currentBlog.id,
                        })
                      }
                      className="px-3 py-1.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1 hover:bg-[#2B2B28] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>{t.readFullStory}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.article>
              </AnimatePresence>
            )}

            {/* Quick Slide Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3.5">
              {featuredPosts.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setBlogCarouselIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 transition-all rounded-full cursor-pointer ${
                    blogCarouselIdx % (featuredPosts.length || 1) === i
                      ? 'w-6 bg-[#141413]'
                      : 'w-2 bg-[#141413]/25'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* =================================================================
              DESKTOP VIEW: 4-COLUMN GRID (hidden lg:grid)
             ================================================================= */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {featuredPosts.map((post) => {
                const CategoryIcon =
                  SERVICE_CATEGORY_ICONS[post.categoryId] || BookOpen;
                return (
                  <motion.article
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#EAE9E4]/55 border border-[#141413]/10 p-4 flex flex-col justify-between group"
                  >
                    <div>
                      <button
                        onClick={() =>
                          navigate({
                            page: 'blog-detail',
                            blogId: post.id,
                          })
                        }
                        className="w-full aspect-[16/10] overflow-hidden bg-[#F4F3EF] border border-[#141413]/10 mb-3.5 block cursor-pointer text-left"
                      >
                        <StudioImage
                          src={post.image}
                          alt={post.title}
                          width={400}
                          height={250}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          disableCutout
                        />
                      </button>

                      {/* Unboxed Metadata with Typographic Separators */}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#5E5D59] mb-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-[#D94E34] truncate">
                            {post.categoryName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">
                            {post.subCategoryName}
                          </span>
                        </div>
                        <CategoryIcon className="w-3.5 h-3.5 text-[#141413] shrink-0" />
                      </div>

                      <button
                        onClick={() =>
                          navigate({
                            page: 'blog-detail',
                            blogId: post.id,
                          })
                        }
                        className="text-left block cursor-pointer"
                      >
                        <h3 className="font-editorial text-xl text-[#141413] leading-snug group-hover:opacity-75 transition-opacity line-clamp-2">
                          {post.title}
                        </h3>
                      </button>

                      <p className="text-xs text-[#5E5D59] mt-2 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3.5 mt-4 border-t border-[#141413]/10 flex items-center justify-between">
                      <span className="text-[11px] font-mono-num text-[#6E6D68]">
                        {post.readTime} · {post.publishedDate}
                      </span>

                      <button
                        onClick={() =>
                          navigate({
                            page: 'blog-detail',
                            blogId: post.id,
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold group-hover:translate-x-0.5 transition-transform cursor-pointer"
                      >
                        <span>{t.readGuide}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =====================================================================
          03. COMPLETE SERVICE & SUB-CATEGORY DIRECTORY
          Desktop: 4-Column Grid | Mobile & Tablet: 2-Second Auto-Carousel
         ===================================================================== */}
      <section className="py-8 sm:py-12 lg:py-20 border-b border-[#141413]/10 bg-[#EAE9E4]/35">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-10">
            <div>
              <p className="text-xs font-mono-num uppercase tracking-[0.18em] text-[#6E6D68] mb-1">
                {t.section03Kicker}
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                {t.section03Title}
              </h2>
            </div>
            <p className="text-xs text-[#5E5D59] max-w-md">
              Select any service pillar to open its Sub-Category Selection Page,
              or click a specific sub-category to view its full procedural
              checklist.
            </p>
          </div>

          {/* =================================================================
              MOBILE & TABLET VIEW: 2-SECOND AUTO-CAROUSEL (lg:hidden)
             ================================================================= */}
          <div
            className="lg:hidden"
            onTouchStart={() => setIsServicePaused(true)}
            onTouchEnd={() => setIsServicePaused(false)}
            onMouseEnter={() => setIsServicePaused(true)}
            onMouseLeave={() => setIsServicePaused(false)}
          >
            {/* Carousel Header Controls */}
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#141413]/10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#D94E34] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-wider font-semibold">
                  Pillar{' '}
                  {(serviceCarouselIdx % (serviceCategories.length || 1)) + 1} /{' '}
                  {serviceCategories.length}
                </span>
                <span className="text-[10px] font-mono-num text-[#6E6D68] truncate">
                  {currentService.shortLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevService}
                  aria-label="Previous service category"
                  className="w-8 h-8 flex items-center justify-center border border-[#141413]/25 bg-[#F4F3EF] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextService}
                  aria-label="Next service category"
                  className="w-8 h-8 flex items-center justify-center border border-[#141413]/25 bg-[#F4F3EF] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Service Carousel Slide Card */}
            {currentService && (
              <AnimatePresence mode="wait">
                {(() => {
                  const CurrentIcon =
                    SERVICE_CATEGORY_ICONS[currentService.id] || BookOpen;
                  const currentIdx =
                    serviceCarouselIdx % serviceCategories.length;
                  return (
                    <motion.div
                      key={currentService.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-[#F4F3EF] border border-[#141413]/15 p-4 sm:p-6 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono-num text-[#D94E34] font-semibold">
                            0{currentIdx + 1} · {currentService.agencyBadge}
                          </span>
                          <div className="w-8 h-8 bg-[#EAE9E4] flex items-center justify-center text-[#141413]">
                            <CurrentIcon className="w-4 h-4" />
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate({
                              page: 'service-subcategories',
                              serviceId: currentService.id,
                            })
                          }
                          className="text-left block cursor-pointer group"
                        >
                          <h3 className="font-editorial text-2xl text-[#141413] group-hover:underline">
                            {currentService.name}
                          </h3>
                        </button>

                        <p className="text-xs text-[#5E5D59] mt-1.5 leading-relaxed line-clamp-2">
                          {currentService.heroSubtitle}
                        </p>

                        {/* Interactive Sub-Category Links (Top 4 for space efficiency) */}
                        <div className="mt-4 pt-3 border-t border-[#141413]/10">
                          <p className="text-[10px] font-mono-num uppercase tracking-[0.16em] text-[#6E6D68] mb-1.5">
                            Sub-Categories ({currentService.subCategories.length})
                          </p>
                          <ul className="space-y-1">
                            {currentService.subCategories
                              .slice(0, 4)
                              .map((sub) => (
                                <li key={sub.id}>
                                  <button
                                    onClick={() =>
                                      navigate({
                                        page: 'service-detail',
                                        serviceId: currentService.id,
                                        subCategoryId: sub.id,
                                      })
                                    }
                                    className="w-full text-left py-1 px-2 bg-[#EAE9E4]/50 hover:bg-[#141413] hover:text-[#F4F3EF] text-xs text-[#141413] transition-colors flex items-center justify-between group cursor-pointer"
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      <CheckCircle2 className="w-3 h-3 text-[#D94E34] shrink-0" />
                                      <span className="truncate font-medium">
                                        {sub.name}
                                      </span>
                                    </span>
                                    <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                                  </button>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#141413]/10">
                        <button
                          onClick={() =>
                            navigate({
                              page: 'service-subcategories',
                              serviceId: currentService.id,
                            })
                          }
                          className="w-full py-2.5 px-3 bg-[#141413] text-[#F4F3EF] flex items-center justify-between text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] cursor-pointer"
                        >
                          <span>
                            Explore All {currentService.shortLabel} Sub-Categories
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            )}

            {/* Quick Service Indicator Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3.5">
              {serviceCategories.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setServiceCarouselIdx(i)}
                  aria-label={`Go to service ${s.name}`}
                  className={`h-1.5 transition-all rounded-full cursor-pointer ${
                    serviceCarouselIdx % (serviceCategories.length || 1) === i
                      ? 'w-6 bg-[#D94E34]'
                      : 'w-2 bg-[#141413]/25'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* =================================================================
              DESKTOP VIEW: 4-COLUMN GRID (hidden lg:grid)
             ================================================================= */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5">
            {serviceCategories.map((svc, idx) => {
              const IconComp = SERVICE_CATEGORY_ICONS[svc.id] || BookOpen;
              return (
                <div
                  key={svc.id}
                  className="bg-[#F4F3EF] border border-[#141413]/12 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono-num text-[#D94E34]">
                        0{idx + 1} · {svc.agencyBadge}
                      </span>
                      <div className="w-8 h-8 bg-[#EAE9E4] flex items-center justify-center text-[#141413]">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate({
                          page: 'service-subcategories',
                          serviceId: svc.id,
                        })
                      }
                      className="text-left block cursor-pointer group"
                    >
                      <h3 className="font-editorial text-2xl text-[#141413] group-hover:underline">
                        {svc.name}
                      </h3>
                    </button>

                    <p className="text-xs text-[#5E5D59] mt-1.5 leading-relaxed">
                      {svc.heroSubtitle}
                    </p>

                    <ul className="mt-4 pt-3 border-t border-[#141413]/10 space-y-1.5">
                      {svc.subCategories.map((sub) => (
                        <li key={sub.id}>
                          <button
                            onClick={() =>
                              navigate({
                                page: 'service-detail',
                                serviceId: svc.id,
                                subCategoryId: sub.id,
                              })
                            }
                            className="w-full text-left py-1 text-xs text-[#141413] hover:text-[#D94E34] transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3 h-3 text-[#6E6D68] group-hover:text-[#D94E34] shrink-0" />
                              <span className="truncate">{sub.name}</span>
                            </span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() =>
                      navigate({
                        page: 'service-subcategories',
                        serviceId: svc.id,
                      })
                    }
                    className="mt-5 pt-3 border-t border-[#141413]/10 w-full flex items-center justify-between text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 cursor-pointer"
                  >
                    <span>{t.chooseSubCategory}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          04. FREE CONSULTATION & ADVISORY CALLOUT STRIP
         ===================================================================== */}
      <section className="py-10 sm:py-14 lg:py-20 bg-[#141413] text-[#F4F3EF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#D94E34]">
              SERIKALI GUIDE ADVISORY DESK · NAIROBI, KENYA
            </p>
            <h2
              className="font-editorial text-2xl sm:text-4xl lg:text-5xl leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Need personalized assistance with a Work Permit, Company
              Registration, NGO Filing, or KRA Compliance?
            </h2>
            <p className="text-xs sm:text-sm text-[#A09F99] max-w-2xl leading-relaxed">
              Speak directly with our Kenyan immigration, corporate law, and tax
              specialists. We review your documentation checklist and guide your
              submission across eCitizen, eFNS, iTax, and PBORA.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-end">
            <button
              onClick={() => navigate({ page: 'consultation' })}
              className="px-5 py-3 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.18em] font-semibold hover:bg-[#C04129] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.navFreeConsultation}</span>
            </button>
            <button
              onClick={() => navigate({ page: 'contact' })}
              className="px-5 py-3 border border-[#F4F3EF]/25 text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.18em] hover:border-[#F4F3EF] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Contact Our Nairobi Office</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
