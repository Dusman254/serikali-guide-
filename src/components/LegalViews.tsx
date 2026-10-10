import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  Lock,
  Search,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useSerikali } from '../context/SerikaliContext';

export const PrivacyPolicyView: React.FC = () => {
  const { navigate } = useStore();
  const { t } = useSerikali();

  const handleOpenCookieBanner = () => {
    window.dispatchEvent(new CustomEvent('openCookieBanner'));
  };

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#141413]/10">
          <div className="flex items-center gap-2 text-xs text-[#5E5D59]">
            <button
              onClick={() => navigate({ page: 'home' })}
              className="hover:text-[#141413] cursor-pointer"
            >
              {t.navHome}
            </button>
            <span>/</span>
            <span className="text-[#141413] font-semibold">Privacy Policy</span>
          </div>

          <button
            onClick={() => navigate({ page: 'home' })}
            className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-75 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141413] text-[#F4F3EF] text-[11px] font-mono-num uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D94E34]" />
            <span>Kenya Data Protection Act, 2019 (ODPC) Aligned</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#141413] leading-[1.05]">
            Privacy &amp; Data Protection Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#5E5D59] mt-3 leading-relaxed">
            Effective Date: October 1, 2026 · Last Updated: October 2026. This policy outlines how Serikali Guide collects, utilizes, safeguards, and respects your personal and business information.
          </p>
        </div>

        {/* Main Content Articles */}
        <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-6 sm:p-10 space-y-8 text-sm text-[#2B2B28] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              1. Identity of the Data Controller
            </h2>
            <p>
              This website is operated by <strong>Serikali Guide Advisory Services</strong>, located at Pioneer House, 5th Floor, Kenyatta Avenue, Nairobi CBD, Kenya (Postal Address: P.O. Box 41280-00100 Nairobi, Kenya).
            </p>
            <p>
              We are committed to operating in full compliance with the <em>Kenya Data Protection Act, 2019</em>, administered by the Office of the Data Protection Commissioner (ODPC), and international best practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              2. How Submitted Form Information Is Handled
            </h2>
            <p>
              When you interact with Serikali Guide through our public forms, we collect only the minimum necessary information required to deliver the requested service:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Free Consultation Booking Form:</strong> We collect your full name, email address, phone/WhatsApp number, target service category, sub-category, preferred date, and case notes. This data is used solely to match you with a qualified immigration or corporate specialist and facilitate your complimentary advisory session.
              </li>
              <li>
                <strong>Contact / Callback Request Form:</strong> We collect your name, contact phone or email, and message inquiry to respond directly to your procedural questions.
              </li>
              <li>
                <strong>Reader Support &amp; Donations:</strong> We collect payment confirmation references, donor name, contact method, and amounts to generate digital payment receipts and comply with statutory bookkeeping rules.
              </li>
              <li>
                <strong>Zero Commercial Selling of Data:</strong> We will never sell, lease, monetize, or disclose your contact details or case facts to third-party marketing companies, advertisers, or unauthorized brokers.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              3. Information Security &amp; Encryption
            </h2>
            <p>
              All data transmitted to and from Serikali Guide is protected using modern Transport Layer Security (TLS 1.3 / HTTPS). Inbound form submissions are processed through secure server-side validation filters equipped with automated honeypot spam detection and rate-limiting safeguards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              4. Cookies and Local Storage Technologies
            </h2>
            <p>
              We employ transparent, privacy-centric cookie practices:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Strictly Essential Storage:</strong> Session tokens, language preferences (e.g. Swahili, English, French, Arabic), and offline translation memories required for application operation.
              </li>
              <li>
                <strong>Optional Analytics:</strong> Privacy-friendly aggregate performance metrics loaded only when you provide explicit consent through our Cookie Banner.
              </li>
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenCookieBanner}
                className="px-4 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] cursor-pointer"
              >
                Manage Cookie Preferences
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              5. Data Retention &amp; User Rights
            </h2>
            <p>
              Under sections 26 to 40 of the Kenya Data Protection Act, 2019, you retain the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Request a copy of any personal information held about you.</li>
              <li>Request the prompt rectification of inaccurate records.</li>
              <li>Request the permanent deletion (erasure) of your consultation or contact dossier.</li>
              <li>Object to or restrict specific processing operations.</li>
            </ul>
            <p className="mt-2">
              Consultation inquiries and contact submissions are held for a maximum of 12 months unless retained under an ongoing client advisory mandate.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              6. Data Protection Officer Contact
            </h2>
            <p>
              To exercise any of your statutory data rights, or if you have any questions regarding data confidentiality, reach our designated Data Compliance Desk:
            </p>
            <div className="p-4 bg-[#F4F3EF] border border-[#141413]/15 text-xs font-mono-num space-y-1">
              <p>Email: <strong>privacy@serikaliguide.co.ke</strong> (or <strong>advisory@serikaliguide.co.ke</strong>)</p>
              <p>Telephone / WhatsApp: 0795762978 (+254 795 762 978)</p>
              <p>Physical Address: Pioneer House, 5th Floor, Kenyatta Avenue, Nairobi CBD, Kenya</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export const TermsConditionsView: React.FC = () => {
  const { navigate } = useStore();
  const { t } = useSerikali();

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#141413]/10">
          <div className="flex items-center gap-2 text-xs text-[#5E5D59]">
            <button
              onClick={() => navigate({ page: 'home' })}
              className="hover:text-[#141413] cursor-pointer"
            >
              {t.navHome}
            </button>
            <span>/</span>
            <span className="text-[#141413] font-semibold">Terms &amp; Conditions</span>
          </div>

          <button
            onClick={() => navigate({ page: 'home' })}
            className="text-xs font-mono-num uppercase tracking-wider text-[#141413] hover:opacity-75 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </button>
        </div>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141413] text-[#F4F3EF] text-[11px] font-mono-num uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5 text-[#D94E34]" />
            <span>Editorial &amp; Advisory Terms</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#141413] leading-[1.05]">
            Terms &amp; Conditions of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#5E5D59] mt-3 leading-relaxed">
            Effective Date: October 1, 2026. Please review these terms carefully prior to utilizing the Serikali Guide digital showroom, blog guides, or booking complimentary consultations.
          </p>
        </div>

        {/* Content Articles */}
        <div className="bg-[#EAE9E4]/60 border border-[#141413]/12 p-6 sm:p-10 space-y-8 text-sm text-[#2B2B28] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              1. Informational &amp; Advisory Scope (Statutory Disclaimer)
            </h2>
            <p>
              Serikali Guide provides procedural editorial guides, statutory fee schedules, checklist documentation, and preliminary advisory consultations regarding Kenyan governmental and civic processes.
            </p>
            <p className="p-3 bg-[#F4F3EF] border-l-3 border-[#D94E34] text-xs">
              <strong>Notice:</strong> Serikali Guide is an independent private consultancy and civic publisher. We are not an official organ of the Republic of Kenya. Final statutory approvals, issuance of visas, grant of work permits, incorporation of companies, and issuance of tax compliance certificates remain at the sole lawful discretion of the relevant Kenyan government agencies (eCitizen, Directorate of Immigration Services, BRS, KRA, PBORA).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              2. User Obligations &amp; Document Accuracy
            </h2>
            <p>
              Clients and visitors agree to provide truthful, authentic, and complete information when submitting inquiries or consultation dossiers. The submission of fraudulent, falsified, or altered documentation is strictly prohibited under the Penal Code of Kenya and applicable immigration laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              3. Complimentary Consultation Terms
            </h2>
            <p>
              The complimentary 30-minute consultation is offered to assess your procedural eligibility, outline statutory requirements, and recommend filing strategies. The booking of a consultation does not create a formal attorney-client or representation relationship until an explicit formal engagement letter is signed by both parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              4. Intellectual Property &amp; Guide Reproduction
            </h2>
            <p>
              All published editorial articles, procedural flowcharts, interactive guides, software logic, and visual assets on Serikali Guide are the intellectual property of [COMPANY_NAME: Serikali Guide Advisory Services] and protected under the <em>Copyright Act of Kenya</em>. Uncredited reproduction or commercial scraping is prohibited without written authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              5. Limitation of Liability
            </h2>
            <p>
              While our editorial staff reviews all articles against the latest Kenya Gazette notices and Finance Acts, government regulations, statutory fees, and portal workflows (e.g. eCitizen system downtime) are subject to change by state authorities without prior notice. Serikali Guide shall not be liable for statutory delays or decisions made by public registries.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-editorial text-2xl text-[#141413] border-b border-[#141413]/10 pb-2">
              6. Governing Law &amp; Dispute Resolution
            </h2>
            <p>
              These Terms of Service are governed exclusively by the laws of the Republic of Kenya. Any dispute arising out of or in connection with this platform shall first be submitted to mutual amicable consultation, and if unresolved, referred to arbitration in Nairobi under the Arbitration Act, 1995.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const Custom404View: React.FC = () => {
  const { navigate } = useStore();
  const { serviceCategories } = useSerikali();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ page: 'blogs', categoryId: 'all', query: query.trim() });
    } else {
      navigate({ page: 'home' });
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-[#F4F3EF] text-[#141413] px-4 py-12 sm:py-20">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold">
          <span>Error 404 · Page Not Found</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl text-[#141413] leading-tight">
          The regulatory guide or page you are looking for does not exist.
        </h1>

        <p className="text-xs sm:text-sm text-[#5E5D59] max-w-lg mx-auto leading-relaxed">
          The link you followed may be outdated, moved, or misspelled. Use the search bar below or explore one of our core immigration, business, and civic service pillars.
        </p>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex items-center bg-[#EAE9E4] border border-[#141413]/25 p-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search work permits, BRS, KRA PIN..."
            className="flex-1 px-3 py-2 bg-transparent text-xs text-[#141413] placeholder:text-[#6E6D68] focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:bg-[#2B2B28]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Recommended Core Shortcuts */}
        <div className="pt-4 border-t border-[#141413]/10">
          <p className="text-[11px] font-mono-num uppercase tracking-wider text-[#6E6D68] mb-3">
            Recommended Destinations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => navigate({ page: 'home' })}
              className="px-4 py-2 bg-[#141413] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider hover:bg-[#2B2B28] cursor-pointer"
            >
              Home Page
            </button>
            <button
              onClick={() => navigate({ page: 'blogs', categoryId: 'all' })}
              className="px-4 py-2 border border-[#141413]/25 text-[#141413] text-xs font-mono-num uppercase tracking-wider hover:border-[#141413] cursor-pointer"
            >
              All Blog Guides
            </button>
            <button
              onClick={() => navigate({ page: 'consultation' })}
              className="px-4 py-2 bg-[#D94E34] text-[#F4F3EF] text-xs font-mono-num uppercase tracking-wider font-semibold cursor-pointer hover:bg-[#C04129]"
            >
              Free Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
