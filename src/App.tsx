/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { SerikaliProvider, useSerikali } from './context/SerikaliContext';
import { ServiceJourneyProvider } from './context/ServiceJourneyContext';
import { GetStartedFlow } from './components/GetStartedFlow';
import { ServiceTrackingModal } from './components/ServiceTrackingModal';
import { Header } from './components/Header';
import { BreadcrumbNav } from './components/BreadcrumbNav';
import { ShowroomStage } from './components/ShowroomStage';
import { HomeEditorialSections } from './components/HomeEditorialSections';
import {
  AboutView,
  BlogDetailView,
  BlogsIndexView,
  ContactView,
  FreeConsultationView,
  ServiceDetailView,
  ServiceSubCategoriesView,
} from './components/SerikaliViews';
import { SerikaliAdminDashboard } from './components/SerikaliAdminDashboard';
import { CategoryView } from './components/CategoryView';
import { ProductDetailView } from './components/ProductDetailView';
import { ClientPortalView } from './components/ClientPortalView';
import { CompareFloatingBar, CompareView } from './components/CompareView';
import { SearchOverlay } from './components/SearchOverlay';
import { CartAndCheckout } from './components/CartAndCheckout';
import {
  Footer,
  InfoSectionView,
  WishlistView,
} from './components/FooterAndSecondaryViews';
import {
  PrivacyPolicyView,
  TermsConditionsView,
  Custom404View,
} from './components/LegalViews';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import {
  CategoryCatalogSkeleton,
  ProductDetailSkeleton,
  ShowroomRailSkeleton,
} from './components/Skeletons';

