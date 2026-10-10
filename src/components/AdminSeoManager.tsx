import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  Share2,
  FileText,
  Layers,
  Compass,
  Loader2,
} from 'lucide-react';
import { useSerikali, SeoPageMetadata } from '../context/SerikaliContext';
import { useStore } from '../context/StoreContext';

interface SeoItem {
  key: string;
  type: 'core' | 'blog' | 'service';
  label: string;
  slug: string;
  currentTitle: string;
  currentDescription: string;
  currentOgImage: string;
  currentKeywords: string;
  isCustomized: boolean;
}

export const AdminSeoManager: React.FC = () => {
  const {
    blogPosts,
    serviceCategories,
    seoOverrides,
    getSeoForPage,
    updateSeoForPage,
    resetSeoForPage,
  } = useSerikali();
  const { showToast, navigate } = useStore();

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'core' | 'blog' | 'service'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('home');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Edit form state
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [ogImageInput, setOgImageInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');

  // Assemble list of all SEO items
  const allItems: SeoItem[] = useMemo(() => {
    const list: SeoItem[] = [];

    // 1. Core Pages
    const corePages = [
      { key: 'home', label: 'Home Page', slug: '/' },
      { key: 'about', label: 'About Us Page', slug: '/about' },
      { key: 'blogs', label: 'All Blogs Archive', slug: '/blogs' },
      { key: 'contact', label: 'Contact Advisory Desk', slug: '/contact' },
      { key: 'consultation', label: 'Free Consultation Booking', slug: '/consultation' },
      { key: 'privacy', label: 'Privacy & Data Protection Policy', slug: '/privacy' },
      { key: 'terms', label: 'Terms of Use & Statutory Disclaimers', slug: '/terms' },
    ];

    corePages.forEach((cp) => {
      const seo = getSeoForPage(cp.key);
      list.push({
        key: cp.key,
        type: 'core',
        label: cp.label,
        slug: cp.slug,
        currentTitle: seo.title,
        currentDescription: seo.description,
        currentOgImage: seo.ogImage,
        currentKeywords: seo.keywords || '',
        isCustomized: Boolean(seoOverrides[cp.key]),
      });
    });

    // 2. Service Pillars
    serviceCategories.forEach((cat) => {
      const key = `service:${cat.id}`;
      const seo = getSeoForPage(key);
      list.push({
        key,
        type: 'service',
        label: cat.name,
        slug: `/service/${cat.id}`,
        currentTitle: seo.title,
        currentDescription: seo.description,
        currentOgImage: seo.ogImage,
        currentKeywords: seo.keywords || '',
        isCustomized: Boolean(seoOverrides[key]),
      });
    });

    // 3. Blog Guides
    blogPosts.forEach((post) => {
      const key = `blog:${post.id}`;
      const seo = getSeoForPage(key);
      list.push({
        key,
        type: 'blog',
        label: post.title,
        slug: `/blog/${post.slug || post.id}`,
        currentTitle: seo.title,
        currentDescription: seo.description,
        currentOgImage: seo.ogImage,
        currentKeywords: seo.keywords || '',
        isCustomized: Boolean(seoOverrides[key]),
      });
    });

    return list;
  }, [blogPosts, serviceCategories, seoOverrides, getSeoForPage]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (activeFilter !== 'all' && item.type !== activeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          item.currentTitle.toLowerCase().includes(q) ||
          item.currentDescription.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allItems, activeFilter, searchQuery]);

  // Current item being edited
  const selectedItem = useMemo(() => {
    return allItems.find((i) => i.key === selectedKey) || allItems[0];
  }, [allItems, selectedKey]);

  // Sync edit form when selectedItem changes
  React.useEffect(() => {
    if (selectedItem) {
      setTitleInput(selectedItem.currentTitle);
      setDescInput(selectedItem.currentDescription);
      setOgImageInput(selectedItem.currentOgImage);
      setKeywordsInput(selectedItem.currentKeywords);
    }
  }, [selectedItem?.key, selectedItem?.currentTitle]);

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !descInput.trim()) {
      showToast('Meta title and description cannot be empty.');
      return;
    }

    updateSeoForPage(selectedKey, {
      title: titleInput.trim(),
      description: descInput.trim(),
      ogImage: ogImageInput.trim() || 'https://serikaliguide.co.ke/og-image.svg',
      keywords: keywordsInput.trim(),
    });

    showToast(`SEO tags updated for "${selectedItem.label}"`);
  };

  // Reset to default
  const handleReset = () => {
    resetSeoForPage(selectedKey);
    const defaultSeo = getSeoForPage(selectedKey);
    setTitleInput(defaultSeo.title);
    setDescInput(defaultSeo.description);
    setOgImageInput(defaultSeo.ogImage);
    setKeywordsInput(defaultSeo.keywords || '');
    showToast(`Reset "${selectedItem.label}" to default metadata.`);
  };

  // AI SEO Optimizer using Gemini
  const handleAiOptimize = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-serikali-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Optimize SEO meta title, meta description, and keywords for Kenya page: ${selectedItem.label}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.metaTitle) setTitleInput(data.metaTitle);
        if (data.metaDescription) setDescInput(data.metaDescription);
        if (data.keywords && Array.isArray(data.keywords)) {
          setKeywordsInput(data.keywords.join(', '));
        }
        showToast('✨ AI generated optimized SEO tags!');
      } else {
        // Fallback synthesis
        setTitleInput(`${selectedItem.label} | Kenya Regulatory Guide 2026`);
        setDescInput(
          `Verified Kenya government statutory procedures, official portals, fees, and requirements for ${selectedItem.label}. Official 2026 compliance overview.`
        );
        showToast('✨ Smart SEO tags generated!');
      }
    } catch {
      setTitleInput(`${selectedItem.label} | Kenya Regulatory Guide 2026`);
      setDescInput(
        `Verified Kenya government statutory procedures, official portals, fees, and requirements for ${selectedItem.label}. Official 2026 compliance overview.`
      );
      showToast('✨ Smart SEO tags generated!');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = allItems.length;
    const optimalTitles = allItems.filter(
      (i) => i.currentTitle.length >= 30 && i.currentTitle.length <= 60
    ).length;
    const optimalDescriptions = allItems.filter(
      (i) => i.currentDescription.length >= 120 && i.currentDescription.length <= 165
    ).length;
    const customizedCount = allItems.filter((i) => i.isCustomized).length;
    return { total, optimalTitles, optimalDescriptions, customizedCount };
  }, [allItems]);

  // Length health helpers
  const titleLen = titleInput.length;
  const isTitleOptimal = titleLen >= 30 && titleLen <= 60;
  const descLen = descInput.length;
  const isDescOptimal = descLen >= 120 && descLen <= 165;

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Audit Metrics */}
      <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#141413]/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-[#D94E34]">
              <Globe className="w-3.5 h-3.5" />
              <span>SEO & Social Sharing Management</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#141413] mt-1">
              Search Visibility &amp; OpenGraph Control
            </h2>
            <p className="text-xs text-[#5E5D59] mt-1 max-w-2xl">
              Configure page-specific Google title tags, meta descriptions, and
              social share cards for blog posts, service pillars, and core pages
              to maximize SERP click-through rates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.open('/sitemap.xml', '_blank');
            }}
            className="px-3.5 py-2 border border-[#141413]/25 bg-[#F4F3EF] hover:bg-[#141413] hover:text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider transition-colors flex items-center gap-1.5 self-start lg:self-auto cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Inspect sitemap.xml</span>
          </button>
        </div>

        {/* Audit Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/10">
            <p className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
              Total Pages Tracked
            </p>
            <p className="font-editorial text-2xl text-[#141413] mt-0.5">
              {stats.total}
            </p>
          </div>
          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/10">
            <p className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
              Optimal Titles (30-60)
            </p>
            <p className="font-editorial text-2xl text-[#1F6F43] mt-0.5">
              {stats.optimalTitles}{' '}
              <span className="text-xs font-mono-num text-[#6E6D68]">
                / {stats.total}
              </span>
            </p>
          </div>
          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/10">
            <p className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
              Optimal Meta (120-165)
            </p>
            <p className="font-editorial text-2xl text-[#1F6F43] mt-0.5">
              {stats.optimalDescriptions}{' '}
              <span className="text-xs font-mono-num text-[#6E6D68]">
                / {stats.total}
              </span>
            </p>
          </div>
          <div className="p-3 bg-[#F4F3EF] border border-[#141413]/10">
            <p className="text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
              Customized Overrides
            </p>
            <p className="font-editorial text-2xl text-[#D94E34] mt-0.5">
              {stats.customizedCount}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column SEO Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Pages with Filter & Search */}
        <div className="lg:col-span-5 bg-[#EAE9E4]/40 border border-[#141413]/12 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-[#141413]/10">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 text-xs font-mono-num uppercase tracking-wider cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#141413] text-[#F4F3EF]'
                  : 'bg-[#F4F3EF] text-[#5E5D59] hover:text-[#141413]'
              }`}
            >
              All ({allItems.length})
            </button>
            <button
              onClick={() => setActiveFilter('blog')}
              className={`px-2.5 py-1 text-xs font-mono-num uppercase tracking-wider cursor-pointer ${
                activeFilter === 'blog'
                  ? 'bg-[#141413] text-[#F4F3EF]'
                  : 'bg-[#F4F3EF] text-[#5E5D59] hover:text-[#141413]'
              }`}
            >
              Blogs ({allItems.filter((i) => i.type === 'blog').length})
            </button>
            <button
              onClick={() => setActiveFilter('service')}
              className={`px-2.5 py-1 text-xs font-mono-num uppercase tracking-wider cursor-pointer ${
                activeFilter === 'service'
                  ? 'bg-[#141413] text-[#F4F3EF]'
                  : 'bg-[#F4F3EF] text-[#5E5D59] hover:text-[#141413]'
              }`}
            >
              Services ({allItems.filter((i) => i.type === 'service').length})
            </button>
            <button
              onClick={() => setActiveFilter('core')}
              className={`px-2.5 py-1 text-xs font-mono-num uppercase tracking-wider cursor-pointer ${
                activeFilter === 'core'
                  ? 'bg-[#141413] text-[#F4F3EF]'
                  : 'bg-[#F4F3EF] text-[#5E5D59] hover:text-[#141413]'
              }`}
            >
              Core ({allItems.filter((i) => i.type === 'core').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#6E6D68]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by page title or slug..."
              className="w-full pl-9 pr-3 py-2 bg-[#F4F3EF] border border-[#141413]/20 text-xs text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          {/* Item List */}
          <div className="max-h-[640px] overflow-y-auto space-y-2 pr-1">
            {filteredItems.map((item) => {
              const isSelected = item.key === selectedKey;
              return (
                <div
                  key={item.key}
                  onClick={() => setSelectedKey(item.key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedKey(item.key);
                    }
                  }}
                  className={`p-3 border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#F4F3EF] border-[#141413] shadow-[0_2px_8px_rgba(20,20,19,0.06)]'
                      : 'bg-[#F4F3EF]/60 border-[#141413]/10 hover:border-[#141413]/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono-num uppercase tracking-wider px-1.5 py-0.5 bg-[#141413]/10 text-[#141413]">
                      {item.type}
                    </span>
                    {item.isCustomized ? (
                      <span className="text-[10px] font-mono-num uppercase text-[#D94E34] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D94E34]" />
                        Customized
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono-num text-[#6E6D68]">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-[#141413] line-clamp-1">
                    {item.label}
                  </p>
                  <p className="text-[11px] font-mono-num text-[#6E6D68] truncate mt-0.5">
                    {item.slug}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-mono-num mt-2 pt-2 border-t border-[#141413]/10 text-[#5E5D59]">
                    <span>Title: {item.currentTitle.length}c</span>
                    <span>·</span>
                    <span>Desc: {item.currentDescription.length}c</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Previews & Interactive Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Previews Container */}
          <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#141413]/10">
              <div className="flex items-center gap-2 text-xs font-mono-num uppercase tracking-wider text-[#141413]">
                <Eye className="w-3.5 h-3.5 text-[#D94E34]" />
                <span>Live SERP &amp; OpenGraph Snippet Preview</span>
              </div>
              <span className="text-[11px] font-mono-num text-[#6E6D68]">
                Key: {selectedItem.key}
              </span>
            </div>

            {/* Google SERP Snippet Preview */}
            <div className="p-4 bg-white border border-[#141413]/15 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-[#202124] mb-0.5">
                <span className="w-4 h-4 rounded-full bg-[#141413] text-[#F4F3EF] flex items-center justify-center text-[9px] font-bold">
                  S
                </span>
                <span className="text-[11px] text-[#202124] font-medium">
                  Serikali Guide
                </span>
                <span className="text-[11px] text-[#5f6368]">
                  https://serikaliguide.co.ke{selectedItem.slug}
                </span>
              </div>
              <h3 className="text-base sm:text-lg text-[#1a0dab] hover:underline cursor-pointer font-sans leading-snug line-clamp-1">
                {titleInput || 'SERIKALI GUIDE — Your One Border Stop Post'}
              </h3>
              <p className="text-xs text-[#4d5156] font-sans leading-relaxed line-clamp-2">
                {descInput ||
                  'Kenya independent regulatory intelligence and procedural desk for expatriate work permits, foreign business registration, NGO compliance, and KRA tax filing.'}
              </p>
            </div>

            {/* Social Sharing Card Preview (Twitter/OpenGraph) */}
            <div className="p-4 bg-[#F4F3EF] border border-[#141413]/15 space-y-2">
              <div className="flex items-center gap-1 text-[11px] font-mono-num text-[#6E6D68] uppercase tracking-wider">
                <Share2 className="w-3 h-3 text-[#141413]" />
                <span>Social Share Card (OpenGraph / X / LinkedIn)</span>
              </div>
              <div className="border border-[#141413]/20 bg-white overflow-hidden max-w-md">
                <div className="aspect-[16/9] bg-[#EAE9E4] overflow-hidden relative">
                  {ogImageInput ? (
                    <img
                      src={ogImageInput}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://serikaliguide.co.ke/og-image.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-mono-num text-[#6E6D68]">
                      No Image Set
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[10px] font-mono-num text-[#6E6D68] uppercase">
                    serikaliguide.co.ke
                  </p>
                  <p className="text-xs font-semibold text-[#141413] line-clamp-1">
                    {titleInput || 'SERIKALI GUIDE'}
                  </p>
                  <p className="text-[11px] text-[#5E5D59] line-clamp-2 leading-snug">
                    {descInput}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Edit Form */}
          <form
            onSubmit={handleSave}
            className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#141413]/10">
              <h3 className="font-editorial text-xl text-[#141413]">
                Edit Meta Tags for: &ldquo;{selectedItem.label}&rdquo;
              </h3>
              <button
                type="button"
                onClick={handleAiOptimize}
                disabled={isGeneratingAi}
                className="px-3 py-1.5 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D94E34]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#D94E34]" />
                )}
                <span>Auto-Optimize with AI</span>
              </button>
            </div>

            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono-num uppercase tracking-wider text-[#141413]">
                  Meta Title Tag (`&lt;title&gt;` &amp; `og:title`) *
                </label>
                <span
                  className={`text-[11px] font-mono-num ${
                    isTitleOptimal
                      ? 'text-[#1F6F43] font-semibold'
                      : titleLen > 60
                      ? 'text-[#D94E34]'
                      : 'text-[#6E6D68]'
                  }`}
                >
                  {titleLen} / 60 characters{' '}
                  {isTitleOptimal ? '(Optimal)' : titleLen > 60 ? '(Too Long)' : '(Short)'}
                </span>
              </div>
              <input
                type="text"
                required
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Work Permits & Visas in Kenya | Serikali Guide"
                className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono-num uppercase tracking-wider text-[#141413]">
                  Meta Description (`&lt;meta name=&quot;description&quot;&gt;`) *
                </label>
                <span
                  className={`text-[11px] font-mono-num ${
                    isDescOptimal
                      ? 'text-[#1F6F43] font-semibold'
                      : descLen > 165
                      ? 'text-[#D94E34]'
                      : 'text-[#6E6D68]'
                  }`}
                >
                  {descLen} / 165 characters{' '}
                  {isDescOptimal ? '(Optimal)' : descLen > 165 ? '(Too Long)' : '(Short)'}
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="e.g. Comprehensive 2026 procedural dossier covering eligibility criteria, official filing portals, and statutory vetting steps in Kenya."
                className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            {/* OpenGraph Image URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono-num uppercase tracking-wider text-[#141413]">
                  OpenGraph Image URL (`og:image`)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setOgImageInput('https://serikaliguide.co.ke/og-image.svg')
                  }
                  className="text-[11px] font-mono-num text-[#D94E34] hover:underline cursor-pointer"
                >
                  Use Official Crest Asset
                </button>
              </div>
              <input
                type="url"
                value={ogImageInput}
                onChange={(e) => setOgImageInput(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            {/* Target Keywords */}
            <div>
              <label className="block text-xs font-mono-num uppercase tracking-wider text-[#141413] mb-1.5">
                Target Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="e.g. work permits Kenya, Class D permit, eFNS portal, immigration Nairobi"
                className="w-full px-3.5 py-2.5 bg-[#F4F3EF] border border-[#141413]/20 text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#141413]/10">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 border border-[#141413]/25 bg-[#F4F3EF] hover:bg-[#141413]/10 text-xs font-mono-num uppercase tracking-wider text-[#141413] flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Default</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#141413] hover:bg-[#2B2B28] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-[0.16em] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#D94E34]" />
                <span>Save Meta Tags</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
