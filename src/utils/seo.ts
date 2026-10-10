/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SeoConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

const DEFAULT_ORIGIN = 'https://serikaliguide.co.ke';

export function updatePageSeo(config: SeoConfig): void {
  if (typeof document === 'undefined') return;

  const fullTitle = config.title.includes('SERIKALI GUIDE')
    ? config.title
    : `${config.title} — SERIKALI GUIDE`;

  document.title = fullTitle;

  // 1. Meta Description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', config.description);

  // 2. Canonical URL
  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : DEFAULT_ORIGIN;
  const canonicalUrl = `${currentOrigin}${config.canonicalPath || window.location.pathname || '/'}`;

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 3. OpenGraph tags
  const setMetaProperty = (prop: string, content: string) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaProperty('og:title', fullTitle);
  setMetaProperty('og:description', config.description);
  setMetaProperty('og:url', canonicalUrl);
  setMetaProperty('og:type', config.ogType || 'website');
  setMetaProperty('og:site_name', 'Serikali Guide');

  if (config.image) {
    setMetaProperty('og:image', config.image);
  }

  // 4. Twitter / X card tags
  const setMetaName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', fullTitle);
  setMetaName('twitter:description', config.description);
  if (config.image) {
    setMetaName('twitter:image', config.image);
  }
}
