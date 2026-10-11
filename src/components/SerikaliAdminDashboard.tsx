import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck2,
  FolderPlus,
  Globe,
  Heart,
  Landmark,
  Layers,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import {
  ConsultationStatus,
  InquiryStatus,
  SERVICE_CATEGORIES,
} from '../data/serikaliData';
import { AdminSeoManager } from './AdminSeoManager';
import { AdminBlogManager } from './AdminBlogManager';
import { AdminServicesManager } from './AdminServicesManager';
import { AdminRequestsManager } from './AdminRequestsManager';
import { AdminNewsletterManager } from './AdminNewsletterManager';

type AdminSectionId =
  | 'overview'
  | 'services'
  | 'requests'
  | 'blogs'
  | 'newsletter'
  | 'categories'
  | 'subcategories'
  | 'seo'
  | 'consultations'
  | 'inquiries'
  | 'donations';

export const SerikaliAdminDashboard: React.FC = () => {
  const { navigate, showToast } = useStore();
  const {
    serviceCategories,
    blogPosts,
    consultations,
    inquiries,
    donations,
    managedServices,
    serviceRequests,
    newsletterSubscribers,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    addBlogPost,
    deleteBlogPost,
    reloadBlogs,
    addServiceCategory,
    deleteServiceCategory,
    addSubCategory,
    deleteSubCategory,
    updateConsultationStatus,
    deleteConsultation,
    updateInquiryStatus,
    deleteInquiry,
    resetAllToDefaults,
  } = useSerikali();

  // Security gate state (Passcode is 1940 — never shown in UI!)
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Left sidebar collapsed state & active section
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] =
    useState<AdminSectionId>('overview');

  // --- BLOG CREATION FORM STATE ---
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSubtitle, setBlogSubtitle] = useState('');
  const [blogCategoryId, setBlogCategoryId] = useState(
    serviceCategories[0]?.id || 'immigration-visas'
  );
  const [blogSubCategoryName, setBlogSubCategoryName] = useState('');
  const [blogAuthor, setBlogAuthor] = useState(
    'Adv. Wanjiku Mwangi, MCIArb'
  );
  const [blogAuthorRole, setBlogAuthorRole] = useState(
    'Senior Immigration & Corporate Counsel'
  );
  const [blogReadTime, setBlogReadTime] = useState('7 min read');
  const [blogPortal, setBlogPortal] = useState('ecitizen.go.ke');
  const [blogImage, setBlogImage] = useState(
    serviceCategories[0]?.heroImage || SERVICE_CATEGORIES[0].heroImage
  );
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogTakeawaysText, setBlogTakeawaysText] = useState(
    'Submit applications exclusively through the official government portal\nVerify all KRA TCC and statutory clearances before uploading\nKeep digital payment receipts (PRN) for biometric or registry appointments'
  );
  const [blogSectionHeading, setBlogSectionHeading] = useState(
    '1. Regulatory Overview & Mandatory Requirements'
  );
  const [blogSectionBody, setBlogSectionBody] = useState('');
  const [blogChecklistText, setBlogChecklistText] = useState(
    'Valid Passport or Kenya National ID\nKRA PIN Certificate\nOfficial Application Form & Fee Receipt'
  );
  const [blogIsTopStory, setBlogIsTopStory] = useState(true);
  const [blogIsFeatured, setBlogIsFeatured] = useState(true);
  const [blogSearchFilter, setBlogSearchFilter] = useState('');

  // --- NEW MAIN CATEGORY FORM STATE ---
  const [catName, setCatName] = useState('');
  const [catShortLabel, setCatShortLabel] = useState('');
  const [catAgencyBadge, setCatAgencyBadge] = useState('GOVT PORTAL');
  const [catAgency, setCatAgency] = useState(
    'Republic of Kenya · Official Regulatory Desk'
  );
  const [catHeroSubtitle, setCatHeroSubtitle] = useState('');
  const [catOverview, setCatOverview] = useState('');
  const [catFirstSubName, setCatFirstSubName] = useState('');
  const [catFirstSubSummary, setCatFirstSubSummary] = useState('');
  const [catFirstSubPortal, setCatFirstSubPortal] = useState('ecitizen.go.ke');
  const [catFirstSubTimeline, setCatFirstSubTimeline] =
    useState('5 – 14 Working Days');
  const [catFirstSubFee, setCatFirstSubFee] = useState(
    'Official Gazette Statutory Fee'
  );

  // --- NEW SUB-CATEGORY / SERVICE FORM STATE ---
  const [targetParentCatId, setTargetParentCatId] = useState(
    serviceCategories[0]?.id || 'immigration-visas'
  );
  const [subName, setSubName] = useState('');
  const [subSummary, setSubSummary] = useState('');
  const [subPortal, setSubPortal] = useState('ecitizen.go.ke');
  const [subTimeline, setSubTimeline] = useState('7 – 14 Working Days');
  const [subFeeNote, setSubFeeNote] = useState('KSh 10,000 Statutory Fee');
  const [subStatutoryNote, setSubStatutoryNote] = useState(
    'Governed by Kenyan Statutory Law & eCitizen Directives'
  );
  const [subRequirementsText, setSubRequirementsText] = useState(
    'Completed online application form on the official portal\nCertified copies of identification / incorporation documents\nValid KRA Tax Compliance Certificate (TCC)\nOfficial eCitizen Payment Reference Number (PRN) receipt'
  );
  const [subStepsText, setSubStepsText] = useState(
    'Log in to the official portal and select the application category.\nUpload all required supporting PDFs and statutory declarations.\nPay the gazetted government processing fee via M-Pesa or RTGS.\nDownload the digital certificate or attend physical verification.'
  );

  // Filter states for Consultations & Inquiries
  const [consultationFilter, setConsultationFilter] = useState<
    ConsultationStatus | 'All'
  >('All');
  const [inquiryFilter, setInquiryFilter] = useState<InquiryStatus | 'All'>(
    'All'
  );

  // --- AI GENERATOR STATES ---
  const [aiBlogTopic, setAiBlogTopic] = useState('');
  const [isAiGeneratingBlog, setIsAiGeneratingBlog] = useState(false);

  const [aiServiceTopic, setAiServiceTopic] = useState('');
  const [isAiGeneratingService, setIsAiGeneratingService] = useState(false);

  // Handle AI Blog Generation (Gemini 3.8 Flash)
  const handleAiGenerateBlog = async () => {
    if (!aiBlogTopic.trim()) {
      showToast('Please enter a topic for the AI to analyze.');
      return;
    }
    setIsAiGeneratingBlog(true);
    try {
      const res = await fetch('/api/ai/generate-serikali-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiBlogTopic.trim(),
          categoryId: blogCategoryId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.title) setBlogTitle(data.title);
      if (data.subtitle) setBlogSubtitle(data.subtitle);
      if (data.categoryId) {
        setBlogCategoryId(data.categoryId);
        const found = serviceCategories.find((c) => c.id === data.categoryId);
        if (found) setBlogImage(found.heroImage);
      }
      if (data.subCategoryName) setBlogSubCategoryName(data.subCategoryName);
      if (data.excerpt) setBlogExcerpt(data.excerpt);
      if (data.officialPortal) setBlogPortal(data.officialPortal);
      if (data.readTime) setBlogReadTime(data.readTime);
      if (data.author) setBlogAuthor(data.author);
      if (data.authorRole) setBlogAuthorRole(data.authorRole);
      if (data.sectionHeading) setBlogSectionHeading(data.sectionHeading);
      if (data.sectionBody) setBlogSectionBody(data.sectionBody);
      if (Array.isArray(data.keyTakeaways)) {
        setBlogTakeawaysText(data.keyTakeaways.join('\n'));
      }
      if (Array.isArray(data.checklist)) {
        setBlogChecklistText(data.checklist.join('\n'));
      }

      showToast('✨ Gemini AI populated authentic 2026 Kenyan statutory guide!');
    } catch (err: any) {
      showToast(`AI generation error: ${err.message || 'Failed to generate'}`);
    } finally {
      setIsAiGeneratingBlog(false);
    }
  };

  // Handle AI Service Pillar Generation (Gemini 3.8 Flash)
  const handleAiGenerateService = async () => {
    if (!aiServiceTopic.trim()) {
      showToast('Please enter a service or regulatory topic for the AI.');
      return;
    }
    setIsAiGeneratingService(true);
    try {
      const res = await fetch('/api/ai/generate-serikali-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiServiceTopic.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.name) setCatName(data.name);
      if (data.shortLabel) setCatShortLabel(data.shortLabel);
      if (data.agencyBadge) setCatAgencyBadge(data.agencyBadge);
      if (data.agency) setCatAgency(data.agency);
      if (data.heroSubtitle) setCatHeroSubtitle(data.heroSubtitle);
      if (data.overview) setCatOverview(data.overview);

      if (Array.isArray(data.subCategories) && data.subCategories.length > 0) {
        const first = data.subCategories[0];
        setCatFirstSubName(first.name);
        setCatFirstSubSummary(first.summary);
        setCatFirstSubPortal(first.portal);
        setCatFirstSubTimeline(first.timeline);
        setCatFirstSubFee(first.feeNote);
      }

      showToast('✨ Gemini AI populated authentic Kenyan service pillar details!');
    } catch (err: any) {
      showToast(`AI generation error: ${err.message || 'Failed to generate'}`);
    } finally {
      setIsAiGeneratingService(false);
    }
  };

  // Total counts & metrics
  const totalSubCategoriesCount = useMemo(
    () =>
      serviceCategories.reduce((acc, cat) => acc + cat.subCategories.length, 0),
    [serviceCategories]
  );
  const pendingConsultationsCount = useMemo(
    () => consultations.filter((c) => c.status === 'Pending Review').length,
    [consultations]
  );
  const newInquiriesCount = useMemo(
    () => inquiries.filter((i) => i.status === 'New').length,
    [inquiries]
  );
  const totalDonationsKsh = useMemo(
    () => donations.reduce((acc, d) => acc + d.amount, 0),
    [donations]
  );

  // Handle Passcode Login
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = unlockAdmin(passcodeInput);
    if (ok) {
      setLoginError(false);
      setPasscodeInput('');
      showToast('Admin Command Center unlocked.');
    } else {
      setLoginError(true);
    }
  };

  // Handle Create Blog Post
  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogExcerpt.trim()) {
      showToast('Please enter a blog title and excerpt.');
      return;
    }

    const parentCat =
      serviceCategories.find((c) => c.id === blogCategoryId) ||
      serviceCategories[0];
    const resolvedSubName =
      blogSubCategoryName.trim() ||
      parentCat?.subCategories[0]?.name ||
      'General Guide';

    const takeaways = blogTakeawaysText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const checklist = blogChecklistText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const paragraphs = blogSectionBody
      .split('\n\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = addBlogPost({
      title: blogTitle.trim(),
      subtitle:
        blogSubtitle.trim() ||
        `Comprehensive statutory guide and procedural checklist for ${resolvedSubName} in Kenya.`,
      categoryId: parentCat.id,
      categoryName: parentCat.name,
      subCategoryName: resolvedSubName,
      author: blogAuthor.trim() || 'Serikali Guide Editorial Desk',
      authorRole: blogAuthorRole.trim() || 'Regulatory Specialist',
      publishedDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      readTime: blogReadTime.trim() || '6 min read',
      image: blogImage || parentCat.heroImage,
      isTopStory: blogIsTopStory,
      isFeatured: blogIsFeatured,
      excerpt: blogExcerpt.trim(),
      keyTakeaways:
        takeaways.length > 0
          ? takeaways
          : [
              `Verified 2026 requirements and timeline for ${resolvedSubName}.`,
            ],
      officialPortal: blogPortal.trim() || 'ecitizen.go.ke',
      sections: [
        {
          heading:
            blogSectionHeading.trim() ||
            `1. Complete Guide to ${resolvedSubName}`,
          paragraphs:
            paragraphs.length > 0
              ? paragraphs
              : [blogExcerpt.trim()],
          checklist: checklist.length > 0 ? checklist : undefined,
          callout: `Always lodge your ${resolvedSubName} application directly through ${
            blogPortal.trim() || 'ecitizen.go.ke'
          } and retain your official PRN receipt.`,
        },
      ],
      keywords: [
        blogTitle.toLowerCase(),
        resolvedSubName.toLowerCase(),
        parentCat.name.toLowerCase(),
        blogPortal.toLowerCase(),
      ],
    });

    setBlogTitle('');
    setBlogSubtitle('');
    setBlogExcerpt('');
    setBlogSectionBody('');
    showToast(`Blog post "${created.title}" published!`);
    reloadBlogs().catch(() => {});
  };

  // Handle Create Main Service Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catOverview.trim()) {
      showToast('Please enter the Category Name and Overview.');
      return;
    }

    const firstSubId = (catFirstSubName.trim() || 'general-filing')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    const created = addServiceCategory({
      name: catName.trim(),
      shortLabel: catShortLabel.trim() || catName.trim().split(' ')[0],
      agencyBadge: catAgencyBadge.trim() || 'GOVT PORTAL',
      agency:
        catAgency.trim() || 'Republic of Kenya · Official Regulatory Desk',
      heroSubtitle:
        catHeroSubtitle.trim() ||
        catFirstSubName.trim() ||
        'Statutory filings, permits & compliance',
      editorialHeadline: `${catName.trim()} — Official Kenyan Procedures & Requirements.`,
      overview: catOverview.trim(),
      heroImage: SERVICE_CATEGORIES[0].heroImage,
      subCategories: [
        {
          id: firstSubId,
          name: catFirstSubName.trim() || `${catName.trim()} Application`,
          summary:
            catFirstSubSummary.trim() ||
            `End-to-end statutory requirements and official portal filing steps for ${catName.trim()}.`,
          portal: catFirstSubPortal.trim() || 'ecitizen.go.ke',
          timeline: catFirstSubTimeline.trim() || '5 – 14 Working Days',
          feeNote: catFirstSubFee.trim() || 'Official Statutory Fee',
          statutoryNote: 'Republic of Kenya Statutory Regulations',
          requirements: [
            'Valid Kenya National ID or Foreign Passport',
            'KRA PIN Certificate & Tax Compliance',
            'Completed Official Portal Application Form',
          ],
          steps: [
            'Log in to the official government portal and select the service.',
            'Upload required supporting documents in PDF format.',
            'Complete statutory fee payment via eCitizen PRN.',
            'Download your approved permit or certificate.',
          ],
        },
      ],
    });

    setCatName('');
    setCatShortLabel('');
    setCatHeroSubtitle('');
    setCatOverview('');
    setCatFirstSubName('');
    setCatFirstSubSummary('');
    showToast(`Service Category "${created.name}" added to the Hanger Rail!`);
  };

  // Handle Create Sub-Category
  const handleCreateSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subSummary.trim()) {
      showToast('Please provide the Sub-Category Name and Summary.');
      return;
    }

    const requirements = subRequirementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const steps = subStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addSubCategory(targetParentCatId, {
      name: subName.trim(),
      summary: subSummary.trim(),
      portal: subPortal.trim() || 'ecitizen.go.ke',
      timeline: subTimeline.trim() || '7 – 14 Working Days',
      feeNote: subFeeNote.trim() || 'Standard Statutory Fee',
      statutoryNote:
        subStatutoryNote.trim() || 'Kenyan Regulatory Compliance',
      requirements:
        requirements.length > 0
          ? requirements
          : ['Official Portal Application', 'Valid Identification & KRA PIN'],
      steps:
        steps.length > 0
          ? steps
          : [
              'Complete online application form.',
              'Upload supporting documents and pay statutory fee.',
            ],
    });

    const parentObj = serviceCategories.find(
      (c) => c.id === targetParentCatId
    );
    setSubName('');
    setSubSummary('');
    showToast(
      `Sub-Category "${subName.trim()}" added under ${
        parentObj?.name || 'Service Category'
      }!`
    );
  };

  /* ==========================================================================
     SECURITY GATE (Shown when Admin is Locked — Never reveals code in UI)
     ========================================================================== */
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[82vh] bg-[#F4F3EF] text-[#141413] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#EAE9E4] border border-[#141413]/20 p-7 sm:p-9 shadow-[0_24px_48px_rgba(20,20,19,0.08)]">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#141413]/12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#141413] text-[#F4F3EF] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#D94E34]" />
              </div>
              <div>
                <p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#6E6D68]">
                  RESTRICTED PORTAL
                </p>
                <h1 className="font-editorial text-2xl text-[#141413] leading-none">
                  Serikali Guide Admin
                </h1>
              </div>
            </div>
            <button
              onClick={() => navigate({ page: 'home' })}
              className="text-xs font-mono-num uppercase tracking-wider text-[#5E5D59] hover:text-[#141413] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>

          <p className="text-xs text-[#5E5D59] leading-relaxed mb-6">
            Authorized personnel only. Enter your confidential administrator
            security code to manage blogs, service categories, sub-categories,
            client inquiries, and consultation bookings.
          </p>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-2">
                Administrator Security Code
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  if (loginError) setLoginError(false);
                }}
                placeholder="••••"
                className="w-full px-4 py-3 bg-[#F4F3EF] border border-[#141413]/25 text-center font-mono-num text-lg tracking-[0.4em] text-[#141413] focus:outline-none focus:border-[#141413]"
              />
              {loginError && (
                <p className="mt-2 text-xs text-[#D94E34] flex items-center gap-1.5 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Invalid security code. Access denied.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.18em] font-semibold transition-colors cursor-pointer"
            >
              Authenticate &amp; Open Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     UNLOCKED ADMIN COMMAND CENTER (Collapsible Left Sidebar + Workspace)
     ========================================================================== */
  const navItems: {
    id: AdminSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'services',
      label: 'Services & Pricing',
      icon: CreditCard,
      badge: managedServices.length,
    },
    {
      id: 'requests',
      label: 'Service Applications',
      icon: FileCheck2,
      badge: serviceRequests.filter((r) => r.status !== 'Completed' && r.status !== 'Cancelled').length || serviceRequests.length,
    },
    {
      id: 'blogs',
      label: 'Blogs Manager',
      icon: BookOpen,
      badge: blogPosts.length,
    },
    {
      id: 'newsletter',
      label: 'Newsletter & Bulletins',
      icon: Mail,
      badge: newsletterSubscribers.length,
    },
    {
      id: 'categories',
      label: 'Service Categories',
      icon: Layers,
      badge: serviceCategories.length,
    },
    {
      id: 'subcategories',
      label: 'Sub-Categories & Services',
      icon: FolderPlus,
      badge: totalSubCategoriesCount,
    },
    {
      id: 'seo',
      label: 'SEO & Meta Tags',
      icon: Globe,
      badge: undefined,
    },
    {
      id: 'consultations',
      label: 'Consultation Bookings',
      icon: Calendar,
      badge: pendingConsultationsCount || consultations.length,
    },
    {
      id: 'inquiries',
      label: 'Client Inquiries',
      icon: MessageSquare,
      badge: newInquiriesCount || inquiries.length,
    },
    {
      id: 'donations',
      label: 'Reader Donations',
      icon: Heart,
      badge: donations.length,
    },
  ];

  const filteredAdminBlogs = blogPosts.filter((b) => {
    const q = blogSearchFilter.trim().toLowerCase();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.categoryName.toLowerCase().includes(q) ||
      b.subCategoryName.toLowerCase().includes(q)
    );
  });

  const filteredConsultations = consultations.filter((c) =>
    consultationFilter === 'All' ? true : c.status === consultationFilter
  );

  const filteredInquiries = inquiries.filter((inq) =>
    inquiryFilter === 'All' ? true : inq.status === inquiryFilter
  );

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] flex flex-col lg:flex-row">
      {/* =====================================================================
          COLLAPSIBLE LEFT SIDEBAR NAVIGATION
         ===================================================================== */}
      <aside
        className={`bg-[#141413] text-[#F4F3EF] shrink-0 border-b lg:border-b-0 lg:border-r border-[#141413]/20 transition-all duration-300 flex flex-col justify-between ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
        }`}
      >
        <div>
          {/* Sidebar Brand Header + Collapse Toggle */}
          <div className="h-16 px-4 border-b border-[#F4F3EF]/12 flex items-center justify-between gap-2">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 bg-[#D94E34] text-[#F4F3EF] flex items-center justify-center font-editorial font-bold text-base shrink-0">
                  S
                </div>
                <div className="truncate">
                  <p className="font-mono-num text-xs font-semibold tracking-[0.16em] uppercase text-[#F4F3EF] truncate">
                    SERIKALI ADMIN
                  </p>
                  <p className="text-[10px] text-[#A09F99] truncate">
                     Editorial &amp; Advisory CMS
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              title={
                isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'
              }
              className="w-8 h-8 bg-[#F4F3EF]/10 hover:bg-[#F4F3EF]/20 text-[#F4F3EF] flex items-center justify-center transition-colors cursor-pointer mx-auto lg:mx-0"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Admin Sidebar Navigation"
            className="p-2.5 space-y-1 flex lg:flex-col overflow-x-auto no-scrollbar"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  title={item.label}
                  className={`px-3 py-2.5 text-xs font-medium transition-colors flex items-center justify-between gap-2.5 cursor-pointer shrink-0 lg:w-full ${
                    isActive
                      ? 'bg-[#D94E34] text-[#F4F3EF]'
                      : 'text-[#A09F99] hover:text-[#F4F3EF] hover:bg-[#F4F3EF]/8'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono-num ${
                        isActive
                          ? 'bg-[#141413]/30 text-[#F4F3EF]'
                          : 'bg-[#F4F3EF]/10 text-[#F4F3EF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#F4F3EF]/12 space-y-1.5 hidden lg:block">
          <button
            type="button"
            onClick={() => navigate({ page: 'home' })}
            title="View Public Website"
            className="w-full px-3 py-2 text-xs text-[#A09F99] hover:text-[#F4F3EF] hover:bg-[#F4F3EF]/8 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>View Live Website</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              lockAdmin();
              navigate({ page: 'home' });
              showToast('Admin session locked.');
            }}
            title="Lock Admin Session"
            className="w-full px-3 py-2 text-xs text-[#D94E34] hover:bg-[#D94E34]/15 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Lock Admin Portal</span>}
          </button>
        </div>
      </aside>

      {/* =====================================================================
          MAIN ADMIN WORKSPACE CANVAS
         ===================================================================== */}
      <div className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 space-y-8">
        {/* Top Workspace Bar */}
        <div className="pb-6 border-b border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono-num uppercase tracking-[0.2em] text-[#D94E34]">
              SERIKALI GUIDE · ADMINISTRATION CONSOLE
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[#141413] mt-0.5">
              {navItems.find((i) => i.id === activeSection)?.label}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveSection('blogs')}
              className="px-3.5 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#2B2B28] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#D94E34]" />
              <span>New Blog</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('subcategories')}
              className="px-3.5 py-2 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 hover:border-[#141413] cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Add Sub-Category</span>
            </button>
            <button
              type="button"
              onClick={() => {
                lockAdmin();
                showToast('Admin locked.');
              }}
              className="px-3 py-2 border border-[#D94E34]/40 text-[#D94E34] text-xs font-mono-num uppercase tracking-wider hover:bg-[#D94E34] hover:text-[#F4F3EF] transition-colors cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>

        {/* ===================================================================
            TAB 1: OVERVIEW & ANALYTICS
           =================================================================== */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div
                onClick={() => setActiveSection('blogs')}
                className="p-5 bg-[#EAE9E4]/70 border border-[#141413]/12 cursor-pointer hover:border-[#141413] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono-num text-[#6E6D68]">
                  <span>PUBLISHED BLOGS</span>
                  <BookOpen className="w-4 h-4 text-[#D94E34]" />
                </div>
                <p className="font-editorial text-4xl text-[#141413] font-mono-num mt-2">
                  {blogPosts.length}
                </p>
                <p className="text-xs text-[#5E5D59] mt-1">
                  {blogPosts.filter((b) => b.isTopStory).length} Top Stories ·{' '}
                  {blogPosts.filter((b) => b.isFeatured).length} Featured
                </p>
              </div>

              <div
                onClick={() => setActiveSection('subcategories')}
                className="p-5 bg-[#EAE9E4]/70 border border-[#141413]/12 cursor-pointer hover:border-[#141413] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono-num text-[#6E6D68]">
                  <span>CATEGORIES &amp; SERVICES</span>
                  <Layers className="w-4 h-4 text-[#141413]" />
                </div>
                <p className="font-editorial text-4xl text-[#141413] font-mono-num mt-2">
                  {serviceCategories.length} / {totalSubCategoriesCount}
                </p>
                <p className="text-xs text-[#5E5D59] mt-1">
                  {serviceCategories.length} Pillars ·{' '}
                  {totalSubCategoriesCount} Sub-Categories
                </p>
              </div>

              <div
                onClick={() => setActiveSection('newsletter')}
                className="p-5 bg-[#EAE9E4]/70 border border-[#141413]/12 cursor-pointer hover:border-[#141413] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono-num text-[#6E6D68]">
                  <span>NEWSLETTER SUBSCRIBERS</span>
                  <Mail className="w-4 h-4 text-[#D94E34]" />
                </div>
                <p className="font-editorial text-4xl text-[#141413] font-mono-num mt-2">
                  {newsletterSubscribers.length}
                </p>
                <p className="text-xs text-[#1F6F43] font-medium mt-1">
                  {newsletterSubscribers.filter((s) => s.status === 'active').length} Active · Send Bulletin
                </p>
              </div>

              <div
                onClick={() => setActiveSection('consultations')}
                className="p-5 bg-[#EAE9E4]/70 border border-[#141413]/12 cursor-pointer hover:border-[#141413] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono-num text-[#6E6D68]">
                  <span>CONSULTATIONS</span>
                  <Calendar className="w-4 h-4 text-[#1F6F43]" />
                </div>
                <p className="font-editorial text-4xl text-[#141413] font-mono-num mt-2">
                  {consultations.length}
                </p>
                <p className="text-xs text-[#D94E34] font-medium mt-1">
                  {pendingConsultationsCount} Pending Review
                </p>
              </div>

              <div
                onClick={() => setActiveSection('inquiries')}
                className="p-5 bg-[#EAE9E4]/70 border border-[#141413]/12 cursor-pointer hover:border-[#141413] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-mono-num text-[#6E6D68]">
                  <span>CLIENT INQUIRIES</span>
                  <MessageSquare className="w-4 h-4 text-[#D94E34]" />
                </div>
                <p className="font-editorial text-4xl text-[#141413] font-mono-num mt-2">
                  {inquiries.length}
                </p>
                <p className="text-xs text-[#5E5D59] mt-1">
                  {newInquiriesCount} Unread · KSh{' '}
                  {totalDonationsKsh.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Two-Column Recent Activity: Consultations & Inquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest Consultations */}
              <div className="bg-[#EAE9E4]/50 border border-[#141413]/12 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#141413]/10 pb-3">
                  <div>
                    <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#D94E34]">
                      CLIENT BOOKINGS
                    </p>
                    <h2 className="font-editorial text-2xl text-[#141413]">
                      Recent Free Consultations
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveSection('consultations')}
                    className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage All</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {consultations.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 bg-[#F4F3EF] border border-[#141413]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono-num text-[#6E6D68]">
                          <span className="text-[#141413] font-semibold">
                            {c.reference}
                          </span>
                          <span>·</span>
                          <span>{c.preferredDate}</span>
                          <span>·</span>
                          <span className="text-[#D94E34]">{c.status}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#141413] mt-0.5">
                          {c.clientName} — {c.subCategoryName}
                        </p>
                        <p className="text-xs text-[#5E5D59] truncate max-w-md">
                          {c.format} · {c.clientPhone}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveSection('consultations')}
                        className="px-3 py-1.5 border border-[#141413]/20 text-xs font-mono-num uppercase tracking-wider hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer self-start sm:self-center shrink-0"
                      >
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Client Inquiries */}
              <div className="bg-[#EAE9E4]/50 border border-[#141413]/12 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#141413]/10 pb-3">
                  <div>
                    <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#D94E34]">
                      INBOX &amp; CALLBACKS
                    </p>
                    <h2 className="font-editorial text-2xl text-[#141413]">
                      Recent Client Inquiries
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveSection('inquiries')}
                    className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-70 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Inbox</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {inquiries.slice(0, 4).map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 bg-[#F4F3EF] border border-[#141413]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[11px] font-mono-num text-[#6E6D68]">
                          <span className="text-[#141413] font-semibold">
                            {inq.reference}
                          </span>
                          <span>·</span>
                          <span>{inq.source}</span>
                          <span>·</span>
                          <span className="text-[#1F6F43]">{inq.status}</span>
                        </div>
                        <p className="text-sm font-semibold text-[#141413] mt-0.5">
                          {inq.fullName} ({inq.topic})
                        </p>
                        <p className="text-xs text-[#5E5D59] line-clamp-1">
                          {inq.message}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveSection('inquiries')}
                        className="px-3 py-1.5 border border-[#141413]/20 text-xs font-mono-num uppercase tracking-wider hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer self-start sm:self-center shrink-0"
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: ASSISTED SERVICES & PRICING MANAGER (Get Started Flow Control)
           =================================================================== */}
        {activeSection === 'services' && <AdminServicesManager />}

        {/* ===================================================================
            TAB: CLIENT SERVICE REQUESTS (Incoming Submissions & Status Tracking)
           =================================================================== */}
        {activeSection === 'requests' && <AdminRequestsManager />}

        {/* ===================================================================
            TAB: BLOGS MANAGER (Complete Persistent Blog Management)
           =================================================================== */}
        {activeSection === 'blogs' && <AdminBlogManager />}

        {/* ===================================================================
            TAB: NEWSLETTER & STATUTORY BROADCASTS MANAGER
           =================================================================== */}
        {activeSection === 'newsletter' && <AdminNewsletterManager />}

        {/* ===================================================================
            TAB 3: SERVICE CATEGORIES MANAGER (Add Main Hanger Category)
           =================================================================== */}
        {activeSection === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleCreateCategory}
              className="lg:col-span-5 bg-[#EAE9E4]/65 border border-[#141413]/15 p-6 space-y-4"
            >
              <div className="border-b border-[#141413]/10 pb-3">
                <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#D94E34]">
                  HANGER RAIL &amp; DIRECTORY
                </p>
                <h2 className="font-editorial text-2xl text-[#141413]">
                  Add Main Service Category
                </h2>
              </div>

              {/* AI Service Topic Assistant Bar */}
              <div className="p-3.5 bg-[#141413] text-[#F4F3EF] space-y-2 border border-[#141413]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono-num uppercase tracking-wider text-[#D94E34] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill with Gemini AI</span>
                  </div>
                  <span className="text-[10px] font-mono-num text-[#A09F99]">
                    2026 Kenyan Statutes
                  </span>
                </div>
                <p className="text-[11px] text-[#A09F99] leading-snug">
                  Give Gemini a service or regulatory topic (e.g. &ldquo;Mining &amp; Mineral Export Licenses&rdquo; or &ldquo;EPZ Industrial Zone Setup&rdquo;). AI will fetch true, verified Kenyan ministry names, portals, fees, and sub-categories.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiServiceTopic}
                    onChange={(e) => setAiServiceTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAiGenerateService();
                      }
                    }}
                    placeholder="e.g. Mining & Mineral Export Licencing..."
                    className="flex-1 min-w-0 px-3 py-1.5 bg-[#F4F3EF] text-xs text-[#141413] placeholder:text-[#8E8D87] border border-[#141413]/30 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerateService}
                    disabled={isAiGeneratingService || !aiServiceTopic.trim()}
                    className="px-3 py-1.5 bg-[#D94E34] hover:bg-[#c4432c] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isAiGeneratingService ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isAiGeneratingService ? 'Generating...' : 'Fill Pillar'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Maritime & Port Clearances"
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Short Label
                  </label>
                  <input
                    type="text"
                    value={catShortLabel}
                    onChange={(e) => setCatShortLabel(e.target.value)}
                    placeholder="e.g. Maritime"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Hanger Badge
                  </label>
                  <input
                    type="text"
                    value={catAgencyBadge}
                    onChange={(e) => setCatAgencyBadge(e.target.value)}
                    placeholder="e.g. KPA / KMA"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  Lead Government Agency
                </label>
                <input
                  type="text"
                  value={catAgency}
                  onChange={(e) => setCatAgency(e.target.value)}
                  placeholder="e.g. Kenya Maritime Authority · Single Window"
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  Hanger Card Subtitle
                </label>
                <input
                  type="text"
                  value={catHeroSubtitle}
                  onChange={(e) => setCatHeroSubtitle(e.target.value)}
                  placeholder="e.g. Import permits, customs & port clearances"
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  Category Overview *
                </label>
                <textarea
                  rows={3}
                  required
                  value={catOverview}
                  onChange={(e) => setCatOverview(e.target.value)}
                  placeholder="Explain what this service pillar covers..."
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
              </div>

              <div className="pt-2 border-t border-[#141413]/10 space-y-3">
                <p className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34]">
                  Initial Sub-Category inside this Pillar
                </p>
                <input
                  type="text"
                  value={catFirstSubName}
                  onChange={(e) => setCatFirstSubName(e.target.value)}
                  placeholder="First Sub-Category Name (e.g. Import Declaration Form)"
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
                <input
                  type="text"
                  value={catFirstSubSummary}
                  onChange={(e) => setCatFirstSubSummary(e.target.value)}
                  placeholder="Short summary of this sub-category..."
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] cursor-pointer"
              >
                Create Service Category
              </button>
            </form>

            {/* Existing Service Categories */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-editorial text-2xl text-[#141413]">
                Active Service Categories ({serviceCategories.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {serviceCategories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="p-5 bg-[#EAE9E4]/55 border border-[#141413]/12 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono-num text-[#D94E34]">
                        <span>
                          0{idx + 1} · {cat.agencyBadge}
                        </span>
                        <span className="text-[#141413]">
                          {cat.subCategories.length} Sub-Categories
                        </span>
                      </div>
                      <h3 className="font-editorial text-2xl text-[#141413] mt-1">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#5E5D59] mt-1 line-clamp-2">
                        {cat.overview}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#141413]/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            page: 'service-subcategories',
                            serviceId: cat.id,
                          })
                        }
                        className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:text-[#D94E34] flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Sub-Categories Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {serviceCategories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteServiceCategory(cat.id);
                            showToast(`Removed category "${cat.name}".`);
                          }}
                          className="p-1.5 text-[#6E6D68] hover:text-[#D94E34] cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: SUB-CATEGORIES & SERVICES MANAGER
           =================================================================== */}
        {activeSection === 'subcategories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Add Sub-Category Form */}
            <form
              onSubmit={handleCreateSubCategory}
              className="lg:col-span-5 bg-[#EAE9E4]/65 border border-[#141413]/15 p-6 space-y-4"
            >
              <div className="border-b border-[#141413]/10 pb-3">
                <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#D94E34]">
                  ADD NEW SUB-CATEGORY / SERVICE
                </p>
                <h2 className="font-editorial text-2xl text-[#141413]">
                  Create Service &amp; Sub-Category
                </h2>
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  1. Select Parent Service Category *
                </label>
                <select
                  value={targetParentCatId}
                  onChange={(e) => setTargetParentCatId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413]"
                >
                  {serviceCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subCategories.length} sub-categories)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  2. Sub-Category / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Digital Nomad Permit (Class N)"
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  Procedural Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={subSummary}
                  onChange={(e) => setSubSummary(e.target.value)}
                  placeholder="Explain who qualifies and what this sub-category covers..."
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Official Portal
                  </label>
                  <input
                    type="text"
                    value={subPortal}
                    onChange={(e) => setSubPortal(e.target.value)}
                    placeholder="fns.immigration.go.ke"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Estimated Timeline
                  </label>
                  <input
                    type="text"
                    value={subTimeline}
                    onChange={(e) => setSubTimeline(e.target.value)}
                    placeholder="4 – 6 Weeks"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Statutory Fee Note
                  </label>
                  <input
                    type="text"
                    value={subFeeNote}
                    onChange={(e) => setSubFeeNote(e.target.value)}
                    placeholder="KSh 20,000 Processing + Annual Fee"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                    Governing Act / Statute
                  </label>
                  <input
                    type="text"
                    value={subStatutoryNote}
                    onChange={(e) => setSubStatutoryNote(e.target.value)}
                    placeholder="Kenya Citizenship & Immigration Act"
                    className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  Mandatory Requirements Checklist (One per line)
                </label>
                <textarea
                  rows={3}
                  value={subRequirementsText}
                  onChange={(e) => setSubRequirementsText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1">
                  Step-by-Step Filing Procedure (One step per line)
                </label>
                <textarea
                  rows={3}
                  value={subStepsText}
                  onChange={(e) => setSubStepsText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] cursor-pointer"
              >
                Add Sub-Category to Service
              </button>
            </form>

            {/* Directory of All Sub-Categories by Parent Category */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-editorial text-2xl text-[#141413]">
                All Sub-Categories Across {serviceCategories.length} Pillars (
                {totalSubCategoriesCount})
              </h2>

              {serviceCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#EAE9E4]/50 border border-[#141413]/12 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#141413]/10 pb-2.5">
                    <div>
                      <span className="text-[11px] font-mono-num text-[#D94E34] uppercase">
                        {cat.agencyBadge}
                      </span>
                      <h3 className="font-editorial text-2xl text-[#141413]">
                        {cat.name} ({cat.subCategories.length})
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTargetParentCatId(cat.id)}
                      className="px-3 py-1 bg-[#141413] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-wider cursor-pointer"
                    >
                      + Add Here
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {cat.subCategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-[#F4F3EF] border border-[#141413]/10 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#141413] truncate">
                            {sub.name}
                          </p>
                          <p className="text-[10px] font-mono-num text-[#6E6D68] truncate">
                            {sub.portal} · {sub.timeline}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              navigate({
                                page: 'service-detail',
                                serviceId: cat.id,
                                subCategoryId: sub.id,
                              })
                            }
                            className="p-1 text-[#141413] hover:text-[#D94E34] cursor-pointer"
                            title="Open Full Service Page"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          {cat.subCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                deleteSubCategory(cat.id, sub.id);
                                showToast(`Removed "${sub.name}".`);
                              }}
                              className="p-1 text-[#6E6D68] hover:text-[#D94E34] cursor-pointer"
                              title="Remove Sub-Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: CONSULTATION BOOKINGS MANAGER
           =================================================================== */}
        {activeSection === 'consultations' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {(
                  [
                    'All',
                    'Pending Review',
                    'Confirmed',
                    'Completed',
                    'Cancelled',
                  ] as const
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => setConsultationFilter(st)}
                    className={`px-3.5 py-2 text-xs font-mono-num uppercase tracking-wider cursor-pointer ${
                      consultationFilter === st
                        ? 'bg-[#141413] text-[#F4F3EF]'
                        : 'bg-[#EAE9E4] text-[#5E5D59] hover:text-[#141413]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono-num text-[#6E6D68]">
                Showing {filteredConsultations.length} of {consultations.length}{' '}
                Bookings
              </span>
            </div>

            <div className="space-y-4">
              {filteredConsultations.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-[#EAE9E4]/60 border border-[#141413]/14 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num">
                      <span className="px-2 py-0.5 bg-[#141413] text-[#F4F3EF]">
                        {booking.reference}
                      </span>
                      <span className="text-[#D94E34] font-semibold">
                        {booking.serviceCategoryName} → {booking.subCategoryName}
                      </span>
                      <span>·</span>
                      <span className="text-[#5E5D59]">
                        Preferred Date: <strong>{booking.preferredDate}</strong>
                      </span>
                      <span>·</span>
                      <span className="text-[#1F6F43] font-semibold">
                        {booking.format}
                      </span>
                    </div>

                    <h3 className="font-editorial text-2xl text-[#141413]">
                      {booking.clientName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E5D59]">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {booking.clientEmail}
                      </span>
                      <span className="flex items-center gap-1 font-mono-num">
                        <Phone className="w-3.5 h-3.5" />
                        {booking.clientPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Booked: {booking.createdAt}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#141413] bg-[#F4F3EF] p-3 border border-[#141413]/10">
                      <strong>Case Summary:</strong> {booking.caseSummary}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    <select
                      value={booking.status}
                      onChange={(e) => {
                        updateConsultationStatus(
                          booking.id,
                          e.target.value as ConsultationStatus
                        );
                        showToast(
                          `Booking ${booking.reference} marked as ${e.target.value}.`
                        );
                      }}
                      className="px-3 py-2 bg-[#F4F3EF] border border-[#141413]/25 text-xs font-mono-num text-[#141413]"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        deleteConsultation(booking.id);
                        showToast(`Booking ${booking.reference} removed.`);
                      }}
                      className="px-3 py-2 border border-[#141413]/20 text-xs font-mono-num text-[#5E5D59] hover:text-[#D94E34] hover:border-[#D94E34] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 6: CLIENT INQUIRIES INBOX
           =================================================================== */}
        {activeSection === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {(['All', 'New', 'In Progress', 'Resolved'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setInquiryFilter(st)}
                      className={`px-3.5 py-2 text-xs font-mono-num uppercase tracking-wider cursor-pointer ${
                        inquiryFilter === st
                          ? 'bg-[#141413] text-[#F4F3EF]'
                          : 'bg-[#EAE9E4] text-[#5E5D59] hover:text-[#141413]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
              <span className="text-xs font-mono-num text-[#6E6D68]">
                Showing {filteredInquiries.length} of {inquiries.length} Client
                Inquiries
              </span>
            </div>

            <div className="space-y-4">
              {filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-[#EAE9E4]/60 border border-[#141413]/14 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num">
                      <span className="px-2 py-0.5 bg-[#141413] text-[#F4F3EF]">
                        {inq.reference}
                      </span>
                      <span className="text-[#D94E34] font-semibold">
                        {inq.topic}
                      </span>
                      <span>·</span>
                      <span className="text-[#5E5D59]">
                        Source: {inq.source}
                      </span>
                      <span>·</span>
                      <span className="text-[#6E6D68]">{inq.createdAt}</span>
                    </div>

                    <h3 className="font-editorial text-2xl text-[#141413]">
                      {inq.fullName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E5D59]">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {inq.email}
                      </span>
                      <span className="flex items-center gap-1 font-mono-num">
                        <Phone className="w-3.5 h-3.5" />
                        {inq.phone}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#141413] bg-[#F4F3EF] p-3 border border-[#141413]/10">
                      {inq.message}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                    <select
                      value={inq.status}
                      onChange={(e) => {
                        updateInquiryStatus(
                          inq.id,
                          e.target.value as InquiryStatus
                        );
                        showToast(
                          `Inquiry ${inq.reference} marked as ${e.target.value}.`
                        );
                      }}
                      className="px-3 py-2 bg-[#F4F3EF] border border-[#141413]/25 text-xs font-mono-num text-[#141413]"
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        deleteInquiry(inq.id);
                        showToast(`Inquiry ${inq.reference} deleted.`);
                      }}
                      className="px-3 py-2 border border-[#141413]/20 text-xs font-mono-num text-[#5E5D59] hover:text-[#D94E34] hover:border-[#D94E34] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 7: READER DONATIONS & PORTAL SETTINGS
           =================================================================== */}
        {activeSection === 'donations' && (
          <div className="space-y-8">
            <div className="bg-[#EAE9E4]/60 border border-[#141413]/14 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono-num uppercase tracking-wider text-[#D94E34]">
                  READER CONTRIBUTIONS LEDGER
                </p>
                <h2 className="font-editorial text-3xl text-[#141413]">
                  Total Reader Donations: KSh{' '}
                  {totalDonationsKsh.toLocaleString()}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetAllToDefaults();
                  showToast('Portal data restored to default catalog.');
                }}
                className="px-4 py-2.5 border border-[#141413]/25 text-xs font-mono-num uppercase tracking-wider hover:border-[#141413] flex items-center gap-2 cursor-pointer self-start"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data to Defaults</span>
              </button>
            </div>

            <div className="space-y-3">
              {donations.map((don) => (
                <div
                  key={don.id}
                  className="p-4 bg-[#F4F3EF] border border-[#141413]/12 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono-num text-[#6E6D68]">
                      <span className="text-[#141413] font-semibold">
                        {don.reference}
                      </span>
                      <span>·</span>
                      <span className="text-[#1F6F43] font-semibold">
                        {don.method}
                      </span>
                      <span>·</span>
                      <span>{don.createdAt}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#141413] mt-0.5">
                      {don.donorName} ({don.contact}) —{' '}
                      <span className="text-[#D94E34] font-mono-num">
                        KSh {don.amount.toLocaleString()}
                      </span>
                    </p>
                    <p className="text-xs text-[#5E5D59]">
                      Article: {don.blogTitle}{' '}
                      {don.note ? `· Note: "${don.note}"` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 8: SEO & SOCIAL META TAGS MANAGER
           =================================================================== */}
        {activeSection === 'seo' && <AdminSeoManager />}
      </div>
    </div>
  );
};
