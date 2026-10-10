import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Globe,
  Loader2,
  Menu,
  MessageCircle,
  Search,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  LANGUAGES,
  LanguageCode,
  useSerikali,
} from '../context/SerikaliContext';

export const Header: React.FC = () => {
  const { route, navigate, setIsSearchOpen } = useStore();
  const {
    language,
    setLanguage,
    t,
    serviceCategories,
    isTranslatingContent,
    openGetStarted,
    openTrackModal,
  } = useSerikali();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileNav = (action: () => void) => {
    setMobileMenuOpen(false);
    action();
  };

  const currentLangObj =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const primaryLinks: Array<{
    id: string;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = [
    {
      id: 'about',
      label: t.navAbout,
      isActive: route.page === 'about',
      onClick: () => navigate({ page: 'about' }),
    },
    {
      id: 'blogs',
      label: t.navBlogs,
      isActive: route.page === 'blogs' || route.page === 'blog-detail',
      onClick: () => navigate({ page: 'blogs', categoryId: 'all' }),
    },
    {
      id: 'contact',
      label: t.navContact,
      isActive: route.page === 'contact',
      onClick: () => navigate({ page: 'contact' }),
    },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-[#F4F3EF]/95 backdrop-blur-md border-b border-[#141413]/12 shadow-[0_2px_20px_rgba(20,20,19,0.04)]'
            : 'bg-[#F4F3EF] border-b border-[#141413]/10'
        }`}
      >
        {/* =================================================================
            ROW 1: MAIN HEADER BAR (Desktop, Tablet & Mobile)
            Ultra-compact on Mobile & Tablet to maximize viewport space
           ================================================================= */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-14 lg:h-16 flex items-center justify-between gap-2">
          {/* ZONE 1: Brand Wordmark with Crest */}
          <div className="flex items-center gap-2 shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="w-5 h-5 sm:w-6 sm:h-6 shrink-0"
            >
              <rect width="32" height="32" rx="4" fill="#141413" />
              <path d="M8 10h16v2.5H17.25V23h-2.5V12.5H8V10z" fill="#F4F3EF" />
              <circle cx="22" cy="20.5" r="2.5" fill="#D94E34" />
            </svg>
            <button
              onClick={() => navigate({ page: 'home' })}
              className="text-left text-xs sm:text-sm lg:text-base font-semibold tracking-[0.14em] sm:tracking-[0.18em] uppercase text-[#141413] hover:opacity-75 transition-opacity whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#141413]"
            >
              SERIKALI GUIDE
            </button>
          </div>

          {/* ZONE 2: Desktop Center Navigation (About, Blogs, Contact) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-[#5E5D59]"
          >
            {primaryLinks.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  item.isActive
                    ? 'text-[#141413] font-semibold'
                    : 'hover:text-[#141413]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#141413] transition-transform duration-200 origin-left ${
                    item.isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* ZONE 3: Language Button + Free Consultation CTA (Desktop Only) + Mobile/Tablet Drawer Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Natural Language Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search immigration & government services (Ctrl+K or Cmd+K)"
              title="Search immigration services (⌘K)"
              className="h-7 sm:h-8 px-2 sm:px-2.5 bg-[#EAE9E4] hover:bg-[#141413] text-[#141413] hover:text-[#F4F3EF] border border-[#141413]/20 text-[10px] sm:text-[11px] font-mono-num uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden md:inline font-semibold">Search</span>
              <kbd className="hidden xl:inline text-[9px] px-1 py-0.2 bg-[#141413]/10 text-[#5E5D59] rounded-xs font-mono-num group-hover:text-[#F4F3EF]">
                ⌘K
              </kbd>
            </button>

            {/* Ultra-Compact Language Switcher Button to Save Space */}
            <div ref={langMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                aria-label="Change website language"
                title={`Language: ${currentLangObj.nativeLabel}`}
                className="h-7 sm:h-8 px-1.5 sm:px-2 bg-[#EAE9E4] hover:bg-[#141413] text-[#141413] hover:text-[#F4F3EF] border border-[#141413]/20 text-[10px] sm:text-[11px] font-mono-num uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isTranslatingContent ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#D94E34]" />
                ) : (
                  <Globe className="w-3 h-3 shrink-0" />
                )}
                <span className="font-semibold">{currentLangObj.shortCode}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-70" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-[#F4F3EF] border border-[#141413] shadow-[0_14px_30px_rgba(20,20,19,0.16)] py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-[#141413]/10 text-[10px] font-mono-num uppercase tracking-wider text-[#6E6D68]">
                    Website Language
                  </div>
                  {LANGUAGES.map((lang) => {
                    const active = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code as LanguageCode);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#141413] text-[#F4F3EF] font-semibold'
                            : 'text-[#141413] hover:bg-[#EAE9E4]'
                        }`}
                      >
                        <span>
                          <strong className="font-mono-num mr-1.5">
                            {lang.shortCode}
                          </strong>
                          {lang.nativeLabel}
                        </span>
                        {active && <Check className="w-3.5 h-3.5 text-[#D94E34]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Get Started Guided Application CTA Button */}
            <button
              type="button"
              onClick={() => openGetStarted()}
              className="hidden sm:flex h-7.5 sm:h-8 lg:h-9 px-3 sm:px-3.5 bg-[#141413] text-[#F4F3EF] hover:bg-[#2B2B28] text-[10px] sm:text-xs font-mono-num uppercase tracking-[0.14em] font-semibold items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3 text-[#D94E34]" />
            </button>

            {/* Free Consultation CTA Button — Desktop ONLY (Removed from Mobile & Tablet to save space and remove red button) */}
            <button
              onClick={() => navigate({ page: 'consultation' })}
              className={`hidden lg:flex h-9 px-3.5 text-xs font-mono-num uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap shrink-0 items-center gap-1.5 border border-[#141413]/20 ${
                route.page === 'consultation'
                  ? 'bg-[#D94E34] text-[#F4F3EF] border-[#D94E34]'
                  : 'bg-[#EAE9E4] text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#D94E34] shrink-0" />
              <span>{t.navFreeConsultation}</span>
            </button>

            {/* Tablet & Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden flex items-center justify-center h-7.5 w-7.5 sm:h-8 sm:w-8 border border-[#141413]/20 bg-[#EAE9E4]/60 text-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* =================================================================
            ROW 2: TABLET & MOBILE NAVIGATION BAR (lg:hidden)
            Pure navigation: About, Blogs, Contact (No red consultation button)
            Compact to save vertical screen space on mobile & tablet
           ================================================================= */}
        <div className="lg:hidden border-t border-[#141413]/8 bg-[#EAE9E4]/60">
          <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-1 sm:py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => navigate({ page: 'home' })}
              className={`px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                route.page === 'home'
                  ? 'bg-[#141413] text-[#F4F3EF]'
                  : 'text-[#141413] hover:bg-[#141413]/10'
              }`}
            >
              {t.navHome}
            </button>

            {primaryLinks.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  item.isActive
                    ? 'bg-[#141413] text-[#F4F3EF]'
                    : 'text-[#141413] hover:bg-[#141413]/10'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => setIsSearchOpen(true)}
              className="px-2.5 py-1 text-xs font-medium text-[#141413] hover:bg-[#141413]/10 whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ===================================================================
          REVAMPED TABLET & MOBILE DRAWER (Slide-Over Panel)
          Clean Navigation Only: Home, About, Blogs, Contact, Consultation
         =================================================================== */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile and Tablet Navigation"
          className="fixed inset-0 z-50 bg-[#141413]/50 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F4F3EF] h-full flex flex-col justify-between overflow-y-auto shadow-2xl border-l border-[#141413]/15"
          >
            {/* Drawer Header */}
            <div className="px-5 h-14 sm:h-16 flex items-center justify-between border-b border-[#141413]/10 shrink-0 bg-[#EAE9E4]/60">
              <button
                onClick={() =>
                  handleMobileNav(() => navigate({ page: 'home' }))
                }
                className="text-sm font-semibold tracking-[0.16em] uppercase text-[#141413]"
              >
                SERIKALI GUIDE
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-9 h-9 flex items-center justify-center bg-[#F4F3EF] border border-[#141413]/15 text-[#141413] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body - Pure Navigation Only */}
            <div className="flex-1 p-5 space-y-6">
              {/* Primary Navigation Grid */}
              <div>
                <p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#6E6D68] mb-2.5">
                  {t.footerNavigation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      label: t.navHome,
                      desc: 'Return to Serikali Guide home',
                      active: route.page === 'home',
                      onClick: () => navigate({ page: 'home' }),
                    },
                    {
                      label: t.navAbout,
                      desc: 'Our advisory mission & background',
                      active: route.page === 'about',
                      onClick: () => navigate({ page: 'about' }),
                    },
                    {
                      label: t.navBlogs,
                      desc: 'Verified procedural guides & insights',
                      active:
                        route.page === 'blogs' || route.page === 'blog-detail',
                      onClick: () =>
                        navigate({ page: 'blogs', categoryId: 'all' }),
                    },
                    {
                      label: t.navContact,
                      desc: 'Office location & direct channels',
                      active: route.page === 'contact',
                      onClick: () => navigate({ page: 'contact' }),
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleMobileNav(item.onClick)}
                      className={`p-3.5 text-left border flex items-center justify-between transition-colors cursor-pointer ${
                        item.active
                          ? 'bg-[#141413] text-[#F4F3EF] border-[#141413]'
                          : 'bg-[#EAE9E4]/60 text-[#141413] border-[#141413]/12 hover:border-[#141413]'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-semibold block">
                          {item.label}
                        </span>
                        <span className={`text-[10px] block mt-0.5 ${item.active ? 'text-[#F4F3EF]/70' : 'text-[#6E6D68]'}`}>
                          {item.desc}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Language Grid inside Drawer */}
              <div>
                <p className="text-[10px] font-mono-num uppercase tracking-[0.2em] text-[#6E6D68] mb-2">
                  Language ({currentLangObj.nativeLabel})
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {LANGUAGES.map((lang) => {
                    const active = lang.code === language;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code as LanguageCode)}
                        className={`py-2 px-1.5 text-center border text-[11px] font-mono-num transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#141413] text-[#F4F3EF] border-[#141413] font-semibold'
                            : 'bg-[#F4F3EF] text-[#141413] border-[#141413]/15'
                        }`}
                      >
                        {lang.shortCode} · {lang.nativeLabel.slice(0, 6)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() =>
                    handleMobileNav(() => openGetStarted())
                  }
                  className="w-full py-3.5 px-4 bg-[#141413] text-[#F4F3EF] hover:bg-[#2B2B28] flex items-center justify-between text-xs font-mono-num uppercase tracking-wider cursor-pointer font-semibold shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D94E34]" />
                    <span>Get Started · Apply for Service</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#D94E34]" />
                </button>

                <button
                  onClick={() =>
                    handleMobileNav(() => openTrackModal())
                  }
                  className="w-full py-2.5 px-4 bg-[#EAE9E4] hover:bg-[#141413] hover:text-[#F4F3EF] border border-[#141413]/20 flex items-center justify-between text-xs font-mono-num uppercase tracking-wider cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-[#5E5D59]" />
                    <span>Track Existing Service Request</span>
                  </span>
                  <span className="text-[10px] opacity-60">Status</span>
                </button>

                <button
                  onClick={() =>
                    handleMobileNav(() => setIsSearchOpen(true))
                  }
                  className="w-full py-2.5 px-4 bg-[#F4F3EF] hover:bg-[#141413] hover:text-[#F4F3EF] border border-[#141413]/20 flex items-center justify-between text-xs font-mono-num uppercase tracking-wider cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Immigration Services</span>
                  </span>
                  <span className="text-[10px] opacity-60">⌘K</span>
                </button>

                <button
                  onClick={() =>
                    handleMobileNav(() => navigate({ page: 'consultation' }))
                  }
                  className="w-full py-3.5 px-4 bg-[#D94E34] hover:bg-[#c04129] text-[#F4F3EF] flex items-center justify-between text-xs font-mono-num uppercase tracking-wider cursor-pointer font-semibold shadow-md"
                >
                  <span>{t.navFreeConsultation}</span>
                  <Calendar className="w-4 h-4 text-[#F4F3EF]" />
                </button>

                <a
                  href="https://wa.me/254795762978?text=Hello%20Serikali%20Guide!%20I%20would%20like%20to%20book%20a%20free%20consultation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#1F6F43] text-[#F4F3EF] flex items-center justify-between text-xs font-mono-num uppercase tracking-wider"
                >
                  <span>WhatsApp Desk: 0795762978</span>
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-5 py-3.5 border-t border-[#141413]/10 bg-[#EAE9E4]/40 text-[11px] text-[#6E6D68] flex items-center justify-between">
              <span>Nairobi, Kenya</span>
              <span className="font-mono-num text-[#141413]">
                0795762978 (+254 795 762 978)
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
