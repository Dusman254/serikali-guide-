import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Heart,
  Landmark,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import { useServiceJourney } from '../context/ServiceJourneyContext';
import { ServiceCategoryId } from '../data/serikaliData';
import { SERVICE_CATEGORY_ICONS } from './ShowroomStage';
import { StudioImage } from './StudioImage';
import { trackEvent } from '../utils/analytics';
import { BlogsIndexSkeleton } from './Skeletons';
import { DETAILED_SERVICE_RESULTS } from '../data/serviceKnowledgeBase';

/* ============================================================================
   0. FULL-PAGE SERVICE SUB-CATEGORY SELECTION VIEW
   (Opened when clicking a Service Category on the Hanger Rail)
   ============================================================================ */
export const ServiceSubCategoriesView: React.FC<{
  serviceId: ServiceCategoryId;
}> = ({ serviceId }) => {
  const { navigate } = useStore();
  const { serviceCategories, blogPosts, t, openGetStarted } = useSerikali();

  const service =
    serviceCategories.find((s) => s.id === serviceId) || serviceCategories[0];
  const ServiceIcon = SERVICE_CATEGORY_ICONS[service.id] || Landmark;

  const relatedBlogs = useMemo(
    () => blogPosts.filter((b) => b.categoryId === service.id).slice(0, 4),
    [blogPosts, service.id]
  );

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413]">
      {/* Breadcrumb Bar */}
      <div className="bg-[#EAE9E4] border-b border-[#141413]/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#5E5D59]">
            <button
              onClick={() => navigate({ page: 'home' })}
              className="hover:text-[#141413] cursor-pointer"
            >
              {t.navHome}
            </button>
            <span>/</span>
            <span className="text-[#141413] font-semibold">{service.name}</span>
            <span>/</span>
            <span className="text-[#D94E34] font-medium">
              {t.chooseSubCategory}
            </span>
          </div>

          <button
            onClick={() => navigate({ page: 'home' })}
            className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToHanger}</span>
          </button>
        </div>
      </div>

      {/* Main Category Switcher Strip */}
      <div className="border-b border-[#141413]/10 bg-[#F4F3EF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {serviceCategories.map((cat, idx) => {
            const isCurrent = cat.id === service.id;
            return (
              <button
                key={cat.id}
                onClick={() =>
                  navigate({
                    page: 'service-subcategories',
                    serviceId: cat.id,
                  })
                }
                className={`px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#141413] text-[#F4F3EF]'
                    : 'bg-[#EAE9E4] text-[#5E5D59] hover:text-[#141413]'
                }`}
              >
                <span className="font-mono-num text-[10px] opacity-70">
                  0{idx + 1}.
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Header Banner */}
      <section className="border-b border-[#141413]/10 py-10 sm:py-14 bg-[#EAE9E4]/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num uppercase tracking-[0.16em] text-[#D94E34]">
              <ServiceIcon className="w-4 h-4" />
              <span>{service.agency}</span>
              <span>·</span>
              <span className="text-[#141413]">
                {service.subCategories.length} {t.subCategoriesCount}
              </span>
            </div>

            <h1
              className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#141413] leading-[1.05]"
              style={{ textWrap: 'balance' }}
            >
              {service.name} — {t.chooseSubCategory}
            </h1>

            <p className="text-sm sm:text-base text-[#5E5D59] max-w-2xl leading-relaxed">
              {service.overview}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openGetStarted(service.id)}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] font-semibold hover:bg-[#2B2B28] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>GET STARTED · ASSISTED APPLICATION</span>
                <ArrowRight className="w-4 h-4 text-[#D94E34]" />
              </button>
              <button
                onClick={() =>
                  navigate({
                    page: 'consultation',
                    preselectedServiceId: service.id,
                  })
                }
                className="px-5 py-3 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-[0.16em] hover:bg-[#EAE9E4] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#D94E34]" />
                <span>{t.bookConsultationFor} {service.shortLabel}</span>
              </button>
              <button
                onClick={() =>
                  navigate({
                    page: 'blogs',
                    categoryId: service.id,
                  })
                }
                className="px-5 py-3 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-[0.16em] hover:border-[#141413] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{service.shortLabel} Blog Guides</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[16/10] bg-[#EAE9E4] border border-[#141413]/12 overflow-hidden">
              <StudioImage
                src={service.heroImage}
                alt={service.name}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
                disableCutout
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sub-Category Selection Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-xs font-mono-num uppercase tracking-[0.18em] text-[#D94E34] mb-1">
            SELECT A SUB-CATEGORY BELOW
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
            {service.name} Sub-Categories ({service.subCategories.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#5E5D59] mt-1">
            Click any sub-category below to open its full requirements checklist,
            statutory fees, official government portal, and step-by-step filing procedure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {service.subCategories.map((sub, idx) => (
            <div
              key={sub.id}
              onClick={() =>
                navigate({
                  page: 'service-detail',
                  serviceId: service.id,
                  subCategoryId: sub.id,
                })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate({
                    page: 'service-detail',
                    serviceId: service.id,
                    subCategoryId: sub.id,
                  });
                }
              }}
              className="bg-[#EAE9E4]/55 hover:bg-[#EAE9E4] border border-[#141413]/14 hover:border-[#141413] p-6 flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono-num text-[#D94E34] font-semibold">
                    SUB-CATEGORY 0{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono-num text-[#5E5D59] bg-[#F4F3EF] px-2.5 py-1 border border-[#141413]/10">
                    {sub.timeline}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl text-[#141413] group-hover:underline">
                  {sub.name}
                </h3>

                <p className="text-xs sm:text-sm text-[#5E5D59] mt-2 leading-relaxed">
                  {sub.summary}
                </p>

                <div className="mt-4 pt-3 border-t border-[#141413]/10 space-y-1.5">
                  <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Key Requirements ({sub.requirements.length})
                  </p>
                  <ul className="space-y-1 text-xs text-[#141413]">
                    {sub.requirements.slice(0, 3).map((req, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6F43] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-3.5 border-t border-[#141413]/12 flex items-center justify-between">
                <span className="text-[11px] font-mono-num text-[#6E6D68] truncate max-w-[180px]">
                  Portal: {sub.portal}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold group-hover:text-[#D94E34]">
                  <span>Open Full Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Related Blog Guides for this Category (4-Column Grid) */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#141413]/12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-mono-num uppercase tracking-[0.16em] text-[#6E6D68]">
                  RELATED EDITORIAL GUIDES
                </p>
                <h3 className="font-editorial text-3xl text-[#141413]">
                  {service.name} Blog Articles
                </h3>
              </div>
              <button
                onClick={() =>
                  navigate({ page: 'blogs', categoryId: service.id })
                }
                className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedBlogs.map((blog) => (
                <div
                  key={blog.id}
                  onClick={() =>
                    navigate({ page: 'blog-detail', blogId: blog.id })
                  }
                  className="bg-[#EAE9E4]/50 border border-[#141413]/10 p-4 flex flex-col justify-between cursor-pointer hover:border-[#141413] transition-colors group"
                >
                  <div>
                    <p className="text-[11px] font-mono-num text-[#D94E34] mb-1">
                      {blog.subCategoryName} · {blog.readTime}
                    </p>
                    <h4 className="font-editorial text-xl text-[#141413] group-hover:underline line-clamp-2">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-[#5E5D59] mt-2 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-[#141413]/10 flex items-center justify-between text-xs font-mono-num uppercase tracking-wider text-[#141413]">
                    <span>{t.readGuide}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

/* ============================================================================
   1. FULL-PAGE SERVICE DETAIL VIEW (Includes Subcategories & Prominent CTAs)
   ============================================================================ */
export const ServiceDetailView: React.FC<{
  serviceId: ServiceCategoryId;
  subCategoryId?: string;
}> = ({ serviceId, subCategoryId }) => {
  const { navigate, showToast } = useStore();
  const { serviceCategories, blogPosts, addInquiry, openGetStarted } = useSerikali();
  const { openAssistant, startServiceJourney } = useServiceJourney();

  const service =
    serviceCategories.find((s) => s.id === serviceId) || serviceCategories[0];

  const [activeSubId, setActiveSubId] = useState<string>(
    subCategoryId && service.subCategories.some((s) => s.id === subCategoryId)
      ? subCategoryId
      : service.subCategories[0].id
  );

  useEffect(() => {
    if (
      subCategoryId &&
      service.subCategories.some((s) => s.id === subCategoryId)
    ) {
      setActiveSubId(subCategoryId);
    } else {
      setActiveSubId(service.subCategories[0].id);
    }
  }, [serviceId, subCategoryId, service]);

  const activeSub =
    service.subCategories.find((s) => s.id === activeSubId) ||
    service.subCategories[0];

  const relatedBlogs = useMemo(
    () => blogPosts.filter((b) => b.categoryId === service.id),
    [blogPosts, service.id]
  );

  const ServiceIcon = SERVICE_CATEGORY_ICONS[service.id] || Landmark;

  // Quick Action Call-Back Form state on Service Detail
  const [quickName, setQuickName] = useState('');
  const [quickContact, setQuickContact] = useState('');
  const [quickSubmitted, setQuickSubmitted] = useState(false);

  const handleQuickActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickContact.trim()) {
      showToast('Please enter your name and phone or email.');
      return;
    }
    addInquiry({
      fullName: quickName.trim(),
      email: quickContact.includes('@') ? quickContact.trim() : 'Callback Request',
      phone: quickContact.trim(),
      topic: `${service.name} — ${activeSub.name}`,
      message: `Fast-track callback requested from ${activeSub.name} service detail page.`,
      source: 'Service Detail Callback',
    });
    setQuickSubmitted(true);
    showToast(
      `Inquiry logged for ${activeSub.name}. Our specialist will contact you shortly.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413]">
      {/* Breadcrumb & Practice Area Switcher Bar */}
      <div className="bg-[#EAE9E4] border-b border-[#141413]/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#5E5D59]">
            <button
              onClick={() => navigate({ page: 'home' })}
              className="hover:text-[#141413] cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span>Services</span>
            <span>/</span>
            <span className="text-[#141413] font-semibold">{service.name}</span>
            <span>/</span>
            <span className="text-[#D94E34] font-medium">{activeSub.name}</span>
          </div>

          <button
            onClick={() => navigate({ page: 'home' })}
            className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hanger Overview</span>
          </button>
        </div>
      </div>

      {/* Service Hero Section with Primary Call To Action Buttons */}
      <section className="border-b border-[#141413]/10 py-10 sm:py-14 bg-[#F4F3EF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num text-[#5E5D59]">
              <ServiceIcon className="w-4 h-4 text-[#D94E34]" />
              <span className="uppercase tracking-wider text-[#141413] font-semibold">
                {service.agency}
              </span>
              <span aria-hidden="true">·</span>
              <span>{service.subCategories.length} Specialized Sub-Services</span>
            </div>

            <h1
              className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#141413] leading-[1.06]"
              style={{ textWrap: 'balance' }}
            >
              {service.name}
            </h1>

            <p className="text-sm sm:text-base text-[#5E5D59] max-w-2xl leading-relaxed">
              {service.description}
            </p>

            {/* Primary Service Detail Call To Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openGetStarted(activeSub.id || service.id)}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] font-semibold hover:bg-[#2B2B28] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-sm"
              >
                <span>GET STARTED · ASSISTED APPLICATION</span>
                <ArrowRight className="w-4 h-4 text-[#D94E34]" />
              </button>

              <button
                onClick={() =>
                  navigate({
                    page: 'consultation',
                    preselectedServiceId: service.id,
                    preselectedSubCategory: activeSub.name,
                  })
                }
                className="px-5 py-3 border border-[#141413]/30 text-[#141413] text-xs font-mono-num uppercase tracking-[0.16em] hover:bg-[#EAE9E4] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 text-[#D94E34]" />
                <span>Book Consultation</span>
              </button>

              <a
                href={`https://wa.me/254795762978?text=${encodeURIComponent(
                  `Hello Serikali Guide! I need assistance with ${service.name} — ${activeSub.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#1F6F43] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] hover:bg-[#185835] transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp (0795762978)</span>
              </a>

              <button
                onClick={() => navigate({ page: 'contact' })}
                className="px-5 py-3 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-[0.16em] hover:border-[#141413] transition-colors cursor-pointer whitespace-nowrap"
              >
                Request Custom Quote
              </button>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="aspect-[4/3] bg-[#EAE9E4] border border-[#141413]/12 overflow-hidden">
              <StudioImage
                src={service.heroImage}
                alt={service.name}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
                disableCutout
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Subcategories Navigation + Active Subcategory Deep-Dive */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: Sub-Categories Selector & Other Main Services */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#EAE9E4]/70 border border-[#141413]/12 p-5">
              <p className="text-xs font-mono-num uppercase tracking-[0.16em] text-[#6E6D68] mb-3">
                {service.name} Sub-Categories
              </p>
              <div className="space-y-1.5">
                {service.subCategories.map((sub, idx) => {
                  const isActive = sub.id === activeSub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubId(sub.id);
                        setQuickSubmitted(false);
                      }}
                      className={`w-full px-3.5 py-3 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#141413] text-[#F4F3EF]'
                          : 'bg-[#F4F3EF] text-[#141413] hover:bg-[#141413]/5 border border-[#141413]/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono-num text-xs ${
                            isActive ? 'text-[#D94E34]' : 'text-[#8E8D87]'
                          }`}
                        >
                          0{idx + 1}.
                        </span>
                        <span className="text-sm font-medium truncate">
                          {sub.name}
                        </span>
                      </div>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-[#F4F3EF]' : 'text-[#6E6D68]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Action Request Box in Sidebar */}
            <div className="bg-[#141413] text-[#F4F3EF] p-5 space-y-4">
              <p className="text-xs font-mono-num uppercase tracking-[0.16em] text-[#D94E34]">
                Fast-Track Filing Support
              </p>
              <h3 className="font-editorial text-2xl text-[#F4F3EF]">
                Start Your {activeSub.name} Application Today
              </h3>
              <p className="text-xs text-[#F4F3EF]/80 leading-relaxed">
                Leave your contact details for an immediate document checklist
                review or book a full 30-minute consultation.
              </p>

              {quickSubmitted ? (
                <div className="p-4 bg-[#1F6F43]/30 border border-[#1F6F43] text-xs space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5 text-[#F4F3EF]">
                    <CheckCircle2 className="w-4 h-4 text-[#36B37E]" />
                    <span>Request Received for {activeSub.name}</span>
                  </p>
                  <p className="text-[#F4F3EF]/80">
                    Thank you, {quickName}. A specialist will reach out via{' '}
                    {quickContact}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuickActionSubmit} className="space-y-2.5">
                  <input
                    type="text"
                    required
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 bg-[#F4F3EF]/10 border border-[#F4F3EF]/20 text-xs text-[#F4F3EF] placeholder:text-[#F4F3EF]/50 focus:outline-none focus:border-[#F4F3EF]"
                  />
                  <input
                    type="text"
                    required
                    value={quickContact}
                    onChange={(e) => setQuickContact(e.target.value)}
                    placeholder="Phone / WhatsApp or Email"
                    className="w-full px-3 py-2 bg-[#F4F3EF]/10 border border-[#F4F3EF]/20 text-xs text-[#F4F3EF] placeholder:text-[#F4F3EF]/50 focus:outline-none focus:border-[#F4F3EF]"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#D94E34] hover:bg-[#c04129] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Request Callback &amp; Checklist
                  </button>
                </form>
              )}

              <div className="pt-2 border-t border-[#F4F3EF]/15">
                <button
                  onClick={() =>
                    navigate({
                      page: 'consultation',
                      preselectedServiceId: service.id,
                      preselectedSubCategory: activeSub.name,
                    })
                  }
                  className="w-full py-2.5 px-4 border border-[#F4F3EF]/30 hover:border-[#F4F3EF] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Free Consultation</span>
                </button>
              </div>
            </div>

            {/* Switch to Another Practice Area */}
            <div className="bg-[#EAE9E4]/50 border border-[#141413]/10 p-5">
              <p className="text-xs font-mono-num uppercase tracking-[0.16em] text-[#6E6D68] mb-3">
                All Service Categories ({serviceCategories.length})
              </p>
              <div className="space-y-1">
                {serviceCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      navigate({
                        page: 'service-subcategories',
                        serviceId: cat.id,
                      })
                    }
                    className={`w-full py-1.5 px-2 text-left text-xs flex items-center justify-between cursor-pointer ${
                      cat.id === service.id
                        ? 'font-semibold text-[#D94E34]'
                        : 'text-[#5E5D59] hover:text-[#141413]'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT MAIN COLUMN: Full-Page Sub-Category Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#EAE9E4]/55 border border-[#141413]/12 p-6 sm:p-8 space-y-6">
              <div className="pb-5 border-b border-[#141413]/10">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num text-[#6E6D68] mb-2">
                  <span className="text-[#D94E34] font-semibold">
                    {service.name}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeSub.statutoryNote}</span>
                </div>

                <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
                  {activeSub.name}
                </h2>

                <p className="text-sm sm:text-base text-[#5E5D59] mt-2 leading-relaxed">
                  {activeSub.summary}
                </p>
              </div>

              {/* Key Statutory Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#F4F3EF] border border-[#141413]/10">
                  <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Official Government Portal
                  </p>
                  <p className="text-sm font-semibold text-[#141413] mt-1">
                    {activeSub.portal}
                  </p>
                </div>

                <div className="p-4 bg-[#F4F3EF] border border-[#141413]/10">
                  <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Estimated Processing Time
                  </p>
                  <p className="text-sm font-semibold text-[#141413] mt-1 font-mono-num">
                    {activeSub.timeline}
                  </p>
                </div>

                <div className="p-4 bg-[#F4F3EF] border border-[#141413]/10">
                  <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Filing Support
                  </p>
                  <p className="text-sm font-semibold text-[#1F6F43] mt-1">
                    End-to-End Advisory Available
                  </p>
                </div>
              </div>

              {/* Mandatory Requirements Checklist */}
              <div className="space-y-3 pt-2">
                <h3 className="font-editorial text-2xl text-[#141413]">
                  Mandatory Requirements &amp; Document Checklist
                </h3>
                <div className="bg-[#F4F3EF] border border-[#141413]/10 divide-y divide-[#141413]/8">
                  {activeSub.requirements.map((req, i) => (
                    <div
                      key={i}
                      className="p-3.5 flex items-start gap-3 text-xs sm:text-sm text-[#141413]"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Procedure */}
              <div className="space-y-4 pt-2">
                <h3 className="font-editorial text-2xl text-[#141413]">
                  Step-by-Step Application Procedure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSub.steps.map((step, i) => {
                    const title = typeof step === 'string' ? `Step ${i + 1}` : step.title;
                    const detail = typeof step === 'string' ? step : step.detail;
                    return (
                      <div
                        key={i}
                        className="p-4 bg-[#F4F3EF] border border-[#141413]/10 space-y-1.5"
                      >
                        <p className="text-sm font-semibold text-[#141413]">
                          {title}
                        </p>
                        {detail && (
                          <p className="text-xs text-[#5E5D59] leading-relaxed">
                            {detail}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Call To Action Banner inside Service Detail */}
              <div className="mt-6 p-6 bg-[#141413] text-[#F4F3EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34]">
                    Ready to Proceed with {activeSub.name}?
                  </p>
                  <h4 className="font-editorial text-2xl text-[#F4F3EF]">
                    Let our regulatory specialists review your dossier before
                    you submit.
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => openGetStarted(activeSub.id || service.id)}
                    className="px-5 py-3 bg-[#F4F3EF] hover:bg-[#EAE9E4] text-[#141413] text-xs font-mono-num uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <span>START APPLICATION</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D94E34]" />
                  </button>
                  <button
                    onClick={() =>
                      navigate({
                        page: 'consultation',
                        preselectedServiceId: service.id,
                        preselectedSubCategory: activeSub.name,
                      })
                    }
                    className="px-5 py-3 bg-[#D94E34] hover:bg-[#c04129] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Free Consultation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Related Blog Posts for this Service Category */}
            {relatedBlogs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#141413]">
                    Related {service.name} Blog Guides
                  </h3>
                  <button
                    onClick={() =>
                      navigate({ page: 'blogs', categoryId: service.id })
                    }
                    className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1 cursor-pointer"
                  >
                    <span>All Guides</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {relatedBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="p-5 bg-[#EAE9E4]/55 border border-[#141413]/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#6E6D68] mb-2">
                          <span>{blog.subCategoryName}</span>
                          <span>·</span>
                          <span>{blog.readTime}</span>
                        </div>
                        <button
                          onClick={() =>
                            navigate({ page: 'blog-detail', blogId: blog.id })
                          }
                          className="text-left block cursor-pointer group"
                        >
                          <h4 className="font-editorial text-2xl text-[#141413] group-hover:underline">
                            {blog.title}
                          </h4>
                        </button>
                        <p className="text-xs text-[#5E5D59] mt-2 line-clamp-2">
                          {blog.excerpt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#141413]/10 flex items-center justify-between">
                        <span className="text-xs text-[#6E6D68]">
                          {blog.author}
                        </span>
                        <button
                          onClick={() =>
                            navigate({ page: 'blog-detail', blogId: blog.id })
                          }
                          className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold flex items-center gap-1 hover:text-[#D94E34] cursor-pointer"
                        >
                          <span>Read Full Blog</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   2. FULL-PAGE BLOG DETAIL VIEW (Includes Interactive Donate Module & CTA)
   ============================================================================ */
export const BlogDetailView: React.FC<{ blogId: string }> = ({ blogId }) => {
  const { navigate, showToast } = useStore();
  const { blogPosts, addDonation } = useSerikali();
  const donateSectionRef = useRef<HTMLDivElement>(null);

  const post =
    blogPosts.find((b) => b.id === blogId || b.slug === blogId) ||
    blogPosts[0];

  const relatedPosts = useMemo(
    () => blogPosts.filter((b) => b.id !== post.id).slice(0, 4),
    [blogPosts, post.id]
  );

  // Donation State on Blog Details
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<
    'M-Pesa Express' | 'Card / International' | 'PayPal'
  >('M-Pesa Express');
  const [donorName, setDonorName] = useState<string>('');
  const [donorPhoneOrEmail, setDonorPhoneOrEmail] = useState<string>('');
  const [donorNote, setDonorNote] = useState<string>('');
  const [donationReceipt, setDonationReceipt] = useState<{
    ref: string;
    amount: number;
    method: string;
    name: string;
  } | null>(null);

  const effectiveDonationAmount = customAmount.trim()
    ? Math.max(50, Number(customAmount) || 0)
    : selectedAmount;

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveDonationAmount <= 0) {
      showToast('Please select or enter a valid donation amount.');
      return;
    }
    const created = addDonation({
      donorName: donorName.trim() || 'Supporter',
      contact: donorPhoneOrEmail.trim() || 'Anonymous',
      amount: effectiveDonationAmount,
      method: paymentMethod,
      blogTitle: post.title,
      note: donorNote.trim(),
    });
    setDonationReceipt({
      ref: created.reference,
      amount: effectiveDonationAmount,
      method: paymentMethod,
      name: donorName.trim() || 'Supporter',
    });
    showToast(
      `Thank you for donating KSh ${effectiveDonationAmount.toLocaleString()} to Serikali Guide!`
    );
  };

  const scrollToDonate = () => {
    donateSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413]">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="bg-[#EAE9E4] border-b border-[#141413]/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#5E5D59] truncate">
            <button
              onClick={() => navigate({ page: 'home' })}
              className="hover:text-[#141413] cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
              className="hover:text-[#141413] cursor-pointer"
            >
              Blogs
            </button>
            <span>/</span>
            <button
              onClick={() =>
                navigate({
                  page: 'service-detail',
                  serviceId: post.categoryId,
                })
              }
              className="hover:text-[#141413] text-[#141413] font-medium cursor-pointer"
            >
              {post.categoryName}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToDonate}
              className="px-3.5 py-1.5 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#c04129] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Donate to Support Guides</span>
            </button>

            <button
              onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
              className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Blogs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article Header & Reading Canvas */}
      <article className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          {/* Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5E5D59] mb-4">
            <button
              onClick={() =>
                navigate({
                  page: 'service-detail',
                  serviceId: post.categoryId,
                })
              }
              className="font-semibold text-[#D94E34] hover:underline cursor-pointer"
            >
              {post.categoryName}
            </button>
            <span aria-hidden="true">·</span>
            <span>{post.subCategoryName}</span>
            <span aria-hidden="true">·</span>
            <span>{post.publishedDate}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-num text-[#141413]">
              Portal: {post.officialPortal}
            </span>
          </div>

          <h1
            className="font-editorial text-4xl sm:text-5xl lg:text-[54px] text-[#141413] leading-[1.06]"
            style={{ textWrap: 'balance' }}
          >
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-[#5E5D59] mt-4 leading-relaxed">
            {post.subtitle}
          </p>

          {/* Author & Quick Donate Strip */}
          <div className="mt-6 py-4 border-y border-[#141413]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#141413]">
                Written by {post.author}
              </p>
              <p className="text-xs text-[#6E6D68]">
                {post.authorRole} · Verified for 2026 Kenyan Regulations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={scrollToDonate}
                className="px-4 py-2 bg-[#EAE9E4] hover:bg-[#141413] text-[#141413] hover:text-[#F4F3EF] border border-[#141413]/15 text-xs font-mono-num uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Heart className="w-3.5 h-3.5 text-[#D94E34]" />
                <span>Donate</span>
              </button>
              <button
                onClick={() =>
                  navigate({
                    page: 'consultation',
                    preselectedServiceId: post.categoryId,
                    preselectedSubCategory: post.subCategoryName,
                  })
                }
                className="px-4 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Free Consultation</span>
              </button>
            </div>
          </div>

          {/* Editorial Feature Image */}
          <div className="mt-8 aspect-[16/9] bg-[#EAE9E4] border border-[#141413]/10 overflow-hidden">
            <StudioImage
              src={post.image}
              alt={post.title}
              containerClassName="w-full h-full"
              className="w-full h-full object-cover"
              disableCutout
            />
          </div>
        </div>

        {/* Two-Column Asymmetric Reading Layout (Main Prose + Margin Sidebar) */}
        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Editorial Reading Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Key Regulatory Takeaways Box */}
            <div className="p-6 bg-[#EAE9E4]/70 border border-[#141413]/15 space-y-3">
              <p className="text-xs font-mono-num uppercase tracking-[0.18em] text-[#D94E34] font-semibold">
                Executive Summary &amp; Key Takeaways
              </p>
              <ul className="space-y-2 text-sm text-[#141413] leading-relaxed">
                {post.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Article Sections */}
            <div className="space-y-8 max-w-prose">
              {post.sections && post.sections.length > 0 ? (
                post.sections.map((sec, idx) => (
                  <section key={idx} className="space-y-4">
                    <h2 className="font-editorial text-2xl sm:text-3xl text-[#141413]">
                      {sec.heading}
                    </h2>
                    {sec.paragraphs.map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className={`text-sm sm:text-base text-[#2B2B28] leading-[1.8] ${
                          idx === 0 && pIdx === 0
                            ? 'first-letter:text-4xl first-letter:font-editorial first-letter:font-semibold first-letter:mr-2 first-letter:float-left first-letter:leading-none'
                            : ''
                        }`}
                      >
                        {p}
                      </p>
                    ))}

                    {sec.checklist && sec.checklist.length > 0 && (
                      <div className="p-5 bg-[#EAE9E4]/50 border border-[#141413]/10 space-y-2">
                        <p className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold">
                          Statutory Checklist
                        </p>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-[#141413]">
                          {sec.checklist.map((c, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-2">
                              <span className="font-mono-num text-[#D94E34]">
                                •
                              </span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {sec.callout && (
                      <blockquote className="p-4 border-l-2 border-[#D94E34] bg-[#EAE9E4]/40 text-xs sm:text-sm italic text-[#141413]">
                        {sec.callout}
                      </blockquote>
                    )}
                  </section>
                ))
              ) : post.content ? (
                <div className="space-y-4 text-sm sm:text-base text-[#2B2B28] leading-[1.8] whitespace-pre-line">
                  {post.content}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-[#2B2B28] leading-[1.8]">
                  {post.excerpt}
                </p>
              )}
            </div>

            {/* ===============================================================
                DONATE SECTION ON BLOG DETAILS (Explicitly Required)
               =============================================================== */}
            <div
              ref={donateSectionRef}
              className="pt-8 border-t border-[#141413]/15"
            >
              <div className="bg-[#EAE9E4] border border-[#141413]/20 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#141413]/10">
                  <div>
                    <p className="text-xs font-mono-num uppercase tracking-[0.18em] text-[#D94E34] font-semibold flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>Support Serikali Guide · Reader Donation</span>
                    </p>
                    <h3 className="font-editorial text-3xl text-[#141413] mt-1">
                      Keep Our Immigration &amp; Civic Guides Free for Everyone
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#5E5D59] leading-relaxed">
                  Serikali Guide researches and updates Kenyan immigration,
                  eCitizen, KRA tax, and company registration guides so citizens,
                  NGOs, and newcomers can navigate government procedures without
                  hidden barriers. Your contribution directly funds independent
                  regulatory updates.
                </p>

                {donationReceipt ? (
                  <div className="p-6 bg-[#F4F3EF] border border-[#1F6F43] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-num uppercase tracking-wider text-[#1F6F43] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Donation Confirmed · Receipt {donationReceipt.ref}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setDonationReceipt(null)}
                        className="text-xs font-mono-num underline text-[#6E6D68] hover:text-[#141413] cursor-pointer"
                      >
                        Make Another Donation
                      </button>
                    </div>
                    <h4 className="font-editorial text-2xl text-[#141413]">
                      Asante Sana, {donationReceipt.name}!
                    </h4>
                    <p className="text-xs text-[#5E5D59]">
                      We have recorded your contribution of{' '}
                      <strong className="font-mono-num text-[#141413]">
                        KSh {donationReceipt.amount.toLocaleString()}
                      </strong>{' '}
                      via {donationReceipt.method}. Thank you for keeping
                      Serikali Guide independent and accessible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleDonateSubmit} className="space-y-5">
                    {/* Preset Donation Amounts */}
                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-2">
                        1. Select Donation Amount (KSh)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[500, 1000, 2500, 5000].map((amt) => {
                          const isSelected =
                            !customAmount.trim() && selectedAmount === amt;
                          return (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setSelectedAmount(amt);
                                setCustomAmount('');
                              }}
                              className={`py-2.5 px-3 text-xs font-mono-num font-semibold border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                                  : 'bg-[#F4F3EF] text-[#141413] border-[#141413]/15 hover:border-[#141413]'
                              }`}
                            >
                              KSh {amt.toLocaleString()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2.5">
                        <input
                          type="number"
                          min={50}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Or enter custom amount in KSh (e.g. 1500)..."
                          className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs font-mono-num text-[#141413] placeholder:text-[#8E8D87] focus:outline-none focus:border-[#141413]"
                        />
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-2">
                        2. Choose Payment Method
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {(
                          [
                            'M-Pesa Express',
                            'Card / International',
                            'PayPal',
                          ] as const
                        ).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`py-2.5 px-3 text-xs font-medium border transition-colors cursor-pointer ${
                              paymentMethod === method
                                ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                                : 'bg-[#F4F3EF] text-[#141413] border-[#141413]/15 hover:border-[#141413]'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Supporter Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Your Name (Optional)"
                        className="px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] placeholder:text-[#8E8D87] focus:outline-none focus:border-[#141413]"
                      />
                      <input
                        type="text"
                        value={donorPhoneOrEmail}
                        onChange={(e) => setDonorPhoneOrEmail(e.target.value)}
                        placeholder={
                          paymentMethod === 'M-Pesa Express'
                            ? 'M-Pesa Phone Number (e.g. 0712...)'
                            : 'Email for Donation Receipt'
                        }
                        className="px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] placeholder:text-[#8E8D87] focus:outline-none focus:border-[#141413]"
                      />
                    </div>

                    <input
                      type="text"
                      value={donorNote}
                      onChange={(e) => setDonorNote(e.target.value)}
                      placeholder="Leave an optional note or suggest a future guide topic..."
                      className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] placeholder:text-[#8E8D87] focus:outline-none focus:border-[#141413]"
                    />

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 bg-[#D94E34] hover:bg-[#c04129] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span>
                        Donate KSh {effectiveDonationAmount.toLocaleString()}{' '}
                        Now
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Margin Sidebar: Related Service Desk & Quick Consultation */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-[#141413] text-[#F4F3EF] p-6 space-y-4">
              <p className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34]">
                Need Hands-On Filing Help?
              </p>
              <h3 className="font-editorial text-2xl text-[#F4F3EF]">
                {post.categoryName} Advisory Desk
              </h3>
              <p className="text-xs text-[#F4F3EF]/80 leading-relaxed">
                Our licensed specialists handle document preparation, eFNS/BRS
                uploads, and agency follow-ups for{' '}
                <strong>{post.subCategoryName}</strong>.
              </p>
              <button
                onClick={() =>
                  navigate({
                    page: 'service-detail',
                    serviceId: post.categoryId,
                  })
                }
                className="w-full py-2.5 px-4 bg-[#F4F3EF] text-[#141413] text-xs font-mono-num uppercase tracking-wider hover:bg-[#EAE9E4] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Open Service Details</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  navigate({
                    page: 'consultation',
                    preselectedServiceId: post.categoryId,
                    preselectedSubCategory: post.subCategoryName,
                  })
                }
                className="w-full py-2.5 px-4 bg-[#D94E34] hover:bg-[#c04129] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Book Free Consultation</span>
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Quick Donate Card */}
            <div className="p-5 bg-[#EAE9E4]/70 border border-[#141413]/12 space-y-3">
              <p className="text-xs font-mono-num uppercase tracking-wider text-[#141413] font-semibold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#D94E34]" />
                <span>Support Our Research</span>
              </p>
              <p className="text-xs text-[#5E5D59] leading-relaxed">
                Found this guide on <strong>{post.subCategoryName}</strong>{' '}
                helpful? Support our editorial team with a reader donation.
              </p>
              <button
                onClick={scrollToDonate}
                className="w-full py-2.5 px-4 border border-[#141413] text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider transition-colors cursor-pointer"
              >
                Donate to Serikali Guide
              </button>
            </div>
          </aside>
        </div>

        {/* Related Blog Posts Section */}
        <div className="max-w-5xl mx-auto mt-16 pt-10 border-t border-[#141413]/12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-editorial text-3xl text-[#141413]">
              Continue Reading on Serikali Guide
            </h2>
            <button
              onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
              className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1 cursor-pointer"
            >
              <span>All Blogs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Related Blog Posts: List Default on Mobile/Tablet (<lg), 4-Card Grid on Desktop (lg+) */}
          {/* Mobile & Tablet: List Layout Default */}
          <div className="lg:hidden space-y-3">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate({ page: 'blog-detail', blogId: rel.id })}
                className="bg-[#EAE9E4]/55 border border-[#141413]/10 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:border-[#141413] transition-colors"
              >
                <div className="w-24 sm:w-32 aspect-[4/3] shrink-0 overflow-hidden bg-[#F4F3EF] border border-[#141413]/10">
                  <StudioImage
                    src={rel.image}
                    alt={rel.title}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                    disableCutout
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[#6E6D68] mb-1">
                    <span className="text-[#D94E34] font-medium truncate">
                      {rel.categoryName}
                    </span>
                    <span>·</span>
                    <span className="shrink-0">{rel.readTime}</span>
                  </div>
                  <h3 className="font-editorial text-base sm:text-lg text-[#141413] line-clamp-2 leading-snug">
                    {rel.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono-num uppercase tracking-wider text-[#141413]">
                    <span>Read Article</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: 4-Card Grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                className="bg-[#EAE9E4]/55 border border-[#141413]/10 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#6E6D68] mb-2">
                    <span className="text-[#D94E34] font-medium">
                      {rel.categoryName}
                    </span>
                    <span>·</span>
                    <span>{rel.readTime}</span>
                  </div>
                  <button
                    onClick={() =>
                      navigate({ page: 'blog-detail', blogId: rel.id })
                    }
                    className="text-left block cursor-pointer group"
                  >
                    <h3 className="font-editorial text-2xl text-[#141413] group-hover:underline">
                      {rel.title}
                    </h3>
                  </button>
                  <p className="text-xs text-[#5E5D59] mt-2 line-clamp-2">
                    {rel.excerpt}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate({ page: 'blog-detail', blogId: rel.id })
                  }
                  className="mt-4 pt-3 border-t border-[#141413]/10 text-xs font-mono-num uppercase tracking-wider text-[#141413] flex items-center justify-between hover:text-[#D94E34] cursor-pointer"
                >
                  <span>Read Article</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

/* ============================================================================
   3. FULL-PAGE BLOGS LISTING VIEW
   ============================================================================ */
export const BlogsIndexView: React.FC<{
  initialCategoryId?: ServiceCategoryId | 'all';
  initialQuery?: string;
}> = ({ initialCategoryId = 'all', initialQuery = '' }) => {
  const { navigate } = useStore();
  const { blogPosts, serviceCategories, isBlogsLoading } = useSerikali();
  const [selectedCategory, setSelectedCategory] = useState<
    ServiceCategoryId | 'all'
  >(initialCategoryId);
  const [query, setQuery] = useState<string>(initialQuery);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024 ? 'list' : 'grid';
    }
    return 'list';
  });

  // Interactive scroll behavior: auto-hide category filter strip when reading down, reveal on scroll up
  const [isFilterBarVisible, setIsFilterBarVisible] = useState<boolean>(true);
  const lastScrollY = useRef<number>(0);
  const scrollTicking = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTicking.current) return;
      scrollTicking.current = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (currentY < 150) {
          setIsFilterBarVisible(true);
        } else if (delta > 8 && currentY > 200) {
          // Scrolled down -> disappear to give screen space
          setIsFilterBarVisible(false);
        } else if (delta < -8) {
          // Scrolled up -> reappear
          setIsFilterBarVisible(true);
        }

        lastScrollY.current = Math.max(0, currentY);
        scrollTicking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSelectedCategory(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const filteredBlogs = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCat =
        selectedCategory === 'all' || post.categoryId === selectedCategory;
      if (!matchesCat) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.subtitle.toLowerCase().includes(q) ||
        post.categoryName.toLowerCase().includes(q) ||
        post.subCategoryName.toLowerCase().includes(q) ||
        post.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [blogPosts, selectedCategory, query]);

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] py-6 sm:py-10 lg:py-14">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-5 sm:space-y-8">
        {/* Page Header */}
        <div className="pb-5 sm:pb-8 border-b border-[#141413]/12 flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
          <div>
            <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#D94E34] mb-2">
              SERIKALI GUIDE · EDITORIAL PUBLICATIONS
            </p>
            <h1 className="font-editorial text-4xl sm:text-6xl text-[#141413]">
              Immigration, Business &amp; Civic Blog
            </h1>
            <p className="text-sm text-[#5E5D59] mt-2 max-w-2xl">
              Verified procedural guides covering Kenyan work permits, visas,
              company registration, NGO compliance, KRA taxes, and eCitizen
              government services.
            </p>
          </div>

          {/* Search Input (No star icon) */}
          <div className="w-full lg:w-96 bg-[#EAE9E4] border border-[#141413]/20 flex items-center px-3.5 py-2.5 gap-2">
            <Search className="w-4 h-4 text-[#141413] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter articles by topic or keyword..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#141413] placeholder:text-[#787772] focus:outline-none"
            />
          </div>
        </div>

        {/* Interactive Sticky Category Filter Bar & List/Grid Layout Switcher */}
        <div
          className={`sticky top-0 z-30 bg-[#F4F3EF]/95 backdrop-blur-md transition-all duration-300 ${
            isFilterBarVisible ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 pt-1 border-b border-[#141413]/10">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#141413] text-[#F4F3EF]'
                    : 'bg-[#EAE9E4] text-[#5E5D59] hover:text-[#141413]'
                }`}
              >
                All Categories ({blogPosts.length})
              </button>
              {serviceCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#141413] text-[#F4F3EF]'
                      : 'bg-[#EAE9E4] text-[#5E5D59] hover:text-[#141413]'
                  }`}
                >
                  {cat.shortLabel}
                </button>
              ))}
            </div>

            {/* List vs Grid Layout Switcher (Defaults to List on Mobile & Tablet) */}
            <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto bg-[#EAE9E4] p-1 border border-[#141413]/15">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`px-2.5 py-1 text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#141413] text-[#F4F3EF] font-semibold shadow-xs'
                    : 'text-[#6E6D68] hover:text-[#141413]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`px-2.5 py-1 text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#141413] text-[#F4F3EF] font-semibold shadow-xs'
                    : 'text-[#6E6D68] hover:text-[#141413]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Blog Posts Display with Skeleton Loaders while fetching/syncing */}
        {isBlogsLoading && filteredBlogs.length === 0 ? (
          <div className="py-2">
            <BlogsIndexSkeleton viewMode={viewMode} />
          </div>
        ) : filteredBlogs.length > 0 ? (
          viewMode === 'list' ? (
            <div className="space-y-3">
              {filteredBlogs.map((post, idx) => (
                <article
                  key={post.id}
                  onClick={() =>
                    navigate({ page: 'blog-detail', blogId: post.id })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate({ page: 'blog-detail', blogId: post.id });
                    }
                  }}
                  className="bg-[#F4F3EF] border border-[#141413]/12 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 group cursor-pointer hover:border-[#141413] transition-colors"
                >
                  <div className="w-24 sm:w-32 aspect-[4/3] shrink-0 overflow-hidden bg-[#EAE9E4] border border-[#141413]/10">
                    <StudioImage
                      src={post.image}
                      alt={post.title}
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
                        {post.categoryName} · {post.subCategoryName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0">{post.readTime}</span>
                      <span aria-hidden="true" className="hidden sm:inline">
                        ·
                      </span>
                      <span className="hidden sm:inline shrink-0">
                        {post.publishedDate}
                      </span>
                    </div>

                    <h2 className="font-editorial text-base sm:text-lg text-[#141413] leading-snug group-hover:underline line-clamp-2">
                      {post.title}
                    </h2>

                    <div className="mt-2 flex items-center gap-1 text-[11px] font-mono-num uppercase tracking-wider text-[#141413] font-medium">
                      <span>Read Guide</span>
                      <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredBlogs.map((post) => {
                const IconComp =
                  SERVICE_CATEGORY_ICONS[post.categoryId] || BookOpen;
                return (
                  <article
                    key={post.id}
                    className="bg-[#EAE9E4]/55 border border-[#141413]/10 p-5 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#6E6D68] mb-3">
                        <span className="font-semibold text-[#141413]">
                          {post.categoryName} · {post.subCategoryName}
                        </span>
                        <IconComp className="w-4 h-4 text-[#6E6D68]" />
                      </div>

                      <button
                        onClick={() =>
                          navigate({ page: 'blog-detail', blogId: post.id })
                        }
                        className="w-full aspect-[4/3] bg-[#F4F3EF] overflow-hidden mb-4 block cursor-pointer"
                      >
                        <StudioImage
                          src={post.image}
                          alt={post.title}
                          width={400}
                          height={300}
                          containerClassName="w-full h-full"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          disableCutout
                        />
                      </button>

                      <div className="flex items-center gap-2 text-xs text-[#6E6D68] mb-1.5">
                        <span>{post.publishedDate}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>

                      <button
                        onClick={() =>
                          navigate({ page: 'blog-detail', blogId: post.id })
                        }
                        className="text-left block cursor-pointer"
                      >
                        <h2 className="font-editorial text-2xl text-[#141413] leading-snug group-hover:underline">
                          {post.title}
                        </h2>
                      </button>

                      <p className="text-xs text-[#5E5D59] mt-2 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-[#141413]/10 flex items-center justify-between">
                      <span className="text-xs text-[#6E6D68]">{post.author}</span>
                      <button
                        onClick={() =>
                          navigate({ page: 'blog-detail', blogId: post.id })
                        }
                        className="px-3.5 py-2 bg-[#141413] text-[#F4F3EF] text-[11px] font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>Read Full Guide</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : (
          <div className="p-12 bg-[#EAE9E4]/50 border border-[#141413]/10 text-center space-y-3">
            <h2 className="font-editorial text-3xl text-[#141413]">
              No matching blog guides found.
            </h2>
            <p className="text-xs text-[#5E5D59]">
              Try clearing your filter or searching for another service such as
              Work Permits, BRS, or KRA PIN.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setQuery('');
              }}
              className="px-5 py-2.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   4. FULL-PAGE ABOUT VIEW
   ============================================================================ */
export const AboutView: React.FC = () => {
  const { navigate } = useStore();
  const { serviceCategories } = useSerikali();

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-14">
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 border-b border-[#141413]/12">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#D94E34]">
              ABOUT SERIKALI GUIDE · YOUR ONE BORDER STOP POST
            </p>
            <h1
              className="font-editorial text-4xl sm:text-6xl text-[#141413] leading-[1.06]"
              style={{ textWrap: 'balance' }}
            >
              Clarity, Precision &amp; Trusted Guidance Across Every Kenyan
              Government Desk.
            </h1>
            <p className="text-sm sm:text-base text-[#5E5D59] leading-relaxed max-w-2xl">
              Serikali Guide is an independent immigration, corporate
              registration, and civic compliance publication and advisory
              practice based in Nairobi, Kenya. We bridge the gap between complex
              statutory regulations and real-world execution on eFNS, eCitizen
              BRS, PBORA, and KRA iTax.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate({ page: 'consultation' })}
                className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] hover:bg-[#2B2B28] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#D94E34]" />
                <span>Book a Free Consultation</span>
              </button>
              <button
                onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
                className="px-6 py-3 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-[0.16em] hover:border-[#141413] transition-colors cursor-pointer"
              >
                Read Our Blog Guides
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="aspect-[4/3] bg-[#EAE9E4] border border-[#141413]/12 overflow-hidden">
              <StudioImage
                src={serviceCategories[0].heroImage}
                alt="Serikali Guide Advisory Desk"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
                disableCutout
              />
            </div>
          </div>
        </div>

        {/* Quantitative Impact & Editorial Rigor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              metric: '8 Core Desks',
              label: '45 Specialized Sub-Categories',
              detail:
                'Covering Immigration, Companies, NGOs, Civil Documents, Licences, KRA Tax, Investment & eCitizen.',
            },
            {
              metric: '2,400+ Filings',
              label: 'Permits, Incorporations & PBOs Guided',
              detail:
                'Supporting expatriates, international NGOs, startups, and Kenyan diaspora families since 2021.',
            },
            {
              metric: '100% Verified',
              label: 'Statutory Checklists & Portals',
              detail:
                'Every blog article is audited against current Acts of Parliament and official eCitizen/eFNS workflows.',
            },
            {
              metric: '30-Min Free',
              label: 'Initial Regulatory Consultation',
              detail:
                'Direct access to immigration and corporate compliance specialists before you lodge your application.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-[#EAE9E4]/60 border border-[#141413]/10 space-y-2"
            >
              <p className="font-editorial text-4xl text-[#141413] font-mono-num">
                {item.metric}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#D94E34]">
                {item.label}
              </p>
              <p className="text-xs text-[#5E5D59] leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* All 8 Practice Areas Overview */}
        <div className="space-y-6">
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413]">
            Our Eight Practice Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceCategories.map((s, idx) => (
              <div
                key={s.id}
                className="p-5 bg-[#F4F3EF] border border-[#141413]/12 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono-num text-[#6E6D68]">
                    0{idx + 1}. {s.agency.split('·')[0]}
                  </span>
                  <h3 className="font-editorial text-2xl text-[#141413] mt-1">
                    {s.name}
                  </h3>
                  <p className="text-xs text-[#5E5D59] mt-2 leading-relaxed">
                    {s.editorialHeadline}
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate({ page: 'service-subcategories', serviceId: s.id })
                  }
                  className="mt-4 pt-3 border-t border-[#141413]/10 text-xs font-mono-num uppercase tracking-wider text-[#141413] flex items-center justify-between hover:text-[#D94E34] cursor-pointer"
                >
                  <span>Explore {s.subCategories.length} Sub-Services</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. FULL-PAGE CONTACT VIEW
   ============================================================================ */
export const ContactView: React.FC = () => {
  const { navigate, showToast } = useStore();
  const { serviceCategories, addInquiry } = useSerikali();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(serviceCategories[0]?.name || 'Immigration & Visas');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-spam trap
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formMountTime = useRef<number>(Date.now());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Honeypot spam bot trap
    if (honeypot.trim()) {
      setSubmitted(true);
      return;
    }

    // Minimum interaction speed check (< 600ms = bot)
    if (Date.now() - formMountTime.current < 600) {
      setSubmitted(true);
      return;
    }

    if (!fullName.trim()) {
      showToast('Please provide your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address (e.g. name@domain.com)');
      showToast('Please enter a valid email address.');
      return;
    }

    if (!message.trim()) {
      showToast('Please describe your inquiry.');
      return;
    }

    setIsSubmitting(true);
    addInquiry({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || 'Not provided',
      topic,
      message: message.trim(),
      source: 'Contact Page',
    });

    trackEvent('contact_inquiry_submitted', { topic });
    setIsSubmitting(false);
    setSubmitted(true);
    showToast('Your inquiry has been received by the Serikali Guide desk.');
  };

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] py-12 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Office & Helpline Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#D94E34] mb-2">
                CONTACT SERIKALI GUIDE
              </p>
              <h1 className="font-editorial text-4xl sm:text-5xl text-[#141413]">
                Speak With Our Nairobi Advisory Desk
              </h1>
              <p className="text-sm text-[#5E5D59] mt-2 leading-relaxed">
                Have a question about a stalled work permit, company
                registration, NGO compliance, or KRA tax clearance? Reach out
                directly or send us a message.
              </p>
            </div>

            <div className="space-y-4 bg-[#EAE9E4]/70 border border-[#141413]/12 p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D94E34] shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Nairobi Advisory Office
                  </p>
                  <p className="text-sm font-semibold text-[#141413]">
                    Kenyatta Avenue, Pioneer House, 5th Floor, Nairobi CBD,
                    Kenya
                  </p>
                  <p className="text-xs text-[#5E5D59]">
                    5 Minutes from Nyayo House (Immigration) &amp; Sheria House
                    (BRS)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[#141413]/10">
                <Phone className="w-4 h-4 text-[#1F6F43] shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Direct Helpline &amp; WhatsApp
                  </p>
                  <p className="text-sm font-semibold text-[#141413] font-mono-num">
                    0795762978 (+254 795 762 978)
                  </p>
                  <p className="text-xs text-[#5E5D59]">
                    Monday – Saturday · 8:00 AM – 6:00 PM EAT
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-[#141413]/10">
                <Mail className="w-4 h-4 text-[#141413] shrink-0 mt-1" />
                <div>
                  <p className="text-xs font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Editorial &amp; Client Desk Email
                  </p>
                  <p className="text-sm font-semibold text-[#141413]">
                    advisory@serikaliguide.co.ke
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-[#EAE9E4]/55 border border-[#141413]/12 p-6 sm:p-8">
            <h2 className="font-editorial text-3xl text-[#141413] mb-2">
              Send a Direct Inquiry
            </h2>
            <p className="text-xs text-[#5E5D59] mb-6">
              All inquiries are answered within 2 business hours by a relevant
              subject-matter specialist.
            </p>

            {submitted ? (
              <div className="p-6 bg-[#F4F3EF] border border-[#1F6F43] space-y-3">
                <p className="text-xs font-mono-num uppercase tracking-wider text-[#1F6F43] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Message Dispatched</span>
                </p>
                <h3 className="font-editorial text-2xl text-[#141413]">
                  Thank you, {fullName}.
                </h3>
                <p className="text-xs text-[#5E5D59] leading-relaxed">
                  We have logged your inquiry under <strong>{topic}</strong> and
                  will respond to <strong>{email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                  }}
                  className="px-4 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Honeypot Anti-Spam Trap */}
                <input
                  type="text"
                  name="user_corporate_website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  style={{ display: 'none', position: 'absolute', left: '-9999px' }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-full-name"
                      className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="contact-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Jane Kamau"
                      className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413] focus:ring-1 focus:ring-[#141413]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="you@organization.org"
                      className={`w-full px-3.5 py-2.5 bg-[#F4F3EF] border text-xs sm:text-sm text-[#141413] focus:outline-none ${
                        emailError
                          ? 'border-[#D94E34] focus:border-[#D94E34] ring-1 ring-[#D94E34]/30'
                          : 'border-[#141413]/20 focus:border-[#141413]'
                      }`}
                    />
                    {emailError && (
                      <p className="text-[11px] text-[#D94E34] mt-1 font-mono-num">
                        {emailError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5"
                    >
                      Phone / WhatsApp Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 7..."
                      className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-topic"
                      className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5"
                    >
                      Service Category
                    </label>
                    <select
                      id="contact-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                    >
                      {serviceCategories.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5"
                  >
                    How can we help you? *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your application, timeline, or question..."
                    className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] hover:bg-[#2B2B28] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                  </button>

                  <p className="text-[11px] text-[#6E6D68]">
                    Protected under the{' '}
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'privacy' })}
                      className="text-[#141413] underline hover:text-[#D94E34] cursor-pointer"
                    >
                      Kenya Data Protection Act, 2019
                    </button>
                    .
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   6. FULL-PAGE FREE CONSULTATION VIEW
   ============================================================================ */
export const FreeConsultationView: React.FC<{
  preselectedServiceId?: ServiceCategoryId;
  preselectedSubCategory?: string;
}> = ({ preselectedServiceId, preselectedSubCategory }) => {
  const { navigate, showToast } = useStore();
  const { serviceCategories, addConsultation, t } = useSerikali();

  const initialService =
    serviceCategories.find((s) => s.id === preselectedServiceId) ||
    serviceCategories[0];

  const [selectedServiceId, setSelectedServiceId] = useState<ServiceCategoryId>(
    initialService.id
  );

  const currentServiceObj =
    serviceCategories.find((s) => s.id === selectedServiceId) ||
    serviceCategories[0];

  const [selectedSubName, setSelectedSubName] = useState<string>(
    preselectedSubCategory || currentServiceObj.subCategories[0]?.name || ''
  );

  useEffect(() => {
    const svc =
      serviceCategories.find((s) => s.id === selectedServiceId) ||
      serviceCategories[0];
    if (
      !svc.subCategories.some(
        (sub) => sub.name.toLowerCase() === selectedSubName.toLowerCase()
      )
    ) {
      setSelectedSubName(svc.subCategories[0]?.name || '');
    }
  }, [selectedServiceId, serviceCategories, selectedSubName]);

  // 3-Step Stepper State (Step 1 -> Step 2 -> Step 3)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [consultationFormat, setConsultationFormat] = useState<
    | 'Video Call (Google Meet / Zoom)'
    | 'Phone / WhatsApp Call'
    | 'In-Person Nairobi Office'
  >('Video Call (Google Meet / Zoom)');
  const [preferredDate, setPreferredDate] = useState('2026-10-05');
  const [caseSummary, setCaseSummary] = useState('');
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [emailError, setEmailError] = useState('');

  const totalSteps = 3;
  const stepsRemainingCount = totalSteps - currentStep;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const isStep1Complete = Boolean(selectedServiceId && selectedSubName);
  const isStep2Complete = Boolean(
    clientName.trim() &&
      clientEmail.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clientEmail.trim()) &&
      clientPhone.trim()
  );

  const selectedSubDetail =
    currentServiceObj.subCategories.find(
      (s) => s.name.toLowerCase() === selectedSubName.toLowerCase()
    ) || currentServiceObj.subCategories[0];

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      setEmailError('');
      if (!clientName.trim()) {
        showToast('Please enter your full name.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(clientEmail.trim())) {
        setEmailError('Please enter a valid email address (e.g. name@domain.com)');
        showToast('Please enter a valid email address.');
        return;
      }
      if (!clientPhone.trim()) {
        showToast('Please enter your phone or WhatsApp number.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot anti-spam trap
    if (honeypot.trim()) {
      setBookingRef('SG-CONS-SPAMBLOCK');
      return;
    }

    if (!isStep2Complete) {
      setCurrentStep(2);
      showToast('Please provide your name, valid email, and phone number.');
      return;
    }

    const created = addConsultation({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      serviceCategoryId: currentServiceObj.id,
      serviceCategoryName: currentServiceObj.name,
      subCategoryName: selectedSubName,
      format: consultationFormat,
      preferredDate,
      caseSummary: caseSummary.trim() || 'Initial regulatory consultation.',
    });

    trackEvent('free_consultation_booked', {
      service: currentServiceObj.name,
      subCategory: selectedSubName,
      format: consultationFormat,
    });

    setBookingRef(created.reference);
    showToast(`Free Consultation booked! Reference: ${created.reference}`);
  };

  const stepsMeta: Array<{
    step: 1 | 2 | 3;
    title: string;
    subtitle: string;
    isDone: boolean;
  }> = [
    {
      step: 1,
      title: t.step1Title,
      subtitle: `${currentServiceObj.shortLabel} · ${selectedSubName}`,
      isDone: currentStep > 1 && isStep1Complete,
    },
    {
      step: 2,
      title: t.step2Title,
      subtitle: isStep2Complete ? clientName : 'Name, Email & WhatsApp',
      isDone: currentStep > 2 && isStep2Complete,
    },
    {
      step: 3,
      title: t.step3Title,
      subtitle: `${preferredDate} · ${consultationFormat.split(' ')[0]}`,
      isDone: Boolean(bookingRef),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8">
        <div>
          <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#D94E34] mb-2">
            SERIKALI GUIDE · COMPLIMENTARY 30-MINUTE SESSION
          </p>
          <h1 className="font-editorial text-3xl sm:text-5xl text-[#141413]">
            {t.navFreeConsultation}
          </h1>
          <p className="text-xs sm:text-sm text-[#5E5D59] mt-2 max-w-2xl leading-relaxed">
            Select your target service category and sub-category below to match
            with the right immigration, corporate registration, NGO, or KRA tax
            advisor.
          </p>
        </div>

        {bookingRef ? (
          <div className="p-6 sm:p-8 bg-[#EAE9E4] border border-[#1F6F43] space-y-5">
            {/* 100% Completed Progress Strip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-num uppercase tracking-wider text-[#1F6F43] font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All 3 Steps Completed · 0 {t.stepsRemaining}</span>
                </span>
                <span>100%</span>
              </div>
              <div className="w-full h-2 bg-[#141413]/10 overflow-hidden">
                <div className="h-full w-full bg-[#1F6F43] transition-all duration-500" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-[#1F6F43] font-semibold pt-2">
              <span>Consultation Confirmed · Ref {bookingRef}</span>
            </div>
            <h2 className="font-editorial text-3xl text-[#141413]">
              We look forward to speaking with you, {clientName}.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F4F3EF] border border-[#141413]/10 text-xs">
              <div>
                <p className="text-[#6E6D68] font-mono-num uppercase">
                  Practice Area &amp; Sub-Category
                </p>
                <p className="font-semibold text-[#141413] mt-0.5">
                  {currentServiceObj.name} — {selectedSubName}
                </p>
              </div>
              <div>
                <p className="text-[#6E6D68] font-mono-num uppercase">
                  Format &amp; Date
                </p>
                <p className="font-semibold text-[#141413] mt-0.5">
                  {consultationFormat} · {preferredDate}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() =>
                  navigate({
                    page: 'service-subcategories',
                    serviceId: selectedServiceId,
                  })
                }
                className="px-5 py-2.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
              >
                Return to {currentServiceObj.name}
              </button>
              <button
                onClick={() => {
                  setBookingRef(null);
                  setCurrentStep(1);
                }}
                className="px-5 py-2.5 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-wider cursor-pointer"
              >
                Book Another Session
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#EAE9E4]/65 border border-[#141413]/15 p-5 sm:p-8 space-y-6">
            {/* ===============================================================
                VISUAL PROGRESS BAR & 3-STEP STEPPER AT TOP OF FORM
               =============================================================== */}
            <div className="pb-6 border-b border-[#141413]/12 space-y-4">
              {/* Top Status Row: Step X of 3 + Remaining Steps Counter */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#141413] text-[#F4F3EF] text-[11px] font-mono-num uppercase tracking-wider font-semibold">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span className="text-xs font-mono-num text-[#D94E34] font-semibold">
                    {stepsRemainingCount > 0
                      ? `${stepsRemainingCount} ${t.stepsRemaining}`
                      : t.stepCompleted}
                  </span>
                </div>

                <span className="text-xs font-mono-num text-[#141413] font-semibold">
                  {progressPercent}% Complete
                </span>
              </div>

              {/* Animated Visual Progress Bar */}
              <div
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-2.5 bg-[#F4F3EF] border border-[#141413]/15 overflow-hidden"
              >
                <div
                  style={{ width: `${progressPercent}%` }}
                  className={`h-full transition-all duration-300 ${
                    currentStep === 3 ? 'bg-[#1F6F43]' : 'bg-[#D94E34]'
                  }`}
                />
              </div>

              {/* 3-Step Interactive Stepper Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {stepsMeta.map((item) => {
                  const isActive = currentStep === item.step;
                  const canClick =
                    item.step === 1 ||
                    item.step === 2 ||
                    (item.step === 3 && isStep2Complete);
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => {
                        if (canClick) {
                          setCurrentStep(item.step);
                        } else {
                          showToast(
                            'Please complete Step 2 contact details first.'
                          );
                        }
                      }}
                      className={`p-3 text-left border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#141413] text-[#F4F3EF] border-[#141413] shadow-sm'
                          : item.isDone
                          ? 'bg-[#F4F3EF] text-[#141413] border-[#1F6F43]'
                          : 'bg-[#F4F3EF]/70 text-[#5E5D59] border-[#141413]/12'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono-num font-semibold ${
                              isActive
                                ? 'text-[#D94E34]'
                                : item.isDone
                                ? 'text-[#1F6F43]'
                                : 'text-[#6E6D68]'
                            }`}
                          >
                            STEP 0{item.step}
                          </span>
                        </div>
                        <p className="text-xs font-semibold truncate mt-0.5">
                          {item.title}
                        </p>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isActive ? 'text-[#A09F99]' : 'text-[#6E6D68]'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      </div>

                      {item.isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#1F6F43] shrink-0 mt-0.5" />
                      ) : (
                        <span
                          className={`w-5 h-5 text-[10px] font-mono-num flex items-center justify-center border shrink-0 ${
                            isActive
                              ? 'border-[#D94E34] text-[#D94E34]'
                              : 'border-[#141413]/20 text-[#6E6D68]'
                          }`}
                        >
                          {item.step}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleBookConsultation} className="space-y-6" noValidate>
              {/* Anti-Spam Honeypot Field */}
              <input
                type="text"
                name="user_corporate_website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
                style={{ display: 'none', position: 'absolute', left: '-9999px' }}
              />

              {/* STEP 1: SERVICE & SUB-CATEGORY SELECTION */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                        1. Main Service Category *
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) =>
                          setSelectedServiceId(
                            e.target.value as ServiceCategoryId
                          )
                        }
                        className="w-full px-3.5 py-3 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                      >
                        {serviceCategories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                        2. Specific Sub-Category *
                      </label>
                      <select
                        value={selectedSubName}
                        onChange={(e) => setSelectedSubName(e.target.value)}
                        className="w-full px-3.5 py-3 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                      >
                        {currentServiceObj.subCategories.map((sub) => (
                          <option key={sub.id} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Sub-Category Statutory Snapshot */}
                  {selectedSubDetail && (
                    <div className="p-4 bg-[#F4F3EF] border border-[#141413]/12 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num">
                        <span className="text-[#D94E34] font-semibold">
                          {currentServiceObj.name} → {selectedSubDetail.name}
                        </span>
                        <span className="text-[#5E5D59]">
                          Portal: {selectedSubDetail.portal} ·{' '}
                          {selectedSubDetail.timeline}
                        </span>
                      </div>
                      <p className="text-xs text-[#5E5D59] leading-relaxed">
                        {selectedSubDetail.summary}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-6 py-3 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t.nextStep} (Step 2 of 3)</span>
                      <ArrowRight className="w-4 h-4 text-[#D94E34]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CLIENT CONTACT DETAILS */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3.5 py-3 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => {
                          setClientEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="you@domain.com"
                        className={`w-full px-3.5 py-3 bg-[#F4F3EF] border text-xs sm:text-sm text-[#141413] focus:outline-none ${
                          emailError
                            ? 'border-[#D94E34] focus:border-[#D94E34] ring-1 ring-[#D94E34]/30'
                            : 'border-[#141413]/20 focus:border-[#141413]'
                        }`}
                      />
                      {emailError && (
                        <p className="text-[11px] text-[#D94E34] mt-1 font-mono-num">
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+254 7..."
                        className="w-full px-3.5 py-3 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="w-full sm:w-auto px-5 py-3 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t.prevStep}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto px-6 py-3 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{t.nextStep} (Step 3 of 3)</span>
                      <ArrowRight className="w-4 h-4 text-[#D94E34]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SCHEDULE & CASE SUMMARY */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                        Consultation Format
                      </label>
                      <select
                        value={consultationFormat}
                        onChange={(e) =>
                          setConsultationFormat(e.target.value as any)
                        }
                        className="w-full px-3.5 py-3 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                      >
                        <option value="Video Call (Google Meet / Zoom)">
                          Video Call (Google Meet / Zoom)
                        </option>
                        <option value="Phone / WhatsApp Call">
                          Phone / WhatsApp Call
                        </option>
                        <option value="In-Person Nairobi Office">
                          In-Person Nairobi Office
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-3 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] font-mono-num focus:outline-none focus:border-[#141413]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                      Brief Summary of Your Case or Question
                    </label>
                    <textarea
                      rows={3}
                      value={caseSummary}
                      onChange={(e) => setCaseSummary(e.target.value)}
                      placeholder="Tell us about your current status, timeline, or specific questions..."
                      className="w-full px-3.5 py-3 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                    />
                  </div>

                  {/* Summary Review Box before confirming */}
                  <div className="p-4 bg-[#F4F3EF] border border-[#141413]/15 text-xs space-y-1">
                    <p className="font-mono-num uppercase text-[11px] text-[#D94E34] font-semibold">
                      Booking Summary Review
                    </p>
                    <p className="text-[#141413]">
                      <strong>Service:</strong> {currentServiceObj.name} —{' '}
                      {selectedSubName}
                    </p>
                    <p className="text-[#5E5D59]">
                      <strong>Client:</strong> {clientName} ({clientEmail} ·{' '}
                      {clientPhone})
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="w-full sm:w-auto px-5 py-3 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t.prevStep}</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3.5 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-[#D94E34]" />
                      <span>{t.confirmConsultation}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#6E6D68] text-center pt-2">
                    Consultation requests are processed in strict confidence under the{' '}
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'privacy' })}
                      className="text-[#141413] underline hover:text-[#D94E34] cursor-pointer"
                    >
                      Kenya Data Protection Act, 2019
                    </button>
                    . Your contact details will never be sold or shared.
                  </p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
