import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';
import { ProductCard } from './ProductCard';

export const WishlistView: React.FC = () => {
  const { products, wishlist, navigate } = useStore();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-[75vh] max-w-[1440px] mx-auto px-4 sm:px-8 py-12">
      <div className="pb-8 border-b border-[#141413]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono-num uppercase tracking-[0.22em] text-[#6E6D68] mb-2">
            SERIKALI GUIDE · SAVED ARCHIVE
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[#141413]">
            Saved Items ({wishlistedProducts.length})
          </h1>
        </div>
        <button
          onClick={() => navigate({ page: 'home' })}
          className="text-xs font-mono-num uppercase tracking-widest text-[#141413] hover:opacity-70 flex items-center gap-1.5 cursor-pointer self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <h2 className="font-editorial text-3xl text-[#141413]">
            No saved items yet.
          </h2>
          <button
            onClick={() => navigate({ page: 'home' })}
            className="px-6 py-2.5 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-widest cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export const InfoSectionView: React.FC<{
  section:
    | 'about'
    | 'delivery'
    | 'returns'
    | 'warranty'
    | 'faq'
    | 'contact'
    | 'privacy'
    | 'terms';
}> = ({ section }) => {
  const { navigate } = useStore();

  const contentMap = {
    about: {
      kicker: 'ABOUT · SERIKALI GUIDE',
      title: 'Your One Border Stop Post for Immigration & Government Services.',
      body: [
        'Serikali Guide is an independent immigration blog and regulatory advisory platform helping citizens, expatriates, investors, and NGOs navigate Kenyan government procedures with confidence.',
        'We publish verified step-by-step guides across Immigration & Visas, Business & Company Registration, NGO & Nonprofit Registration, Government Documents, Licences & Permits, Tax & Compliance, Investment & Relocation, and eCitizen Government Services.',
      ],
    },
    delivery: {
      kicker: 'DOCUMENTATION · PROCESSING & TIMELINES',
      title: 'Transparent Statutory Timelines & Portal Tracking.',
      body: [
        'Every guide on Serikali Guide lists realistic processing windows across eFNS, eCitizen BRS, PBORA, and KRA iTax.',
      ],
    },
    returns: {
      kicker: 'CLIENT GUARANTEE · ADVISORY STANDARDS',
      title: 'Verified Regulatory Accuracy.',
      body: [
        'Our checklists are continuously updated to reflect the latest Kenya Gazette notices, Finance Acts, and eCitizen workflow updates.',
      ],
    },
    warranty: {
      kicker: 'COMPLIANCE · STATUTORY ASSURANCE',
      title: 'Direct Filing on Official Government Portals.',
      body: [
        'All applications are lodged directly through official Kenyan government portals (eCitizen, eFNS, iTax, Ardhisasa, PBORA).',
      ],
    },
    faq: {
      kicker: 'SUPPORT · FREQUENTLY ASKED QUESTIONS',
      title: 'Common Questions on Visas, Permits & Registration.',
      body: [
        'How long does a Kenyan Work Permit take? — Standard Class D, G, and K permits take 6 to 12 weeks via the eFNS portal.',
        'Can a foreigner own 100% of a Kenyan company? — Yes, foreign nationals can register a 100% foreign-owned Private Limited Company on BRS eCitizen.',
      ],
    },
    contact: {
      kicker: 'ADVISORY DESK · CONTACT SERIKALI GUIDE',
      title: 'Speak with Our Nairobi Immigration & Corporate Desk.',
      body: [
        'Address: Kenyatta Avenue, Pioneer House, 5th Floor, Nairobi CBD, Kenya.',
        'Helpline & WhatsApp: 0795762978 (+254 795 762 978) · Email: advisory@serikaliguide.co.ke',
      ],
    },
    privacy: {
      kicker: 'LEGAL · PRIVACY POLICY',
      title: 'Client Dossier & Data Confidentiality.',
      body: [
        'Serikali Guide adheres strictly to the Kenya Data Protection Act, 2019 (ODPC). Client passport, corporate, and tax records are kept strictly confidential.',
      ],
    },
    terms: {
      kicker: 'LEGAL · TERMS OF USE',
      title: 'Editorial & Advisory Terms.',
      body: [
        'Our blog guides provide detailed procedural information based on Kenyan statutory law. For case-specific representation, book a Free Consultation with our licensed specialists.',
      ],
    },
  }[section];

  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-6">
      <button
        onClick={() => navigate({ page: 'home' })}
        className="text-xs font-mono-num uppercase tracking-widest text-[#6E6D68] hover:text-[#141413] flex items-center gap-1.5 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      <p className="text-[11px] font-mono-num uppercase tracking-[0.22em] text-[#6E6D68]">
        {contentMap.kicker}
      </p>
      <h1 className="font-editorial text-3xl sm:text-5xl text-[#141413]">
        {contentMap.title}
      </h1>
      <div className="space-y-4 pt-4 border-t border-[#141413]/10 text-sm text-[#5E5D59] leading-relaxed">
        {contentMap.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  const { navigate, showToast } = useStore();
  const {
    serviceCategories,
    t,
    openGetStarted,
    openTrackModal,
    addNewsletterSubscriber,
  } = useSerikali();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address to subscribe.');
      return;
    }
    const res = addNewsletterSubscriber(email, 'Website Footer');
    setIsSubscribed(true);
    setNewsletterEmail('');
    showToast(
      res.message ||
        `Subscribed (${email}) to Serikali Guide Immigration & Regulatory Briefings`
    );
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#F4F3EF] border-t border-[#141413]/12 text-[#141413]"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-12 pb-24 md:pb-12">
        {/* TOP ROW: Brand Identity + Newsletter Subscription */}
        <div className="pb-8 border-b border-[#141413]/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                aria-hidden="true"
                className="w-7 h-7 shrink-0"
              >
                <rect width="32" height="32" rx="4" fill="#141413" />
                <path
                  d="M8 10h16v2.5H17.25V23h-2.5V12.5H8V10z"
                  fill="#F4F3EF"
                />
                <circle cx="22" cy="20.5" r="2.5" fill="#D94E34" />
              </svg>
              <button
                onClick={() => navigate({ page: 'home' })}
                className="text-base sm:text-lg font-semibold tracking-[0.18em] uppercase text-[#141413] cursor-pointer"
              >
                SERIKALI GUIDE
              </button>
            </div>
            <p className="text-xs text-[#5E5D59] max-w-md">
              Your one border stop post. Independent immigration, business
              registration, NGO compliance, KRA tax &amp; government services
              guides in Kenya.
            </p>
          </div>

          <form
            onSubmit={handleNewsletterSubmit}
            className="w-full lg:w-auto lg:min-w-[420px]"
          >
            <label
              htmlFor="footer-newsletter-input"
              className="block text-[10px] font-mono-num uppercase tracking-[0.18em] text-[#6E6D68] mb-1.5"
            >
              Subscribe for Regulatory Updates &amp; New Blog Guides
            </label>
            <div className="flex items-stretch">
              <input
                id="footer-newsletter-input"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (isSubscribed) setIsSubscribed(false);
                }}
                placeholder="Enter your email address..."
                className="flex-1 min-w-0 bg-[#EAE9E4]/75 border border-[#141413]/20 focus:border-[#141413] focus:outline-none px-3.5 py-2.5 text-xs text-[#141413] placeholder:text-[#8E8D87]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#141413] text-[#F4F3EF] text-[11px] font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#36B37E]" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* MIDDLE ROW: Practice Areas & Navigation */}
        <div className="py-8 border-b border-[#141413]/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Advisory Contact Info */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#6E6D68]">
              Nairobi Advisory Desk
            </p>
            <div className="text-xs text-[#5E5D59] space-y-1.5">
              <p className="font-medium text-[#141413] flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#D94E34]" />
                <span>
                  Pioneer House, 5th Floor, Kenyatta Avenue, Nairobi CBD, Kenya
                </span>
              </p>
              <p className="pl-5 font-mono-num text-[11px]">
                Helpline:{' '}
                <a
                  href="tel:+254795762978"
                  className="text-[#141413] font-semibold hover:underline"
                >
                  0795762978 (+254 795 762 978)
                </a>{' '}
                · advisory@serikaliguide.co.ke
              </p>
            </div>

            <div className="pl-5 pt-1 flex flex-wrap items-center gap-2">
              <button
                onClick={() => openGetStarted()}
                className="px-3 py-1.5 bg-[#141413] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#2B2B28] transition-colors cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3 text-[#D94E34]" />
              </button>
              <button
                onClick={() => openTrackModal()}
                className="px-3 py-1.5 bg-[#EAE9E4] text-[#141413] text-[10px] font-mono-num uppercase tracking-wider inline-flex items-center gap-1.5 border border-[#141413]/20 hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                <span>Track Request</span>
              </button>
              <button
                onClick={() => navigate({ page: 'consultation' })}
                className="px-3 py-1.5 bg-[#EAE9E4] text-[#141413] text-[10px] font-mono-num uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors cursor-pointer"
              >
                <Calendar className="w-3 h-3 text-[#D94E34]" />
                <span>Consultation</span>
              </button>
              <a
                href="https://wa.me/254795762978?text=Hello%20Serikali%20Guide!%20I%20have%20an%20inquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#1F6F43] text-[#F4F3EF] text-[10px] font-mono-num uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#185835] transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Service Categories Column 1 */}
          <div className="md:col-span-3 space-y-2">
            <p className="text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#6E6D68]">
              Core Services (1–4)
            </p>
            <ul className="space-y-1.5 text-xs text-[#5E5D59]">
              {serviceCategories.slice(0, 4).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() =>
                      navigate({ page: 'service-subcategories', serviceId: s.id })
                    }
                    className="hover:text-[#141413] transition-colors cursor-pointer text-left"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Categories Column 2 */}
          <div className="md:col-span-3 space-y-2">
            <p className="text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#6E6D68]">
              Core Services (5–{serviceCategories.length})
            </p>
            <ul className="space-y-1.5 text-xs text-[#5E5D59]">
              {serviceCategories.slice(4).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() =>
                      navigate({ page: 'service-subcategories', serviceId: s.id })
                    }
                    className="hover:text-[#141413] transition-colors cursor-pointer text-left"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Column (Includes Legal & Admin links) */}
          <div className="md:col-span-2 space-y-3">
            <div>
              <p className="text-[11px] font-mono-num uppercase tracking-[0.18em] text-[#6E6D68] mb-2">
                {t.footerNavigation}
              </p>
              <ul className="space-y-1.5 text-xs text-[#5E5D59]">
                <li>
                  <button
                    onClick={() => openGetStarted()}
                    className="hover:text-[#141413] text-[#141413] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Get Started</span>
                    <span className="text-[10px] text-[#D94E34]">★</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openTrackModal()}
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    Track Service Request
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate({ page: 'home' })}
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    {t.navHome}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate({ page: 'about' })}
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    {t.navAbout}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    {t.navBlogs}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate({ page: 'contact' })}
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    {t.navContact}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate({ page: 'consultation' })}
                    className="hover:text-[#141413] text-[#D94E34] font-medium transition-colors cursor-pointer"
                  >
                    {t.navFreeConsultation}
                  </button>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[#141413]/12">
              <p className="text-[10px] font-mono-num uppercase tracking-[0.18em] text-[#6E6D68] mb-1.5">
                Legal &amp; ODPC
              </p>
              <ul className="space-y-1 text-xs text-[#5E5D59]">
                <li>
                  <button
                    onClick={() => navigate({ page: 'privacy' })}
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate({ page: 'terms' })}
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('openCookieBanner'))
                    }
                    className="hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    Cookie Preferences
                  </button>
                </li>
                <li className="pt-1">
                  <button
                    onClick={() => navigate({ page: 'admin' })}
                    className="text-[#141413] hover:text-[#D94E34] font-mono-num text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{t.footerAdminLink || 'Admin Portal'}</span>
                    <ArrowRight className="w-3 h-3 text-[#D94E34]" />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT STRIP */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6E6D68]">
          <p>© {new Date().getFullYear()} SERIKALI GUIDE. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono-num text-[11px]">
            <button
              onClick={() => navigate({ page: 'privacy' })}
              className="hover:text-[#141413] underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => navigate({ page: 'terms' })}
              className="hover:text-[#141413] underline transition-colors cursor-pointer"
            >
              Terms of Use
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent('openCookieBanner'))
              }
              className="hover:text-[#141413] underline transition-colors cursor-pointer"
            >
              Cookie Settings
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => navigate({ page: 'admin' })}
              className="uppercase tracking-wider text-[#141413] hover:text-[#D94E34] font-semibold cursor-pointer"
            >
              {t.footerAdminLink || 'Admin Portal'}
            </button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