const StorefrontRouter: React.FC = () => {
  const { route, isRouteLoading, toastMessage } = useStore();
  const {
    getSeoForPage,
    isTrackModalOpen,
    closeTrackModal,
    trackModalPreselectedRef,
  } = useSerikali();

  // Dynamic SEO Synchronization across page transitions
  useEffect(() => {
    let pageKey = 'home';
    if (route.page === 'blog-detail' && route.blogId) {
      pageKey = `blog:${route.blogId}`;
    } else if (
      (route.page === 'service-detail' ||
        route.page === 'service-subcategories') &&
      route.serviceId
    ) {
      pageKey = `service:${route.serviceId}`;
    } else {
      pageKey = route.page;
    }

    const seo = getSeoForPage(pageKey);
    if (!seo) return;

    // 1. Update Title Tag
    document.title = seo.title;

    // 2. Helper to set or update meta tag in document head
    const setMeta = (nameOrProp: string, isProp: boolean, content: string) => {
      if (!content) return;
      const selector = isProp
        ? `meta[property="${nameOrProp}"]`
        : `meta[name="${nameOrProp}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        if (isProp) {
          tag.setAttribute('property', nameOrProp);
        } else {
          tag.setAttribute('name', nameOrProp);
        }
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMeta('description', false, seo.description);
    if (seo.keywords) setMeta('keywords', false, seo.keywords);

    // OpenGraph Tags
    setMeta('og:title', true, seo.title);
    setMeta('og:description', true, seo.description);
    setMeta('og:image', true, seo.ogImage);

    // Twitter Card Tags
    setMeta('twitter:title', false, seo.title);
    setMeta('twitter:description', false, seo.description);
    setMeta('twitter:image', false, seo.ogImage);
  }, [route, getSeoForPage]);

  const routeKey =
    route.page === 'service-subcategories'
      ? `svc-subs-${route.serviceId}`
      : route.page === 'service-detail'
      ? `svc-${route.serviceId}-${route.subCategoryId || 'main'}`
      : route.page === 'blog-detail'
      ? `blog-${route.blogId}`
      : route.page === 'blogs'
      ? `blogs-${route.categoryId || 'all'}-${route.query || ''}`
      : route.page === 'consultation'
      ? `cons-${route.preselectedServiceId || 'none'}`
      : route.page === 'category'
      ? `cat-${route.categoryId}`
      : route.page === 'product'
      ? `prod-${route.productId}`
      : route.page === 'info'
      ? `info-${route.section}`
      : route.page;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F3EF] text-[#141413]">
      <Header />
      <BreadcrumbNav />

      <main className="flex-1">
        {isRouteLoading ? (
          route.page === 'home' ? (
            <ShowroomRailSkeleton />
          ) : route.page === 'blog-detail' ||
            route.page === 'service-detail' ||
            route.page === 'service-subcategories' ||
            route.page === 'product' ? (
            <ProductDetailSkeleton />
          ) : (
            <CategoryCatalogSkeleton />
          )
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={routeKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {route.page === 'home' && (
                <>
                  <ShowroomStage />
                  <HomeEditorialSections />
                </>
              )}

              {route.page === 'about' && <AboutView />}

              {route.page === 'blogs' && (
                <BlogsIndexView
                  initialCategoryId={route.categoryId}
                  initialQuery={route.query}
                />
              )}

              {route.page === 'blog-detail' && (
                <BlogDetailView blogId={route.blogId} />
              )}

              {route.page === 'service-subcategories' && (
                <ServiceSubCategoriesView serviceId={route.serviceId} />
              )}

              {route.page === 'service-detail' && (
                <ServiceDetailView
                  serviceId={route.serviceId}
                  subCategoryId={route.subCategoryId}
                />
              )}

              {route.page === 'contact' && <ContactView />}

              {route.page === 'consultation' && (
                <FreeConsultationView
                  preselectedServiceId={route.preselectedServiceId}
                  preselectedSubCategory={route.preselectedSubCategory}
                />
              )}

              {route.page === 'category' && (
                <CategoryView categoryId={route.categoryId} />
              )}

              {route.page === 'deals' && (
                <CategoryView categoryId="all" dealsOnly />
              )}

              {route.page === 'product' && (
                <ProductDetailView productId={route.productId} />
              )}

              {route.page === 'client-portal' && <ClientPortalView />}

              {route.page === 'compare' && <CompareView />}

              {route.page === 'wishlist' && <WishlistView />}

              {route.page === 'admin' && <SerikaliAdminDashboard />}

              {route.page === 'privacy' && <PrivacyPolicyView />}

              {route.page === 'terms' && <TermsConditionsView />}

              {route.page === 'not-found' && <Custom404View />}

              {route.page === 'info' &&
                (route.section === 'privacy' ? (
                  <PrivacyPolicyView />
                ) : route.section === 'terms' ? (
                  <TermsConditionsView />
                ) : (
                  <InfoSectionView section={route.section} />
                ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
      <CompareFloatingBar />
      <SearchOverlay />
      <CartAndCheckout />
      <CookieConsentBanner />
      <GetStartedFlow />
      <ServiceTrackingModal
        isOpen={isTrackModalOpen}
        onClose={closeTrackModal}
        initialReference={trackModalPreselectedRef}
      />

      {/* Direct WhatsApp Advisory Floating Button */}
      <a
        href="https://wa.me/254795762978?text=Hello%20Serikali%20Guide!%20I%20would%20like%20assistance%20with%20an%20immigration%20or%20government%20service%20application."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Serikali Guide on WhatsApp (0795762978)"
        className="fixed bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-auto sm:h-auto p-0 sm:px-4 sm:py-3 flex items-center justify-center gap-2.5 bg-[#1F6F43] hover:bg-[#185835] text-[#F4F3EF] rounded-full shadow-[0_12px_28px_rgba(20,20,19,0.22)] transition-all duration-200 hover:scale-105 group"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-mono-num uppercase tracking-wider font-medium hidden sm:inline">
          WhatsApp Desk
        </span>
      </a>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#141413] text-[#F4F3EF] px-5 py-3 text-xs font-mono-num uppercase tracking-widest shadow-xl border border-[#F4F3EF]/15 whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <StoreProvider>
        <SerikaliProvider>
          <ServiceJourneyProvider>
            <StorefrontRouter />
          </ServiceJourneyProvider>
        </SerikaliProvider>
      </StoreProvider>
    </AppErrorBoundary>
  );
}
