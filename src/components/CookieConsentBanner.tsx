import React, { useEffect, useState } from 'react';
import { ShieldCheck, X, Cookie, Check } from 'lucide-react';
import { getCookieConsent, setCookieConsent, CookieConsentStatus } from '../utils/analytics';
import { useStore } from '../context/StoreContext';

export const CookieConsentBanner: React.FC = () => {
  const { navigate } = useStore();
  const [consent, setConsent] = useState<CookieConsentStatus>('all'); // Default to 'all' to avoid flash before checking
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const current = getCookieConsent();
    setConsent(current);
    if (current === 'undecided') {
      setIsVisible(true);
    }

    const handleConsentChange = (e: Event) => {
      const custom = e as CustomEvent<CookieConsentStatus>;
      setConsent(custom.detail);
      if (custom.detail !== 'undecided') {
        setIsVisible(false);
      }
    };

    const handleOpenBanner = () => {
      setIsVisible(true);
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange);
    window.addEventListener('openCookieBanner', handleOpenBanner);

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange);
      window.removeEventListener('openCookieBanner', handleOpenBanner);
    };
  }, []);

  if (!isVisible) return null;

  const handleAcceptAll = () => {
    setCookieConsent('all');
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    setCookieConsent('essential');
    setIsVisible(false);
  };

  return (
    <aside
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-[#141413] text-[#F4F3EF] border-t border-[#F4F3EF]/15 shadow-[0_-12px_36px_rgba(20,20,19,0.35)] animate-fadeIn"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="w-8 h-8 rounded-full bg-[#EAE9E4]/15 flex items-center justify-center shrink-0 mt-0.5 text-[#D94E34]">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              We use strictly essential storage for language settings and secure operations. With your permission, we also use privacy-friendly analytics to analyze guide readership and improve our advisory procedures.
            </p>
            <p className="text-[11px] text-[#A09F99] mt-1">
              Read our{' '}
              <button
                type="button"
                onClick={() => {
                  navigate({ page: 'privacy' });
                  setIsVisible(false);
                }}
                className="text-[#F4F3EF] underline hover:text-[#D94E34] transition-colors cursor-pointer"
              >
                Privacy &amp; Cookie Policy
              </button>{' '}
              for full details on data retention under the Kenya Data Protection Act, 2019.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-1 md:pt-0">
          <button
            type="button"
            onClick={handleRejectNonEssential}
            className="flex-1 md:flex-initial px-3.5 py-2 text-xs font-mono-num uppercase tracking-wider border border-[#F4F3EF]/30 hover:border-[#F4F3EF] hover:bg-[#F4F3EF]/10 text-[#F4F3EF] transition-colors cursor-pointer text-center"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 md:flex-initial px-4 py-2 text-xs font-mono-num uppercase tracking-wider bg-[#D94E34] hover:bg-[#C04129] text-[#F4F3EF] font-semibold transition-colors cursor-pointer text-center shadow-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            aria-label="Close banner without saving preferences"
            className="p-1.5 text-[#A09F99] hover:text-[#F4F3EF] transition-colors ml-1 hidden sm:block cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
